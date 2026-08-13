import { db } from '@/shared/storage/app-db';
import type { TodoItem } from '@/shared/types/table';

export async function getAllTodos(): Promise<TodoItem[]> {
  return db.todos.orderBy('position').toArray();
}

export async function addTodo(text: string): Promise<TodoItem> {
  const trimmed = text.trim();
  const createdAt = Date.now();
  const position = await db.todos.count(); // append to the end of the list
  const id = await db.todos.add({ text: trimmed, completed: false, createdAt, position } as TodoItem);

  return { id: id as number, text: trimmed, completed: false, createdAt, position };
}

export async function editTodo(id: number, text: string): Promise<void> {
  const trimmed = text.trim();
  if (!trimmed) return; // never persist a blank todo

  await db.todos.update(id, { text: trimmed });
}

export async function toggleTodo(id: number): Promise<void> {
  const todo = await db.todos.get(id);
  if (!todo) return;

  await db.todos.update(id, { completed: !todo.completed });
}

export async function removeTodo(id: number): Promise<void> {
  await db.todos.delete(id);
}

export async function reorderTodos(orderedIds: number[]): Promise<void> {
  if (orderedIds.length === 0) return;

  await db.transaction('rw', db.todos, async () => {
    await Promise.all(orderedIds.map((id, index) => db.todos.update(id, { position: index })));
  });
}
