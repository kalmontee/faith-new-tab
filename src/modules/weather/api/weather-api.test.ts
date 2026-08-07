import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { fetchWeather } from './weather-api';

// ── Fixtures ──────────────────────────────────────────────────────────────

const MOCK_WEATHER = {
  current: { temperature_2m: 72.4, weather_code: 1 },
  daily: { temperature_2m_max: [80.1], temperature_2m_min: [64.6] },
};

const LAT = 40.7128;
const LNG = -74.006;

/** Stub global fetch so both Open-Meteo and Nominatim calls are intercepted. */
function setupFetch({
  weatherCode = 1,
  city = 'New York',
  weatherOk = true,
  nominatimFails = false,
}: {
  weatherCode?: number;
  city?: string;
  weatherOk?: boolean;
  nominatimFails?: boolean;
} = {}) {
  vi.mocked(fetch).mockImplementation(async (input) => {
    const url = String(input);

    if (url.includes('open-meteo.com')) {
      if (!weatherOk) return { ok: false, status: 503, statusText: 'Service Unavailable' } as Response;
      return {
        ok: true,
        json: async () => ({
          ...MOCK_WEATHER,
          current: { ...MOCK_WEATHER.current, weather_code: weatherCode },
        }),
      } as Response;
    }

    // Nominatim reverse-geocoding
    if (nominatimFails) throw new Error('Network error');
    return {
      ok: true,
      json: async () => ({ address: { city } }),
    } as Response;
  });
}

// ── fetchWeather ──────────────────────────────────────────────────────────

describe('fetchWeather', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('returns WeatherData with rounded temperature', async () => {
    setupFetch();
    const result = await fetchWeather(LAT, LNG, 'fahrenheit');
    expect(result.temperature).toBe(72); // 72.4 rounded
    expect(result.high).toBe(80); // 80.1 rounded
    expect(result.low).toBe(65); // 64.6 rounded
  });

  it('includes the city name from Nominatim', async () => {
    setupFetch({ city: 'Brooklyn' });
    const result = await fetchWeather(LAT, LNG, 'fahrenheit');
    expect(result.city).toBe('Brooklyn');
  });

  it('passes the temperature unit in the Open-Meteo URL', async () => {
    setupFetch();
    await fetchWeather(LAT, LNG, 'celsius');
    const weatherCall = vi.mocked(fetch).mock.calls.find(([url]) => String(url).includes('open-meteo.com'));
    expect(String(weatherCall?.[0])).toContain('temperature_unit=celsius');
  });

  it('passes latitude and longitude in the Open-Meteo URL', async () => {
    setupFetch();
    await fetchWeather(LAT, LNG, 'fahrenheit');
    const weatherCall = vi.mocked(fetch).mock.calls.find(([url]) => String(url).includes('open-meteo.com'));
    const url = String(weatherCall?.[0]);
    expect(url).toContain(`latitude=${LAT}`);
    expect(url).toContain(`longitude=${LNG}`);
  });

  it('maps WMO code 0 to "Clear Sky"', async () => {
    setupFetch({ weatherCode: 0 });
    const result = await fetchWeather(LAT, LNG, 'fahrenheit');
    expect(result.conditionCode).toBe(0);
    expect(result.conditionText).toBe('Clear Sky');
  });

  it('maps WMO code 63 to "Rain"', async () => {
    setupFetch({ weatherCode: 63 });
    const result = await fetchWeather(LAT, LNG, 'fahrenheit');
    expect(result.conditionText).toBe('Rain');
  });

  it('maps WMO code 95 to "Thunderstorm"', async () => {
    setupFetch({ weatherCode: 95 });
    const result = await fetchWeather(LAT, LNG, 'fahrenheit');
    expect(result.conditionText).toBe('Thunderstorm');
  });

  it('carries the requested unit on the returned object', async () => {
    setupFetch();
    const result = await fetchWeather(LAT, LNG, 'celsius');
    expect(result.unit).toBe('celsius');
  });

  it('throws when Open-Meteo returns a non-ok status', async () => {
    setupFetch({ weatherOk: false });
    await expect(fetchWeather(LAT, LNG, 'fahrenheit')).rejects.toThrow('Open-Meteo error: 503');
  });

  it('falls back to "Your Location" when Nominatim request fails', async () => {
    setupFetch({ nominatimFails: true });
    const result = await fetchWeather(LAT, LNG, 'fahrenheit');
    expect(result.city).toBe('Your Location');
  });

  it('throws a Zod validation error when the weather response shape is invalid', async () => {
    vi.mocked(fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ unexpected: 'shape' }),
    } as Response);
    await expect(fetchWeather(LAT, LNG, 'fahrenheit')).rejects.toThrow();
  });
});
