import {
  getAllTodos,
  addTodo as addTodoToStore,
  editTodo as editTodoInStore,
  toggleTodo as toggleTodoInStore,
  removeTodo as removeTodoFromStore,
  reorderTodos as reorderTodosInStore,
} from '../services/todo-service';
import { useOptimisticOverride } from '@/shared/hooks/use-optimistic-override';
import { useLiveCollection } from '@/shared/hooks/use-live-collection';
import type { TodoItem } from '@/shared/types/table';

const EMPTY: TodoItem[] = [];

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
  const { data, isLoading } = useLiveCollection(getAllTodos);
  const [todos, setOrder, clearOrder] = useOptimisticOverride(data ?? EMPTY);

  const reorderTodos = async (reordered: TodoItem[]) => {
    setOrder(reordered);
    try {
      await reorderTodosInStore(reordered.map((todo) => todo.id));
    } catch (error) {
      clearOrder();
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
