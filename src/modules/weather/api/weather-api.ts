import type { TemperatureUnit, WeatherData } from '../types';
import { NominatimSchema, OpenMeteoSchema, WMO_DESCRIPTIONS } from '../utils';

const WEATHER_API_KEY: string = import.meta.env.VITE_WEATHER_API_KEY;
const NOMINATIM_API: string = import.meta.env.VITE_NOMINATIM_API;

async function reverseGeocode(lat: number, lng: number): Promise<string> {
  try {
    const url = `${NOMINATIM_API}/reverse?lat=${lat}&lon=${lng}&format=json`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'NewDay-Extension/1.0 (chrome-extension)' },
    });
    const parsed = NominatimSchema.safeParse(await res.json());

    if (!parsed.success || !parsed.data.address) {
      return 'Your Location';
    }

    const { city, town, village, municipality } = parsed.data.address;

    return city ?? town ?? village ?? municipality ?? 'Your Location';
  } catch {
    return 'Your Location';
  }
}

export async function fetchWeather(lat: number, lng: number, unit: TemperatureUnit): Promise<WeatherData> {
  const url =
    `${WEATHER_API_KEY}` +
    `?latitude=${lat}&longitude=${lng}` +
    `&current=temperature_2m,weather_code` +
    `&daily=temperature_2m_max,temperature_2m_min` +
    `&temperature_unit=${unit}` +
    `&timezone=auto` +
    `&forecast_days=1`;

  const [weatherRes, city] = await Promise.all([fetch(url), reverseGeocode(lat, lng)]);

  if (!weatherRes.ok) throw new Error(`Open-Meteo error: ${weatherRes.status}`);

  const parsed = OpenMeteoSchema.parse(await weatherRes.json());
  const weatherCode = parsed.current.weather_code;

  return {
    temperature: Math.round(parsed.current.temperature_2m),
    high: Math.round(parsed.daily.temperature_2m_max[0] ?? parsed.current.temperature_2m),
    low: Math.round(parsed.daily.temperature_2m_min[0] ?? parsed.current.temperature_2m),
    conditionCode: weatherCode,
    conditionText: WMO_DESCRIPTIONS[weatherCode] ?? 'Unknown',
    city,
    unit,
  };
}
