export type VerseType = 'daily' | 'random';

export interface DailyVerse {
  reference: string;
  text: string;
  translation: string;
  fetchedAt: number;
}

export interface CachedVerseEntry {
  verse: DailyVerse;
  dateKey: string;
}
