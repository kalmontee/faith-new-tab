import { fetchWeather } from '../api/weather-api';
import { getCachedWeather, setCachedWeather } from '../storage/weather-storage';
import type { TemperatureUnit, WeatherData } from '../types';

export async function getWeatherData(lat: number, lng: number, unit: TemperatureUnit): Promise<WeatherData> {
  const cached = await getCachedWeather(lat, lng);

  // Serve cache if it exists AND the unit matches (unit change forces a fresh fetch)
  if (cached && cached.data.unit === unit) return cached.data;

  const data = await fetchWeather(lat, lng, unit);
  await setCachedWeather({ data, cachedAt: Date.now(), lat, lng });

  return data;
}
