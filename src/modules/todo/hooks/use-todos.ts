import { useState } from 'react';

import {
  getAllTodos,
  addTodo as addTodoToStore,
  editTodo as editTodoInStore,
  toggleTodo as toggleTodoInStore,
  removeTodo as removeTodoFromStore,
  reorderTodos as reorderTodosInStore,
} from '../services/todo-service';
import { useLiveCollection } from '@/shared/hooks/use-live-collection';
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

interface OptimisticOrder {
  base: TodoItem[] | undefined;
  items: TodoItem[];
}

export function useTodos(): UseTodosResult {
  const { data, isLoading } = useLiveCollection(getAllTodos);
  const [optimistic, setOptimistic] = useState<OptimisticOrder | null>(null);

  // The drag order shows immediately and lasts only until the live query emits
  // again: a new `data` reference means storage has caught up (or rolled back).
  const todos = optimistic && optimistic.base === data ? optimistic.items : (data ?? []);

  const reorderTodos = async (reordered: TodoItem[]) => {
    setOptimistic({ base: data, items: reordered });
    try {
      await reorderTodosInStore(reordered.map((todo) => todo.id));
    } catch (error) {
      setOptimistic(null);
      throw error;
    }
  };

  return {
    todos,
    isLoading,
    addTodo: async (text) => {
      await addTodoToStore(text);
    },
    editTodo: editTodoInStore,
    toggleTodo: toggleTodoInStore,
    removeTodo: removeTodoFromStore,
    reorderTodos,
  };
}
