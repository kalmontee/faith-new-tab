import { createCachedResource } from '@/shared/lib/cached-resource';
import { fetchWeather } from '../api/weather-api';
import type { TemperatureUnit } from '@/shared/types/temperature';
import type { CachedWeatherEntry, WeatherData } from '../types';

interface WeatherQuery {
  lat: number;
  lng: number;
  unit: TemperatureUnit;
  cityName?: string;
}

const CACHE_TTL_MS = 30 * 60 * 1000;
// ~10 km tolerance: close enough to reuse the same cached reading
const COORDS_TOLERANCE_DEG = 0.1;

const weather = createCachedResource<WeatherQuery, WeatherData, CachedWeatherEntry>({
  fetcher: ({ lat, lng, unit, cityName }) => fetchWeather(lat, lng, unit, cityName),
  policy: {
    storageKey: 'weather:data',
    isFresh: (entry, { lat, lng, unit, cityName }, now) =>
      now - entry.cachedAt < CACHE_TTL_MS &&
      Math.abs(entry.lat - lat) < COORDS_TOLERANCE_DEG &&
      Math.abs(entry.lng - lng) < COORDS_TOLERANCE_DEG &&
      entry.data.unit === unit &&
      entry.cityName === cityName,
    toEntry: (data, { lat, lng, cityName }, now) => ({ data, cachedAt: now, lat, lng, cityName }),
    toData: (entry) => entry.data,
  },
});

export function getWeatherData(lat: number, lng: number, unit: TemperatureUnit, cityName?: string): Promise<WeatherData> {
  return weather.get({ lat, lng, unit, cityName });
}
