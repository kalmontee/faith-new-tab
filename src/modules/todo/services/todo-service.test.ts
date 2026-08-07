import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getAllTodos, addTodo, toggleTodo, removeTodo } from './todo-service';
import type { TodoItem } from '@/shared/types/table';

// Mock the Dexie database — getAllTodos uses orderBy().toArray(),
// toggleTodo uses get() + update(), removeTodo uses delete().
vi.mock('@/shared/storage/app-db', () => ({
  db: {
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
};

function mockOrderByChain(result: TodoItem[]) {
  const mockToArray = vi.fn().mockResolvedValue(result);
  vi.mocked(db.todos.orderBy).mockReturnValue({
    toArray: mockToArray,
  } as unknown as ReturnType<typeof db.todos.orderBy>);
  return mockToArray;
}

// ── getAllTodos ──────────────────────────────────────────────────────────────

describe('getAllTodos', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns all todos in insertion order', async () => {
    mockOrderByChain([sampleTodo]);
    expect(await getAllTodos()).toEqual([sampleTodo]);
  });

  it('returns an empty array when there are no todos', async () => {
    mockOrderByChain([]);
    expect(await getAllTodos()).toEqual([]);
  });

  it('orders by createdAt', async () => {
    mockOrderByChain([]);
    await getAllTodos();
    expect(db.todos.orderBy).toHaveBeenCalledWith('createdAt');
  });
});

// ── addTodo ──────────────────────────────────────────────────────────────────

describe('addTodo', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2025, 5, 15, 12, 0, 0));
    vi.clearAllMocks();
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
