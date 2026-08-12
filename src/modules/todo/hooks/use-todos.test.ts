import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useTodos } from './use-todos';
import type { TodoItem } from '@/shared/types/table';

// Unit test: the hook orchestrates the service layer (load on mount, re-read
// after every mutation). The service itself is covered by todo-service.test.ts,
// so here we mock it and assert the wiring.
vi.mock('../services/todo-service', () => ({
  getAllTodos: vi.fn(),
  addTodo: vi.fn(),
  toggleTodo: vi.fn(),
  removeTodo: vi.fn(),
}));

import { getAllTodos, addTodo, toggleTodo, removeTodo } from '../services/todo-service';

const todoA: TodoItem = { id: 1, text: 'Read Psalm 23', completed: false, createdAt: 1_000 };
const todoB: TodoItem = { id: 2, text: 'Call a friend', completed: false, createdAt: 2_000 };

beforeEach(() => {
  vi.clearAllMocks();
  vi.mocked(getAllTodos).mockResolvedValue([]);
  vi.mocked(addTodo).mockResolvedValue(todoB);
  vi.mocked(toggleTodo).mockResolvedValue();
  vi.mocked(removeTodo).mockResolvedValue();
});

describe('useTodos', () => {
  it('should start in a loading state, then resolve with the fetched todos', async () => {
    vi.mocked(getAllTodos).mockResolvedValue([todoA]);
    const { result } = renderHook(() => useTodos());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.todos).toEqual([]);

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.todos).toEqual([todoA]);
  });

  it('should clear loading even when the initial fetch is empty', async () => {
    const { result } = renderHook(() => useTodos());
    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.todos).toEqual([]);
  });

  it('should add a todo, then re-read the list from the service', async () => {
    const { result } = renderHook(() => useTodos());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    vi.mocked(getAllTodos).mockResolvedValue([todoA, todoB]);
    await act(async () => {
      await result.current.addTodo('Call a friend');
    });

    expect(addTodo).toHaveBeenCalledWith('Call a friend');
    expect(result.current.todos).toEqual([todoA, todoB]);
  });

  it('should toggle a todo, then re-read the list', async () => {
    vi.mocked(getAllTodos).mockResolvedValue([todoA]);
    const { result } = renderHook(() => useTodos());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    vi.mocked(getAllTodos).mockResolvedValue([{ ...todoA, completed: true }]);
    await act(async () => {
      await result.current.toggleTodo(1);
    });

    expect(toggleTodo).toHaveBeenCalledWith(1);
    expect(result.current.todos[0]?.completed).toBe(true);
  });

  it('should remove a todo, then re-read the list', async () => {
    vi.mocked(getAllTodos).mockResolvedValue([todoA]);
    const { result } = renderHook(() => useTodos());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    vi.mocked(getAllTodos).mockResolvedValue([]);
    await act(async () => {
      await result.current.removeTodo(1);
    });

    expect(removeTodo).toHaveBeenCalledWith(1);
    expect(result.current.todos).toEqual([]);
  });

  // ── Failure paths ─────────────────────────────────────────────────────────

  it('should still clear the loading flag when the initial fetch rejects', async () => {
    vi.mocked(getAllTodos).mockRejectedValue(new Error('IndexedDB unavailable'));
    const { result } = renderHook(() => useTodos());

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.todos).toEqual([]);
  });

  it('should propagate an add failure and leave the list unchanged', async () => {
    vi.mocked(getAllTodos).mockResolvedValue([todoA]);
    const { result } = renderHook(() => useTodos());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    vi.mocked(addTodo).mockRejectedValue(new Error('write failed'));
    await expect(result.current.addTodo('Call a friend')).rejects.toThrow('write failed');

    expect(result.current.todos).toEqual([todoA]);
  });

  it('should not re-read the list when a toggle fails', async () => {
    vi.mocked(getAllTodos).mockResolvedValue([todoA]);
    const { result } = renderHook(() => useTodos());
    await waitFor(() => expect(result.current.isLoading).toBe(false));

    vi.mocked(toggleTodo).mockRejectedValue(new Error('write failed'));
    await expect(result.current.toggleTodo(1)).rejects.toThrow('write failed');

    // getAllTodos was called once on mount and must not be called again after the failure.
    expect(getAllTodos).toHaveBeenCalledTimes(1);
    expect(result.current.todos).toEqual([todoA]);
  });
});
