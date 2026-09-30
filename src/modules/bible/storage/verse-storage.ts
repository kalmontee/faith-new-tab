import type { CachedVerseEntry } from '../types';
import { storage } from '@/shared/storage';

const CACHE_KEY = 'bible:cached-verse';

export function getCachedVerse(): Promise<CachedVerseEntry | null> {
  return storage.get<CachedVerseEntry>(CACHE_KEY);
}

export function setCachedVerse(entry: CachedVerseEntry): Promise<void> {
  return storage.set(CACHE_KEY, entry);
}

export function clearCachedVerse(): Promise<void> {
  return storage.remove(CACHE_KEY);
}
