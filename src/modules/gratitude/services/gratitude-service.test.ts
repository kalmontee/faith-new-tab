import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getTodayGratitude, saveGratitude } from './gratitude-service';
import type { GratitudeEntry } from '@/shared/types/table';

// Mock the Dexie database — the service uses a fluent where().equals().first() chain
vi.mock('@/shared/storage/app-db', () => ({
  db: {
    gratitude: {
      where: vi.fn(),
      add: vi.fn(),
      update: vi.fn(),
    },
  },
}));

import { db } from '@/shared/storage/app-db';

// ── Helpers ───────────────────────────────────────────────────────────────

const TODAY = '2025-06-15';

const sampleEntry: GratitudeEntry = {
  id: 1,
  date: TODAY,
  entry: 'Grateful for my family',
  updatedAt: 1_000_000,
};

/** Wire the db.gratitude.where().equals().first() chain to return the given value. */
function mockWhereChain(firstResult: GratitudeEntry | undefined) {
  const mockFirst = vi.fn().mockResolvedValue(firstResult);
  vi.mocked(db.gratitude.where).mockReturnValue({
    equals: () => ({ first: mockFirst }),
  } as unknown as ReturnType<typeof db.gratitude.where>);
  return mockFirst;
}

// ── getTodayGratitude ───────────────────────────────────────────────────────

describe('getTodayGratitude', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2025, 5, 15, 12, 0, 0)); // June 15 2025
    vi.clearAllMocks();
  });

  afterEach(() => vi.useRealTimers());

  it("returns the entry when today's record exists", async () => {
    mockWhereChain(sampleEntry);
    expect(await getTodayGratitude()).toEqual(sampleEntry);
  });

  it('returns undefined when no record exists for today', async () => {
    mockWhereChain(undefined);
    expect(await getTodayGratitude()).toBeUndefined();
  });

  it("queries the 'date' field on the gratitude table", async () => {
    mockWhereChain(undefined);
    await getTodayGratitude();
    expect(db.gratitude.where).toHaveBeenCalledWith('date');
  });
});

// ── saveGratitude ───────────────────────────────────────────────────────────

describe('saveGratitude', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2025, 5, 15, 12, 0, 0));
    vi.clearAllMocks();
    vi.mocked(db.gratitude.update).mockResolvedValue(1);
    vi.mocked(db.gratitude.add).mockResolvedValue(42 as unknown as number);
  });

  afterEach(() => vi.useRealTimers());

  it('calls update (not add) when an entry already exists for today', async () => {
    mockWhereChain(sampleEntry);
    await saveGratitude('New gratitude');
    expect(db.gratitude.update).toHaveBeenCalledWith(sampleEntry.id, expect.objectContaining({ entry: 'New gratitude' }));
    expect(db.gratitude.add).not.toHaveBeenCalled();
  });

  it('calls add (not update) when no entry exists for today', async () => {
    mockWhereChain(undefined);
    await saveGratitude('First gratitude');
    expect(db.gratitude.add).toHaveBeenCalledWith(expect.objectContaining({ date: TODAY, entry: 'First gratitude' }));
    expect(db.gratitude.update).not.toHaveBeenCalled();
  });

  it('returns the updated entry with the new text on update', async () => {
    mockWhereChain(sampleEntry);
    const result = await saveGratitude('Updated gratitude');
    expect(result.id).toBe(sampleEntry.id);
    expect(result.entry).toBe('Updated gratitude');
  });

  it('returns the inserted entry with the database-generated id on add', async () => {
    mockWhereChain(undefined);
    const result = await saveGratitude('Brand new gratitude');
    expect(result.id).toBe(42);
    expect(result.date).toBe(TODAY);
    expect(result.entry).toBe('Brand new gratitude');
  });

  it('stamps updatedAt with the current timestamp', async () => {
    const now = Date.now();
    mockWhereChain(undefined);
    const result = await saveGratitude('Test');
    expect(result.updatedAt).toBe(now);
  });

  it('preserves the original id and date on update', async () => {
    mockWhereChain(sampleEntry);
    const result = await saveGratitude('Changed');
    expect(result.id).toBe(sampleEntry.id);
    expect(result.date).toBe(sampleEntry.date);
  });
});
