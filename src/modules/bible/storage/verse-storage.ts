import type { CachedVerseEntry } from '../types';
import { storage } from '@/shared/storage';

const CACHE_KEY = 'bible:cached-verse';

export async function getCachedVerse(): Promise<CachedVerseEntry | null> {
  try {
    return await storage.get<CachedVerseEntry>(CACHE_KEY);
  } catch {
    return null;
  }
}

export async function setCachedVerse(entry: CachedVerseEntry): Promise<void> {
  try {
    await storage.set(CACHE_KEY, entry);
  } catch {
    // storage unavailable in non-extension context — silently skip
  }
}

export async function clearCachedVerse(): Promise<void> {
  try {
    await storage.remove(CACHE_KEY);
  } catch {
    // ignore
  }
}
