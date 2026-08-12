import { describe, it, expect, beforeEach, vi } from 'vitest';

import { getCachedVerse, setCachedVerse, clearCachedVerse } from './verse-storage';
import { storage } from '@/shared/storage';
import type { CachedVerseEntry } from '../types';

// Integration test: verse-storage reads and writes through the real
// StorageService (ChromeStorageAdapter) backed by the chrome.storage.local mock
// from src/test/setup.ts. Nothing in the storage path is mocked, so this proves
// the cache actually persists and that the try/catch degrades gracefully.

const entry: CachedVerseEntry = {
  verse: {
    reference: 'John 3:16',
    text: 'For God so loved the world...',
    translation: 'NIV',
    fetchedAt: 1_000,
  },
  dateKey: '2025-06-15',
};

beforeEach(async () => {
  await storage.clear();
});

describe('verse-storage (integration)', () => {
  it('should return null when nothing is cached', async () => {
    expect(await getCachedVerse()).toBeNull();
  });

  it('should round-trip a cached verse through set then get', async () => {
    await setCachedVerse(entry);
    expect(await getCachedVerse()).toEqual(entry);
  });

  it('should overwrite a previously cached verse', async () => {
    await setCachedVerse(entry);
    const next: CachedVerseEntry = { ...entry, dateKey: '2025-06-16' };
    await setCachedVerse(next);

    expect((await getCachedVerse())?.dateKey).toBe('2025-06-16');
  });

  it('should clear the cached verse', async () => {
    await setCachedVerse(entry);
    await clearCachedVerse();
    expect(await getCachedVerse()).toBeNull();
  });

  // ── Graceful degradation ────────────────────────────────────────────────

  it('should return null instead of throwing when the storage read fails', async () => {
    vi.spyOn(chrome.storage.local, 'get').mockRejectedValueOnce(new Error('unavailable'));
    expect(await getCachedVerse()).toBeNull();
  });

  it('should swallow a storage write failure', async () => {
    vi.spyOn(chrome.storage.local, 'set').mockRejectedValueOnce(new Error('quota exceeded'));
    await expect(setCachedVerse(entry)).resolves.toBeUndefined();
  });
});
