import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getDailyVerse, getNewVerse } from './verse-service';
import type { DailyVerse, CachedVerseEntry } from '../types';

vi.mock('../api/verse-api', () => ({
  fetchDailyVerse: vi.fn(),
  fetchRandomVerse: vi.fn(),
}));

vi.mock('../storage/verse-storage', () => ({
  getCachedVerse: vi.fn(),
  setCachedVerse: vi.fn(),
}));

import { fetchDailyVerse, fetchRandomVerse } from '../api/verse-api';
import { getCachedVerse, setCachedVerse } from '../storage/verse-storage';

// ── Fixtures ──────────────────────────────────────────────────────────────

const TODAY = '2025-06-15';

const makeVerse = (overrides?: Partial<DailyVerse>): DailyVerse => ({
  reference: 'Matthew 6:33',
  text: 'But seek first his kingdom...',
  translation: 'NIV',
  fetchedAt: 1_000_000,
  ...overrides,
});

const makeCache = (dateKey = TODAY, verse = makeVerse()): CachedVerseEntry => ({
  verse,
  dateKey,
});

// ── getDailyVerse ─────────────────────────────────────────────────────────

describe('getDailyVerse', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(`${TODAY}T12:00:00`));
    vi.mocked(setCachedVerse).mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('returns the cached verse when the dateKey matches today', async () => {
    const cached = makeCache(TODAY);
    vi.mocked(getCachedVerse).mockResolvedValue(cached);

    const result = await getDailyVerse();

    expect(result).toEqual(cached.verse);
    expect(fetchDailyVerse).not.toHaveBeenCalled();
  });

  it('fetches the daily verse when there is no cache', async () => {
    vi.mocked(getCachedVerse).mockResolvedValue(null);
    const fresh = makeVerse({ reference: 'Romans 8:28' });
    vi.mocked(fetchDailyVerse).mockResolvedValue(fresh);

    const result = await getDailyVerse();

    expect(fetchDailyVerse).toHaveBeenCalledOnce();
    expect(result).toEqual(fresh);
  });

  it("persists the fetched verse to cache with today's dateKey", async () => {
    vi.mocked(getCachedVerse).mockResolvedValue(null);
    const fresh = makeVerse();
    vi.mocked(fetchDailyVerse).mockResolvedValue(fresh);

    await getDailyVerse();

    expect(setCachedVerse).toHaveBeenCalledWith({ verse: fresh, dateKey: TODAY });
  });

  it('refetches when the cached dateKey is stale', async () => {
    vi.mocked(getCachedVerse).mockResolvedValue(makeCache('2025-06-14'));
    const fresh = makeVerse();
    vi.mocked(fetchDailyVerse).mockResolvedValue(fresh);

    const result = await getDailyVerse();

    expect(fetchDailyVerse).toHaveBeenCalled();
    expect(result).toEqual(fresh);
  });
});

// ── getNewVerse ───────────────────────────────────────────────────────────

describe('getNewVerse', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(`${TODAY}T12:00:00`));
    vi.mocked(setCachedVerse).mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('fetches a random verse', async () => {
    const fresh = makeVerse({ reference: 'Philippians 4:13' });
    vi.mocked(fetchRandomVerse).mockResolvedValue(fresh);

    const result = await getNewVerse('Matthew 6:33');

    expect(result).toEqual(fresh);
    expect(fetchRandomVerse).toHaveBeenCalled();
  });

  it("persists the new verse to cache with today's dateKey", async () => {
    const fresh = makeVerse({ reference: 'Psalm 23:1' });
    vi.mocked(fetchRandomVerse).mockResolvedValue(fresh);

    await getNewVerse();

    expect(setCachedVerse).toHaveBeenCalledWith({ verse: fresh, dateKey: TODAY });
  });

  it('always fetches — never returns from cache', async () => {
    vi.mocked(getCachedVerse).mockResolvedValue(makeCache(TODAY));
    const fresh = makeVerse({ reference: 'Isaiah 40:31' });
    vi.mocked(fetchRandomVerse).mockResolvedValue(fresh);

    await getNewVerse();

    expect(fetchRandomVerse).toHaveBeenCalled();
    expect(getCachedVerse).not.toHaveBeenCalled();
  });

  it('retries when the random verse matches the current one', async () => {
    const same = makeVerse({ reference: 'Matthew 6:33' });
    const different = makeVerse({ reference: 'John 14:6' });
    vi.mocked(fetchRandomVerse).mockResolvedValueOnce(same).mockResolvedValueOnce(different);

    const result = await getNewVerse('Matthew 6:33');

    expect(fetchRandomVerse).toHaveBeenCalledTimes(2);
    expect(result).toEqual(different);
  });

  it('gives up retrying after the attempt cap and returns the last verse', async () => {
    const same = makeVerse({ reference: 'Matthew 6:33' });
    vi.mocked(fetchRandomVerse).mockResolvedValue(same);

    const result = await getNewVerse('Matthew 6:33');

    expect(result).toEqual(same);
    expect(fetchRandomVerse).toHaveBeenCalledTimes(3);
  });
});
