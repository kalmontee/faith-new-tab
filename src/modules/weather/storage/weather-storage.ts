import { storage } from '@/shared/storage';
import type { CachedWeatherEntry } from '../types';

const CACHE_KEY = 'weather:data';
const CACHE_TTL_MS = 30 * 60 * 1000;

function coordsMatch(lat1: number, lng1: number, lat2: number, lng2: number): boolean {
  // ~10 km tolerance — close enough to reuse the same cached reading
  return Math.abs(lat1 - lat2) < 0.1 && Math.abs(lng1 - lng2) < 0.1;
}

export async function getCachedWeather(lat: number, lng: number): Promise<CachedWeatherEntry | null> {
  try {
    const entry = await storage.get<CachedWeatherEntry>(CACHE_KEY);

    if (!entry) return null;

    const isRecent = Date.now() - entry.cachedAt < CACHE_TTL_MS;
    const isSameLocation = coordsMatch(entry.lat, entry.lng, lat, lng);

    return isRecent && isSameLocation ? entry : null;
  } catch {
    return null;
  }
}

export async function setCachedWeather(entry: CachedWeatherEntry): Promise<void> {
  try {
    await storage.set(CACHE_KEY, entry);
  } catch {
    // storage unavailable — silently skip
  }
}
