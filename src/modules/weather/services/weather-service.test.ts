import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { getWeatherData } from './weather-service';
import type { WeatherData, CachedWeatherEntry } from '../types';

vi.mock('../storage/weather-storage', () => ({
  getCachedWeather: vi.fn(),
  setCachedWeather: vi.fn(),
}));

vi.mock('../api/weather-api', () => ({
  fetchWeather: vi.fn(),
}));

import { getCachedWeather, setCachedWeather } from '../storage/weather-storage';
import { fetchWeather } from '../api/weather-api';

// ── Fixtures ──────────────────────────────────────────────────────────────

const LAT = 40.7;
const LNG = -74.0;

const mockData: WeatherData = {
  temperature: 72,
  high: 80,
  low: 65,
  conditionCode: 0,
  conditionText: 'Clear Sky',
  city: 'New York',
  unit: 'fahrenheit',
};

function makeCache(unit: WeatherData['unit'] = 'fahrenheit'): CachedWeatherEntry {
  return {
    data: { ...mockData, unit },
    cachedAt: Date.now() - 5 * 60 * 1000, // 5 min ago
    lat: LAT,
    lng: LNG,
  };
}

// ── getWeatherData ────────────────────────────────────────────────────────

describe('getWeatherData', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2025, 5, 15, 12, 0, 0));
    vi.mocked(setCachedWeather).mockResolvedValue(undefined);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  it('returns cached data when fresh and unit matches', async () => {
    vi.mocked(getCachedWeather).mockResolvedValue(makeCache('fahrenheit'));

    const result = await getWeatherData(LAT, LNG, 'fahrenheit');

    expect(result).toEqual(mockData);
    expect(fetchWeather).not.toHaveBeenCalled();
  });

  it('fetches when there is no cache', async () => {
    vi.mocked(getCachedWeather).mockResolvedValue(null);
    const fresh: WeatherData = { ...mockData, temperature: 68 };
    vi.mocked(fetchWeather).mockResolvedValue(fresh);

    const result = await getWeatherData(LAT, LNG, 'fahrenheit');

    expect(fetchWeather).toHaveBeenCalledWith(LAT, LNG, 'fahrenheit');
    expect(result).toEqual(fresh);
  });

  it('fetches when the cached unit differs from the requested unit', async () => {
    // Cache has fahrenheit data but caller wants celsius
    vi.mocked(getCachedWeather).mockResolvedValue(makeCache('fahrenheit'));
    const celsiusData: WeatherData = { ...mockData, temperature: 22, unit: 'celsius' };
    vi.mocked(fetchWeather).mockResolvedValue(celsiusData);

    const result = await getWeatherData(LAT, LNG, 'celsius');

    expect(fetchWeather).toHaveBeenCalledWith(LAT, LNG, 'celsius');
    expect(result.unit).toBe('celsius');
  });

  it('stores the fetched data in cache after a successful fetch', async () => {
    vi.mocked(getCachedWeather).mockResolvedValue(null);
    vi.mocked(fetchWeather).mockResolvedValue(mockData);

    await getWeatherData(LAT, LNG, 'fahrenheit');

    expect(setCachedWeather).toHaveBeenCalledWith(expect.objectContaining({ data: mockData, lat: LAT, lng: LNG }));
  });

  it('stamps the cache entry with the current timestamp', async () => {
    const now = Date.now();
    vi.mocked(getCachedWeather).mockResolvedValue(null);
    vi.mocked(fetchWeather).mockResolvedValue(mockData);

    await getWeatherData(LAT, LNG, 'fahrenheit');

    expect(setCachedWeather).toHaveBeenCalledWith(expect.objectContaining({ cachedAt: now }));
  });

  it('does not write to cache when serving cached data', async () => {
    vi.mocked(getCachedWeather).mockResolvedValue(makeCache('fahrenheit'));

    await getWeatherData(LAT, LNG, 'fahrenheit');

    expect(setCachedWeather).not.toHaveBeenCalled();
  });

  it('propagates errors thrown by fetchWeather', async () => {
    vi.mocked(getCachedWeather).mockResolvedValue(null);
    vi.mocked(fetchWeather).mockRejectedValue(new Error('Open-Meteo error: 503'));

    await expect(getWeatherData(LAT, LNG, 'fahrenheit')).rejects.toThrow('Open-Meteo error: 503');
  });
});
