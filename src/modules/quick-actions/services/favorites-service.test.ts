import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { isFavorited, toggleFavorite } from './favorites-service';
import type { FavoriteVerse } from '@/shared/types/table';

// Mock the Dexie database — both functions use the where('reference').equals().first() chain.
vi.mock('@/shared/storage/app-db', () => ({
  db: {
    favorites: {
      where: vi.fn(),
      add: vi.fn(),
      delete: vi.fn(),
    },
  },
}));

import { db } from '@/shared/storage/app-db';

// ── Helpers ───────────────────────────────────────────────────────────────

const sampleVerse = {
  reference: 'Philippians 4:13',
  text: 'I can do all things through Christ, who strengthens me.',
  translation: 'WEB',
};

const sampleFavorite: FavoriteVerse = {
  id: 1,
  ...sampleVerse,
  createdAt: 1_000_000,
};

function mockWhereChain(firstResult: FavoriteVerse | undefined) {
  const mockFirst = vi.fn().mockResolvedValue(firstResult);
  vi.mocked(db.favorites.where).mockReturnValue({
    equals: () => ({ first: mockFirst }),
  } as unknown as ReturnType<typeof db.favorites.where>);
  return mockFirst;
}

// ── isFavorited ──────────────────────────────────────────────────────────────

describe('isFavorited', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns true when the reference is already favorited', async () => {
    mockWhereChain(sampleFavorite);
    expect(await isFavorited(sampleVerse.reference)).toBe(true);
  });

  it('returns false when the reference is not favorited', async () => {
    mockWhereChain(undefined);
    expect(await isFavorited(sampleVerse.reference)).toBe(false);
  });

  it("queries the 'reference' field", async () => {
    mockWhereChain(undefined);
    await isFavorited(sampleVerse.reference);
    expect(db.favorites.where).toHaveBeenCalledWith('reference');
  });
});

// ── toggleFavorite ───────────────────────────────────────────────────────────

describe('toggleFavorite', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2025, 5, 15, 12, 0, 0));
    vi.clearAllMocks();
    vi.mocked(db.favorites.add).mockResolvedValue(42 as unknown as number);
  });

  afterEach(() => vi.useRealTimers());

  it('adds the verse and returns true when it was not favorited', async () => {
    mockWhereChain(undefined);
    const result = await toggleFavorite(sampleVerse);
    expect(db.favorites.add).toHaveBeenCalledWith(expect.objectContaining(sampleVerse));
    expect(db.favorites.delete).not.toHaveBeenCalled();
    expect(result).toBe(true);
  });

  it('removes the verse and returns false when it was already favorited', async () => {
    mockWhereChain(sampleFavorite);
    const result = await toggleFavorite(sampleVerse);
    expect(db.favorites.delete).toHaveBeenCalledWith(sampleFavorite.id);
    expect(db.favorites.add).not.toHaveBeenCalled();
    expect(result).toBe(false);
  });

  it('stamps createdAt with the current timestamp when adding', async () => {
    mockWhereChain(undefined);
    const now = Date.now();
    await toggleFavorite(sampleVerse);
    expect(db.favorites.add).toHaveBeenCalledWith(expect.objectContaining({ createdAt: now }));
  });
});
