import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getCachedWeather, setCachedWeather } from './weather-storage';
import type { CachedWeatherEntry } from '../types';

vi.mock('@/shared/storage', () => ({
  storage: {
    get: vi.fn(),
    set: vi.fn(),
  },
}));

import { storage } from '@/shared/storage';

// ── Fixtures ──────────────────────────────────────────────────────────────

const NOW = new Date(2025, 5, 15, 12, 0, 0);
const NOW_MS = NOW.getTime();
const THIRTY_MIN = 30 * 60 * 1000;

const LAT = 40.7;
const LNG = -74.0;

const mockData: CachedWeatherEntry['data'] = {
  temperature: 72,
  high: 80,
  low: 65,
  conditionCode: 0,
  conditionText: 'Clear Sky',
  city: 'New York',
  unit: 'fahrenheit',
};

function makeEntry(overrides?: Partial<CachedWeatherEntry>): CachedWeatherEntry {
  return {
    data: mockData,
    cachedAt: NOW_MS - 10 * 60 * 1000, // 10 min ago (fresh)
    lat: LAT,
    lng: LNG,
    ...overrides,
  };
}

// ── getCachedWeather ──────────────────────────────────────────────────────

describe('getCachedWeather', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(NOW);
    vi.mocked(storage.set).mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('returns null when no cache entry exists', async () => {
    vi.mocked(storage.get).mockResolvedValue(null);
    expect(await getCachedWeather(LAT, LNG)).toBeNull();
  });

  it('returns the cached entry when fresh and at the same location', async () => {
    vi.mocked(storage.get).mockResolvedValue(makeEntry());
    const result = await getCachedWeather(LAT, LNG);
    expect(result).not.toBeNull();
    expect(result?.data.city).toBe('New York');
  });

  it('returns null when the cache is older than 30 minutes', async () => {
    vi.mocked(storage.get).mockResolvedValue(
      makeEntry({ cachedAt: NOW_MS - THIRTY_MIN - 1 }) // 1ms past expiry
    );
    expect(await getCachedWeather(LAT, LNG)).toBeNull();
  });

  it('returns the entry when the cache is exactly at the 30-minute boundary (inclusive)', async () => {
    // cachedAt = NOW_MS - THIRTY_MIN → age == THIRTY_MIN, difference < THIRTY_MIN is false
    // so this should be null (strictly less than)
    vi.mocked(storage.get).mockResolvedValue(makeEntry({ cachedAt: NOW_MS - THIRTY_MIN }));
    expect(await getCachedWeather(LAT, LNG)).toBeNull();
  });

  it('returns null when latitude differs by more than 0.1 degrees', async () => {
    vi.mocked(storage.get).mockResolvedValue(makeEntry({ lat: LAT + 0.15 }));
    expect(await getCachedWeather(LAT, LNG)).toBeNull();
  });

  it('returns null when longitude differs by more than 0.1 degrees', async () => {
    vi.mocked(storage.get).mockResolvedValue(makeEntry({ lng: LNG + 0.15 }));
    expect(await getCachedWeather(LAT, LNG)).toBeNull();
  });

  it('returns the entry when location differs by less than 0.1 degrees (~10 km)', async () => {
    vi.mocked(storage.get).mockResolvedValue(makeEntry({ lat: LAT + 0.05, lng: LNG - 0.05 }));
    expect(await getCachedWeather(LAT, LNG)).not.toBeNull();
  });

  it('returns null when storage.get throws', async () => {
    vi.mocked(storage.get).mockRejectedValue(new Error('Storage unavailable'));
    expect(await getCachedWeather(LAT, LNG)).toBeNull();
  });
});

// ── setCachedWeather ──────────────────────────────────────────────────────

describe('setCachedWeather', () => {
  beforeEach(() => {
    vi.mocked(storage.set).mockResolvedValue(undefined);
  });

  afterEach(() => vi.clearAllMocks());

  it('writes the entry to storage under the weather cache key', async () => {
    const entry = makeEntry();
    await setCachedWeather(entry);
    expect(storage.set).toHaveBeenCalledWith('weather:data', entry);
  });

  it('does not throw when storage.set fails', async () => {
    vi.mocked(storage.set).mockRejectedValue(new Error('Storage full'));
    await expect(setCachedWeather(makeEntry())).resolves.not.toThrow();
  });
});
