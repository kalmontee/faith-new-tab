import Dexie, { type EntityTable } from 'dexie';
import type { FocusEntry, GratitudeEntry, PrayerRequest, TodoItem, FavoriteVerse } from '../types/table';

class AppDatabase extends Dexie {
  focus!: EntityTable<FocusEntry, 'id'>;
  gratitude!: EntityTable<GratitudeEntry, 'id'>;
  prayers!: EntityTable<PrayerRequest, 'id'>;
  todos!: EntityTable<TodoItem, 'id'>;
  favorites!: EntityTable<FavoriteVerse, 'id'>;

  constructor() {
    super('faith-new-day-db');

    // v1: focus module
    this.version(1).stores({
      focus: '++id, date',
    });

    // v2: gratitude + prayer modules
    this.version(2).stores({
      gratitude: '++id, date',
      prayers: '++id, createdAt',
    });

    // v3: todo + quick-actions (favorites) modules
    this.version(3).stores({
      todos: '++id, createdAt, completed',
      favorites: '++id, &reference, createdAt',
    });

    // v4: add position to todos
    this.version(4)
      .stores({
        todos: '++id, createdAt, completed, position',
      })
      .upgrade(async (tx) => {
        const todos = await tx.table<TodoItem, number>('todos').orderBy('createdAt').toArray();
        await Promise.all(todos.map((todo, index) => tx.table('todos').update(todo.id, { position: index })));
      });
  }
}

export const db = new AppDatabase();
