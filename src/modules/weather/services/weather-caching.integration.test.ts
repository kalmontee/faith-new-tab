import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { storage } from '@/shared/storage';
import { getWeatherData } from './weather-service';
import type { WeatherData } from '../types';

vi.mock('../api/weather-api', () => ({
  fetchWeather: vi.fn(),
}));

import { fetchWeather } from '../api/weather-api';

const LAT = 40.7;
const LNG = -74.0;
const MIN = 60_000;

const weather = (unit: WeatherData['unit'], temperature = 70): WeatherData => ({
  temperature,
  high: 80,
  low: 60,
  conditionCode: 0,
  conditionText: 'Clear',
  city: 'NYC',
  unit,
});

beforeEach(async () => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date('2025-06-15T12:00:00'));
  await storage.clear();
  vi.mocked(fetchWeather).mockImplementation(async (_lat, _lng, unit) => weather(unit));
});

afterEach(() => {
  vi.useRealTimers();
  vi.clearAllMocks();
});

describe('weather caching (integration)', () => {
  it('should reuse the cache for 29 minutes', async () => {
    await getWeatherData(LAT, LNG, 'fahrenheit');
    vi.advanceTimersByTime(29 * MIN);
    await getWeatherData(LAT, LNG, 'fahrenheit');

    expect(fetchWeather).toHaveBeenCalledTimes(1);
  });

  it('should refetch after 31 minutes', async () => {
    await getWeatherData(LAT, LNG, 'fahrenheit');
    vi.advanceTimersByTime(31 * MIN);
    await getWeatherData(LAT, LNG, 'fahrenheit');

    expect(fetchWeather).toHaveBeenCalledTimes(2);
  });

  it('should refetch when the picked city name differs from the cached one', async () => {
    vi.mocked(fetchWeather).mockImplementation(async (_lat, _lng, unit, cityName) => ({ ...weather(unit), city: cityName ?? 'NYC' }));

    await getWeatherData(LAT, LNG, 'fahrenheit', 'Newark');
    const second = await getWeatherData(LAT + 0.05, LNG, 'fahrenheit', 'Jersey City');

    expect(second.city).toBe('Jersey City');
    expect(fetchWeather).toHaveBeenCalledTimes(2);
  });

  it('should reuse the cache for the same picked city', async () => {
    vi.mocked(fetchWeather).mockImplementation(async (_lat, _lng, unit, cityName) => ({ ...weather(unit), city: cityName ?? 'NYC' }));

    await getWeatherData(LAT, LNG, 'fahrenheit', 'Newark');
    await getWeatherData(LAT, LNG, 'fahrenheit', 'Newark');

    expect(fetchWeather).toHaveBeenCalledTimes(1);
  });

  it('should reuse the cache for a location within 0.1 degrees', async () => {
    await getWeatherData(LAT, LNG, 'fahrenheit');
    await getWeatherData(LAT + 0.05, LNG - 0.05, 'fahrenheit');

    expect(fetchWeather).toHaveBeenCalledTimes(1);
  });

  it('should refetch for a location 0.1 degrees or more away', async () => {
    await getWeatherData(LAT, LNG, 'fahrenheit');
    await getWeatherData(LAT + 0.2, LNG, 'fahrenheit');

    expect(fetchWeather).toHaveBeenCalledTimes(2);
  });

  it('should refetch when the unit changes', async () => {
    await getWeatherData(LAT, LNG, 'fahrenheit');
    const celsius = await getWeatherData(LAT, LNG, 'celsius');

    expect(fetchWeather).toHaveBeenCalledTimes(2);
    expect(celsius.unit).toBe('celsius');
  });

  it('should leave the cache untouched when a fetch fails', async () => {
    await getWeatherData(LAT, LNG, 'fahrenheit');
    const before = await storage.get('weather:data');
    vi.advanceTimersByTime(31 * MIN);
    vi.mocked(fetchWeather).mockRejectedValueOnce(new Error('offline'));

    await expect(getWeatherData(LAT, LNG, 'fahrenheit')).rejects.toThrow('offline');

    expect(await storage.get('weather:data')).toEqual(before);
  });
});
