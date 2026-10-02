import { createCachedResource } from '@/shared/lib/cached-resource';
import { getTodayKey } from '@/shared/utils/date';
import { fetchDailyVerse } from '../api/verse-api';
import type { CachedVerseEntry, DailyVerse } from '../types';

const dailyVerse = createCachedResource<void, DailyVerse, CachedVerseEntry>({
  fetcher: fetchDailyVerse,
  policy: {
    storageKey: 'bible:cached-verse',
    isFresh: (entry, _key, now) => entry.dateKey === getTodayKey(new Date(now)),
    toEntry: (verse, _key, now) => ({ verse, dateKey: getTodayKey(new Date(now)) }),
    toData: (entry) => entry.verse,
  },
});

export function getDailyVerse(): Promise<DailyVerse> {
  return dailyVerse.get();
}
