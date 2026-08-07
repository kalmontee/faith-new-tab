import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getTodayFocus, saveFocus } from './focus-service';
import type { FocusEntry } from '@/shared/types/table';

// Mock the Dexie database — the service uses a fluent where().equals().first() chain
vi.mock('@/shared/storage/app-db', () => ({
  db: {
    focus: {
      where: vi.fn(),
      add: vi.fn(),
      update: vi.fn(),
    },
  },
}));

import { db } from '@/shared/storage/app-db';

// ── Helpers ───────────────────────────────────────────────────────────────

const TODAY = '2025-06-15';

const sampleEntry: FocusEntry = {
  id: 1,
  date: TODAY,
  focus: 'Seek God first',
  tagline: 'Trust the process',
  updatedAt: 1_000_000,
};

/** Wire the db.focus.where().equals().first() chain to return the given value. */
function mockWhereChain(firstResult: FocusEntry | undefined) {
  const mockFirst = vi.fn().mockResolvedValue(firstResult);
  vi.mocked(db.focus.where).mockReturnValue({
    equals: () => ({ first: mockFirst }),
  } as unknown as ReturnType<typeof db.focus.where>);
  return mockFirst;
}

// ── getTodayFocus ─────────────────────────────────────────────────────────

describe('getTodayFocus', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2025, 5, 15, 12, 0, 0)); // June 15 2025
    vi.clearAllMocks();
  });

  afterEach(() => vi.useRealTimers());

  it("returns the entry when today's record exists", async () => {
    mockWhereChain(sampleEntry);
    expect(await getTodayFocus()).toEqual(sampleEntry);
  });

  it('returns undefined when no record exists for today', async () => {
    mockWhereChain(undefined);
    expect(await getTodayFocus()).toBeUndefined();
  });

  it("queries the 'date' field on the focus table", async () => {
    mockWhereChain(undefined);
    await getTodayFocus();
    expect(db.focus.where).toHaveBeenCalledWith('date');
  });
});

// ── saveFocus ─────────────────────────────────────────────────────────────

describe('saveFocus', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2025, 5, 15, 12, 0, 0));
    vi.clearAllMocks();
    vi.mocked(db.focus.update).mockResolvedValue(1);
    vi.mocked(db.focus.add).mockResolvedValue(42 as unknown as number);
  });

  afterEach(() => vi.useRealTimers());

  it('calls update (not add) when an entry already exists for today', async () => {
    mockWhereChain(sampleEntry);
    await saveFocus('New focus', 'New tagline');
    expect(db.focus.update).toHaveBeenCalledWith(sampleEntry.id, expect.objectContaining({ focus: 'New focus', tagline: 'New tagline' }));
    expect(db.focus.add).not.toHaveBeenCalled();
  });

  it('calls add (not update) when no entry exists for today', async () => {
    mockWhereChain(undefined);
    await saveFocus('First focus', 'First tagline');
    expect(db.focus.add).toHaveBeenCalledWith(expect.objectContaining({ date: TODAY, focus: 'First focus', tagline: 'First tagline' }));
    expect(db.focus.update).not.toHaveBeenCalled();
  });

  it('returns the updated entry with new focus and tagline on update', async () => {
    mockWhereChain(sampleEntry);
    const result = await saveFocus('Updated focus', 'Updated tagline');
    expect(result.id).toBe(sampleEntry.id);
    expect(result.focus).toBe('Updated focus');
    expect(result.tagline).toBe('Updated tagline');
  });

  it('returns the inserted entry with the database-generated id on add', async () => {
    mockWhereChain(undefined);
    const result = await saveFocus('Brand new focus', '');
    expect(result.id).toBe(42);
    expect(result.date).toBe(TODAY);
    expect(result.focus).toBe('Brand new focus');
  });

  it('stamps updatedAt with the current timestamp', async () => {
    const now = Date.now();
    mockWhereChain(undefined);
    const result = await saveFocus('Test', '');
    expect(result.updatedAt).toBe(now);
  });

  it('preserves the original id and date on update', async () => {
    mockWhereChain(sampleEntry);
    const result = await saveFocus('Changed', 'Changed tagline');
    expect(result.id).toBe(sampleEntry.id);
    expect(result.date).toBe(sampleEntry.date);
  });
});
