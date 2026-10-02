import type { TemperatureUnit } from '@/shared/types/temperature';

export interface WeatherData {
  temperature: number;
  high: number;
  low: number;
  conditionCode: number;
  conditionText: string;
  city: string;
  unit: TemperatureUnit;
}

export interface CachedWeatherEntry {
  data: WeatherData;
  cachedAt: number;
  lat: number;
  lng: number;
}
