import { describe, it, expect, beforeEach } from 'vitest';
import { db } from './app-db';

// Integration test for the IndexedDB (Dexie) storage layer.
//
// Unlike the per-service unit tests (which mock `db`), this suite runs the real
// services against the real Dexie schema backed by fake-indexeddb (installed in
// src/test/setup.ts). It proves that data written by a service is actually
// persisted, indexed, and read back correctly through the database.

import { getAllTodos, addTodo, toggleTodo, removeTodo } from '@/modules/todo/services/todo-service';
import { getAllPrayers, addPrayer, toggleAnswered, removePrayer } from '@/modules/prayer/services/prayer-service';
import { getTodayFocus, saveFocus } from '@/modules/focus/services/focus-service';
import { getTodayGratitude, saveGratitude } from '@/modules/gratitude/services/gratitude-service';
import { isFavorited, toggleFavorite } from '@/modules/quick-actions/services/favorites-service';
import type { CurrentVerse } from '@/shared/types/module';

// Start every test from an empty database. The Dexie instance is a module
// singleton, so its tables persist between tests within the file.
beforeEach(async () => {
  await Promise.all(db.tables.map((table) => table.clear()));
});

describe('App DB Tests (Integration)', () => {
  describe('app database schema', () => {
    it('should expose all five module tables at schema version 3', () => {
      expect(db.verno).toBe(3);
      const names = db.tables.map((t) => t.name).sort();
      expect(names).toEqual(['favorites', 'focus', 'gratitude', 'prayers', 'todos']);
    });
  });

  // ── Todos ─────────────────────────────────────────────────────────────────

  describe('todos storage', () => {
    it('should persist an added todo and read it back by createdAt order', async () => {
      const first = await addTodo('Read Psalm 23');
      const second = await addTodo('Call a friend');

      const todos = await getAllTodos();
      expect(todos.map((t) => t.text)).toEqual(['Read Psalm 23', 'Call a friend']);
      expect(todos[0]?.id).toBe(first.id);
      expect(todos[1]?.id).toBe(second.id);
    });

    it('should flip the completed flag in the database when toggled', async () => {
      const todo = await addTodo('Pray');
      await toggleTodo(todo.id);

      let stored = await db.todos.get(todo.id);
      expect(stored?.completed).toBe(true);

      await toggleTodo(todo.id);
      stored = await db.todos.get(todo.id);
      expect(stored?.completed).toBe(false);
    });

    it('should delete a todo from the database', async () => {
      const todo = await addTodo('Temporary');
      await removeTodo(todo.id);
      expect(await getAllTodos()).toEqual([]);
    });
  });

  // ── Prayers ─────────────────────────────────────────────────────────────────

  describe('prayers storage', () => {
    it('should return prayers newest-first', async () => {
      await addPrayer('Older request');
      // Guarantee a strictly later createdAt for deterministic ordering.
      await new Promise((r) => setTimeout(r, 2));
      await addPrayer('Newer request');

      const prayers = await getAllPrayers();
      expect(prayers.map((p) => p.text)).toEqual(['Newer request', 'Older request']);
    });

    it('should stamp answeredAt when a prayer is marked answered and clear it when un-answered', async () => {
      const prayer = await addPrayer('Healing');

      await toggleAnswered(prayer.id);
      let stored = await db.prayers.get(prayer.id);
      expect(stored?.answered).toBe(true);
      expect(stored?.answeredAt).toEqual(expect.any(Number));

      await toggleAnswered(prayer.id);
      stored = await db.prayers.get(prayer.id);
      expect(stored?.answered).toBe(false);
      expect(stored?.answeredAt).toBeNull();
    });

    it('should delete a prayer from the database', async () => {
      const prayer = await addPrayer('Temporary');
      await removePrayer(prayer.id);
      expect(await getAllPrayers()).toEqual([]);
    });
  });

  // ── Focus (one entry per day) ─────────────────────────────────────────────

  describe('focus storage', () => {
    it('should create a single row for today and read it back', async () => {
      const saved = await saveFocus('Trust the process', 'One step at a time');
      const today = await getTodayFocus();

      expect(today?.id).toBe(saved.id);
      expect(today?.focus).toBe('Trust the process');
    });

    it('should update the existing row instead of inserting a second one on the same day', async () => {
      const first = await saveFocus('Original', 'tagline');
      const second = await saveFocus('Revised', 'new tagline');

      expect(second.id).toBe(first.id);
      expect(await db.focus.count()).toBe(1);
      expect((await getTodayFocus())?.focus).toBe('Revised');
    });
  });

  // ── Gratitude (one entry per day) ─────────────────────────────────────────

  describe('gratitude storage', () => {
    it('should create a single row for today and read it back', async () => {
      const saved = await saveGratitude('Grateful for rest');
      expect((await getTodayGratitude())?.id).toBe(saved.id);
    });

    it('should overwrite the same-day entry rather than create a duplicate', async () => {
      await saveGratitude('First');
      await saveGratitude('Second');

      expect(await db.gratitude.count()).toBe(1);
      expect((await getTodayGratitude())?.entry).toBe('Second');
    });
  });

  // ── Favorites (unique reference index) ─────────────────────────────────────

  describe('favorites storage', () => {
    const verse: CurrentVerse = {
      reference: 'Philippians 4:13',
      text: 'I can do all things through Christ who strengthens me.',
      translation: 'NIV',
    };

    it('should add a favourite on first toggle and report it as favourited', async () => {
      expect(await isFavorited(verse.reference)).toBe(false);

      const added = await toggleFavorite(verse);

      expect(added).toBe(true);
      expect(await isFavorited(verse.reference)).toBe(true);
      expect(await db.favorites.count()).toBe(1);
    });

    it('should remove the favourite on a second toggle', async () => {
      await toggleFavorite(verse);
      const stillFavorited = await toggleFavorite(verse);

      expect(stillFavorited).toBe(false);
      expect(await isFavorited(verse.reference)).toBe(false);
      expect(await db.favorites.count()).toBe(0);
    });

    it('should enforce the unique reference index against duplicate raw inserts', async () => {
      await db.favorites.add({ ...verse, createdAt: Date.now() } as never);
      await expect(db.favorites.add({ ...verse, createdAt: Date.now() } as never)).rejects.toThrow();
    });
  });
});
