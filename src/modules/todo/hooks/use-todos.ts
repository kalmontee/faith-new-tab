import { useState, useEffect, useCallback } from 'react';

import {
  getAllTodos,
  addTodo as addTodoToStore,
  toggleTodo as toggleTodoInStore,
  removeTodo as removeTodoFromStore,
} from '../services/todo-service';
import type { TodoItem } from '@/shared/types/table';

export interface UseTodosResult {
  todos: TodoItem[];
  isLoading: boolean;
  addTodo: (text: string) => Promise<void>;
  toggleTodo: (id: number) => Promise<void>;
  removeTodo: (id: number) => Promise<void>;
}

export function useTodos(): UseTodosResult {
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getAllTodos()
      .then(setTodos)
      .finally(() => setIsLoading(false));
  }, []);

  const addTodo = useCallback(async (text: string) => {
    await addTodoToStore(text);
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

  return { todos, isLoading, addTodo, toggleTodo, removeTodo };
}
