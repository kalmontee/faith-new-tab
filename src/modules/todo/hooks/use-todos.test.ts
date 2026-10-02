import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { db } from '@/shared/storage/app-db';
import { useTodos } from './use-todos';
import * as todoService from '../services/todo-service';

beforeEach(async () => {
  await Promise.all(db.tables.map((table) => table.clear()));
});

async function renderLoaded() {
  const hook = renderHook(() => useTodos());
  await waitFor(() => expect(hook.result.current.isLoading).toBe(false));
  return hook;
}

const texts = (todos: { text: string }[]) => todos.map((t) => t.text);

describe('useTodos', () => {
  it('should start loading, then expose stored todos in position order', async () => {
    await db.todos.bulkAdd([
      { text: 'Second', completed: false, createdAt: 2, position: 1 },
      { text: 'First', completed: false, createdAt: 1, position: 0 },
    ] as never[]);
    const { result } = renderHook(() => useTodos());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.todos).toEqual([]);
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(texts(result.current.todos)).toEqual(['First', 'Second']);
  });

  it('should show an added todo without a manual re-read', async () => {
    const { result } = await renderLoaded();

    await act(async () => {
      await result.current.addTodo('Call a friend');
    });

    await waitFor(() => expect(texts(result.current.todos)).toEqual(['Call a friend']));
  });

  it('should toggle a todo', async () => {
    const { result } = await renderLoaded();
    await act(async () => {
      await result.current.addTodo('Read Psalm 23');
    });
    await waitFor(() => expect(result.current.todos).toHaveLength(1));

    await act(async () => {
      await result.current.toggleTodo(result.current.todos[0]!.id);
    });

    await waitFor(() => expect(result.current.todos[0]?.completed).toBe(true));
  });

  it('should edit a todo', async () => {
    const { result } = await renderLoaded();
    await act(async () => {
      await result.current.addTodo('Read Psalm 23');
    });
    await waitFor(() => expect(result.current.todos).toHaveLength(1));

    await act(async () => {
      await result.current.editTodo(result.current.todos[0]!.id, 'Read Psalm 23 aloud');
    });

    await waitFor(() => expect(result.current.todos[0]?.text).toBe('Read Psalm 23 aloud'));
  });

  it('should remove a todo', async () => {
    const { result } = await renderLoaded();
    await act(async () => {
      await result.current.addTodo('Read Psalm 23');
    });
    await waitFor(() => expect(result.current.todos).toHaveLength(1));

    await act(async () => {
      await result.current.removeTodo(result.current.todos[0]!.id);
    });

    await waitFor(() => expect(result.current.todos).toEqual([]));
  });

  it('should apply a reorder immediately and persist the new order', async () => {
    const { result } = await renderLoaded();
    await act(async () => {
      await result.current.addTodo('A');
      await result.current.addTodo('B');
    });
    await waitFor(() => expect(result.current.todos).toHaveLength(2));
    const [a, b] = result.current.todos;

    await act(async () => {
      await result.current.reorderTodos([b!, a!]);
    });

    expect(texts(result.current.todos)).toEqual(['B', 'A']);
    await waitFor(async () => expect(texts(await todoService.getAllTodos())).toEqual(['B', 'A']));
    expect(texts(result.current.todos)).toEqual(['B', 'A']);
  });

  it('should roll back to the stored order when a reorder fails', async () => {
    const { result } = await renderLoaded();
    await act(async () => {
      await result.current.addTodo('A');
      await result.current.addTodo('B');
    });
    await waitFor(() => expect(result.current.todos).toHaveLength(2));
    const [a, b] = result.current.todos;

    vi.spyOn(todoService, 'reorderTodos').mockRejectedValueOnce(new Error('write failed'));
    await act(async () => {
      await expect(result.current.reorderTodos([b!, a!])).rejects.toThrow('write failed');
    });

    expect(texts(result.current.todos)).toEqual(['A', 'B']);
  });
});
