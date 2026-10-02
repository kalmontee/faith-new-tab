import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { storage } from '@/shared/storage';
import { getDailyVerse } from './verse-service';
import type { DailyVerse } from '../types';

vi.mock('../api/verse-api', () => ({
  fetchDailyVerse: vi.fn(),
  fetchRandomVerse: vi.fn(),
}));

import { fetchDailyVerse } from '../api/verse-api';

const verse = (reference: string): DailyVerse => ({ reference, text: 't', translation: 'NIV', fetchedAt: 1 });

beforeEach(async () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2025-06-15T09:00:00'));
  await storage.clear();
});

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
});

describe('daily verse caching (integration)', () => {
  it('should not fetch again on the same day', async () => {
    vi.mocked(fetchDailyVerse).mockResolvedValue(verse('John 3:16'));

    await getDailyVerse();
    vi.setSystemTime(new Date('2025-06-15T23:59:00'));
    const second = await getDailyVerse();

    expect(fetchDailyVerse).toHaveBeenCalledTimes(1);
    expect(second.reference).toBe('John 3:16');
  });

  it('should fetch again after midnight', async () => {
    vi.mocked(fetchDailyVerse).mockResolvedValueOnce(verse('John 3:16')).mockResolvedValueOnce(verse('Psalm 23:1'));

    await getDailyVerse();
    vi.setSystemTime(new Date('2025-06-16T00:01:00'));
    const next = await getDailyVerse();

    expect(fetchDailyVerse).toHaveBeenCalledTimes(2);
    expect(next.reference).toBe('Psalm 23:1');
  });

  it('should keep the cached verse when a later fetch fails', async () => {
    vi.mocked(fetchDailyVerse).mockResolvedValueOnce(verse('John 3:16')).mockRejectedValueOnce(new Error('offline'));

    await getDailyVerse();
    vi.setSystemTime(new Date('2025-06-16T09:00:00'));
    await expect(getDailyVerse()).rejects.toThrow('offline');

    expect(await storage.get('bible:cached-verse')).toMatchObject({ dateKey: '2025-06-15' });
  });

  it('should not write the cache when the fetch fails on a cold start', async () => {
    vi.mocked(fetchDailyVerse).mockRejectedValue(new Error('offline'));

    await expect(getDailyVerse()).rejects.toThrow('offline');

    expect(await storage.get('bible:cached-verse')).toBeNull();
  });
});
