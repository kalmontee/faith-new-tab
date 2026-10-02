import { db } from '@/shared/storage/app-db';
import { createDailyEntry } from '@/shared/lib/daily-entry';
import type { FocusEntry } from '@/shared/types/table';

const focusEntries = createDailyEntry(db.focus);

export const getTodayFocus = (): Promise<FocusEntry | undefined> => focusEntries.getToday();

export const saveFocus = (focus: string, tagline: string): Promise<FocusEntry> => focusEntries.saveToday({ focus, tagline });
