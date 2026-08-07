import { db } from '@/shared/storage/app-db';
import type { FocusEntry } from '@/shared/types/table';
import { getTodayKey } from '@/shared/utils/date';

export async function getTodayFocus(): Promise<FocusEntry | undefined> {
  return db.focus.where('date').equals(getTodayKey()).first();
}

export async function saveFocus(focus: string, tagline: string): Promise<FocusEntry> {
  const date = getTodayKey();
  const existing = await db.focus.where('date').equals(date).first();
  const now = Date.now();

  if (existing) {
    await db.focus.update(existing.id, { focus, tagline, updatedAt: now });
    return { ...existing, focus, tagline, updatedAt: now };
  }

  const id = await db.focus.add({ date, focus, tagline, updatedAt: now } as FocusEntry);
  return { id: id as number, date, focus, tagline, updatedAt: now };
}
