import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getAllTodos, addTodo, editTodo, toggleTodo, removeTodo, reorderTodos } from './todo-service';
import type { TodoItem } from '@/shared/types/table';

vi.mock('@/shared/storage/app-db', () => ({
  db: {
    // transaction(mode, table, cb) — invoke the callback so batched writes run.
    transaction: vi.fn((_mode: unknown, _table: unknown, cb: () => unknown) => cb()),
    todos: {
      orderBy: vi.fn(),
      add: vi.fn(),
      get: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

import { db } from '@/shared/storage/app-db';

// ── Helpers ───────────────────────────────────────────────────────────────

const sampleTodo: TodoItem = {
  id: 1,
  text: 'Read Psalm 23',
  completed: false,
  createdAt: 1_000_000,
  position: 0,
};

function mockOrderByChain(result: TodoItem[]) {
  const mockToArray = vi.fn().mockResolvedValue(result);
  vi.mocked(db.todos.orderBy).mockReturnValue({
    toArray: mockToArray,
  } as unknown as ReturnType<typeof db.todos.orderBy>);
  return mockToArray;
}

// addTodo derives the next position from the highest existing one via orderBy().last().
function mockOrderByLast(result: TodoItem | undefined) {
  const mockLast = vi.fn().mockResolvedValue(result);
  vi.mocked(db.todos.orderBy).mockReturnValue({
    last: mockLast,
  } as unknown as ReturnType<typeof db.todos.orderBy>);
  return mockLast;
}

// ── getAllTodos ──────────────────────────────────────────────────────────────

describe('getAllTodos', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns all todos in position order', async () => {
    mockOrderByChain([sampleTodo]);
    expect(await getAllTodos()).toEqual([sampleTodo]);
  });

  it('returns an empty array when there are no todos', async () => {
    mockOrderByChain([]);
    expect(await getAllTodos()).toEqual([]);
  });

  it('orders by the user-controlled position field', async () => {
    mockOrderByChain([]);
    await getAllTodos();
    expect(db.todos.orderBy).toHaveBeenCalledWith('position');
  });
});

// ── addTodo ──────────────────────────────────────────────────────────────────

describe('addTodo', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2025, 5, 15, 12, 0, 0));
    vi.clearAllMocks();
    mockOrderByLast(undefined); // empty list by default
    vi.mocked(db.todos.add).mockResolvedValue(42 as unknown as number);
  });

  afterEach(() => vi.useRealTimers());

  it('adds a new incomplete todo with the given text', async () => {
    await addTodo('Pray for patience');
    expect(db.todos.add).toHaveBeenCalledWith(expect.objectContaining({ text: 'Pray for patience', completed: false }));
  });

  it('stamps createdAt with the current timestamp', async () => {
    const now = Date.now();
    const result = await addTodo('Test');
    expect(result.createdAt).toBe(now);
  });

  it('returns the inserted todo with the database-generated id', async () => {
    const result = await addTodo('Test');
    expect(result.id).toBe(42);
    expect(result.text).toBe('Test');
  });

  it('trims whitespace from the todo text', async () => {
    await addTodo('  Trim me  ');
    expect(db.todos.add).toHaveBeenCalledWith(expect.objectContaining({ text: 'Trim me' }));
  });

  it('appends the new todo one past the highest existing position', async () => {
    mockOrderByLast({ ...sampleTodo, position: 2 });
    const result = await addTodo('Next up');
    expect(db.todos.add).toHaveBeenCalledWith(expect.objectContaining({ position: 3 }));
    expect(result.position).toBe(3);
  });

  it('starts the first todo at position 0 when the list is empty', async () => {
    mockOrderByLast(undefined);
    const result = await addTodo('First');
    expect(db.todos.add).toHaveBeenCalledWith(expect.objectContaining({ position: 0 }));
    expect(result.position).toBe(0);
  });
});

// ── editTodo ─────────────────────────────────────────────────────────────────

describe('editTodo', () => {
  beforeEach(() => vi.clearAllMocks());

  it('updates the text for the given id', async () => {
    await editTodo(1, 'Read Psalm 23 aloud');
    expect(db.todos.update).toHaveBeenCalledWith(1, { text: 'Read Psalm 23 aloud' });
  });

  it('trims whitespace before saving', async () => {
    await editTodo(1, '  Trim me  ');
    expect(db.todos.update).toHaveBeenCalledWith(1, { text: 'Trim me' });
  });

  it('ignores an empty edit rather than persisting a blank todo', async () => {
    await editTodo(1, '   ');
    expect(db.todos.update).not.toHaveBeenCalled();
  });
});

// ── toggleTodo ─────────────────────────────────────────────────────────────

describe('toggleTodo', () => {
  beforeEach(() => vi.clearAllMocks());

  it('marks an incomplete todo as complete', async () => {
    vi.mocked(db.todos.get).mockResolvedValue(sampleTodo);
    await toggleTodo(1);
    expect(db.todos.update).toHaveBeenCalledWith(1, { completed: true });
  });

  it('marks a complete todo as incomplete', async () => {
    vi.mocked(db.todos.get).mockResolvedValue({ ...sampleTodo, completed: true });
    await toggleTodo(1);
    expect(db.todos.update).toHaveBeenCalledWith(1, { completed: false });
  });

  it('does nothing when the todo does not exist', async () => {
    vi.mocked(db.todos.get).mockResolvedValue(undefined);
    await toggleTodo(999);
    expect(db.todos.update).not.toHaveBeenCalled();
  });
});

// ── removeTodo ───────────────────────────────────────────────────────────────

describe('removeTodo', () => {
  beforeEach(() => vi.clearAllMocks());

  it('deletes the todo with the given id', async () => {
    await removeTodo(1);
    expect(db.todos.delete).toHaveBeenCalledWith(1);
  });
});

// ── reorderTodos ─────────────────────────────────────────────────────────────

describe('reorderTodos', () => {
  beforeEach(() => vi.clearAllMocks());

  it('persists each id’s new position from its index in the ordered list', async () => {
    await reorderTodos([3, 1, 2]);

    expect(db.todos.update).toHaveBeenCalledWith(3, { position: 0 });
    expect(db.todos.update).toHaveBeenCalledWith(1, { position: 1 });
    expect(db.todos.update).toHaveBeenCalledWith(2, { position: 2 });
  });

  it('writes the reordering inside a single read-write transaction', async () => {
    await reorderTodos([1, 2]);
    expect(db.transaction).toHaveBeenCalledWith('rw', db.todos, expect.any(Function));
  });

  it('does nothing when given an empty list', async () => {
    await reorderTodos([]);
    expect(db.todos.update).not.toHaveBeenCalled();
  });
});
