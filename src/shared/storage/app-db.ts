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
  }
}

export const db = new AppDatabase();
