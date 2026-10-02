import { db } from '@/shared/storage/app-db';
import { createDailyEntry } from '@/shared/lib/daily-entry';
import type { GratitudeEntry } from '@/shared/types/table';

const gratitudeEntries = createDailyEntry(db.gratitude);

export const getTodayGratitude = (): Promise<GratitudeEntry | undefined> => gratitudeEntries.getToday();

export const saveGratitude = (entry: string): Promise<GratitudeEntry> => gratitudeEntries.saveToday({ entry });
