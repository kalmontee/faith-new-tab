import { useState, useEffect, useCallback } from 'react';

import {
  getAllTodos,
  addTodo as addTodoToStore,
  editTodo as editTodoInStore,
  toggleTodo as toggleTodoInStore,
  removeTodo as removeTodoFromStore,
  reorderTodos as reorderTodosInStore,
} from '../services/todo-service';
import type { TodoItem } from '@/shared/types/table';

export interface UseTodosResult {
  todos: TodoItem[];
  isLoading: boolean;
  addTodo: (text: string) => Promise<void>;
  editTodo: (id: number, text: string) => Promise<void>;
  toggleTodo: (id: number) => Promise<void>;
  removeTodo: (id: number) => Promise<void>;
  reorderTodos: (reordered: TodoItem[]) => Promise<void>;
}

export function useTodos(): UseTodosResult {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getAllTodos()
      .then(setTodos)
      .catch(() => setTodos([]))
      .finally(() => setIsLoading(false));
  }, []);

  const addTodo = useCallback(async (text: string) => {
    await addTodoToStore(text);
    setTodos(await getAllTodos());
  }, []);

  const editTodo = useCallback(async (id: number, text: string) => {
    await editTodoInStore(id, text);
    setTodos(await getAllTodos());
  }, []);

  const toggleTodo = useCallback(async (id: number) => {
    await toggleTodoInStore(id);
    setTodos(await getAllTodos());
  }, []);

  const removeTodo = useCallback(async (id: number) => {
    await removeTodoFromStore(id);
    setTodos(await getAllTodos());
  }, []);

  // Apply the new order to local state immediately so the drag feels instant,
  // then persist. If the write fails, re-read to roll back to the stored truth.
  const reorderTodos = useCallback(async (reordered: TodoItem[]) => {
    setTodos(reordered);
    try {
      await reorderTodosInStore(reordered.map((todo) => todo.id));
    } catch (error) {
      setTodos(await getAllTodos());
      throw error;
    }
  }, []);

  return { todos, isLoading, addTodo, editTodo, toggleTodo, removeTodo, reorderTodos };
}
