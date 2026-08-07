import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getAllPrayers, addPrayer, toggleAnswered, removePrayer } from './prayer-service';
import type { PrayerRequest } from '@/shared/types/table';

// Mock the Dexie database — getAllPrayers uses orderBy().reverse().toArray(),
// toggleAnswered uses get() + update(), removePrayer uses delete().
vi.mock('@/shared/storage/app-db', () => ({
  db: {
    prayers: {
      orderBy: vi.fn(),
      add: vi.fn(),
      get: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

import { db } from '@/shared/storage/app-db';

// ── Helpers ───────────────────────────────────────────────────────────────

const samplePrayer: PrayerRequest = {
  id: 1,
  text: 'Healing for my grandmother',
  answered: false,
  createdAt: 1_000_000,
  answeredAt: null,
};

function mockOrderByChain(result: PrayerRequest[]) {
  const mockToArray = vi.fn().mockResolvedValue(result);
  vi.mocked(db.prayers.orderBy).mockReturnValue({
    reverse: () => ({ toArray: mockToArray }),
  } as unknown as ReturnType<typeof db.prayers.orderBy>);
  return mockToArray;
}

// ── getAllPrayers ───────────────────────────────────────────────────────────

describe('getAllPrayers', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns all prayers, newest first', async () => {
    mockOrderByChain([samplePrayer]);
    expect(await getAllPrayers()).toEqual([samplePrayer]);
  });

  it('returns an empty array when there are no prayers', async () => {
    mockOrderByChain([]);
    expect(await getAllPrayers()).toEqual([]);
  });

  it('orders by createdAt and reverses for newest-first', async () => {
    mockOrderByChain([]);
    await getAllPrayers();
    expect(db.prayers.orderBy).toHaveBeenCalledWith('createdAt');
  });
});

// ── addPrayer ────────────────────────────────────────────────────────────────

describe('addPrayer', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2025, 5, 15, 12, 0, 0));
    vi.clearAllMocks();
    vi.mocked(db.prayers.add).mockResolvedValue(42 as unknown as number);
  });

  afterEach(() => vi.useRealTimers());

  it('adds a new unanswered prayer with the given text', async () => {
    await addPrayer('Strength for finals week');
    expect(db.prayers.add).toHaveBeenCalledWith(
      expect.objectContaining({ text: 'Strength for finals week', answered: false, answeredAt: null })
    );
  });

  it('stamps createdAt with the current timestamp', async () => {
    const now = Date.now();
    const result = await addPrayer('Test');
    expect(result.createdAt).toBe(now);
  });

  it('returns the inserted prayer with the database-generated id', async () => {
    const result = await addPrayer('Test');
    expect(result.id).toBe(42);
    expect(result.text).toBe('Test');
  });

  it('trims whitespace from the prayer text', async () => {
    await addPrayer('  Trim me  ');
    expect(db.prayers.add).toHaveBeenCalledWith(expect.objectContaining({ text: 'Trim me' }));
  });
});

// ── toggleAnswered ───────────────────────────────────────────────────────────

describe('toggleAnswered', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2025, 5, 15, 12, 0, 0));
    vi.clearAllMocks();
  });

  afterEach(() => vi.useRealTimers());

  it('marks an unanswered prayer as answered with a timestamp', async () => {
    vi.mocked(db.prayers.get).mockResolvedValue(samplePrayer);
    const now = Date.now();
    await toggleAnswered(1);
    expect(db.prayers.update).toHaveBeenCalledWith(1, { answered: true, answeredAt: now });
  });

  it('marks an answered prayer as unanswered and clears the timestamp', async () => {
    vi.mocked(db.prayers.get).mockResolvedValue({
      ...samplePrayer,
      answered: true,
      answeredAt: 999,
    });
    await toggleAnswered(1);
    expect(db.prayers.update).toHaveBeenCalledWith(1, { answered: false, answeredAt: null });
  });

  it('does nothing when the prayer does not exist', async () => {
    vi.mocked(db.prayers.get).mockResolvedValue(undefined);
    await toggleAnswered(999);
    expect(db.prayers.update).not.toHaveBeenCalled();
  });
});

// ── removePrayer ─────────────────────────────────────────────────────────────

describe('removePrayer', () => {
  beforeEach(() => vi.clearAllMocks());

  it('deletes the prayer with the given id', async () => {
    await removePrayer(1);
    expect(db.prayers.delete).toHaveBeenCalledWith(1);
  });
});
