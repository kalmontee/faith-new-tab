import { db } from '@/shared/storage/app-db';
import type { TodoItem } from '@/shared/types/table';

export async function getAllTodos(): Promise<TodoItem[]> {
  return db.todos.orderBy('createdAt').toArray();
}

export async function addTodo(text: string): Promise<TodoItem> {
  const trimmed = text.trim();
  const createdAt = Date.now();
  const id = await db.todos.add({ text: trimmed, completed: false, createdAt } as TodoItem);

  return { id: id as number, text: trimmed, completed: false, createdAt };
}

export async function toggleTodo(id: number): Promise<void> {
  const todo = await db.todos.get(id);
  if (!todo) return;

  await db.todos.update(id, { completed: !todo.completed });
}

export async function removeTodo(id: number): Promise<void> {
  await db.todos.delete(id);
}
