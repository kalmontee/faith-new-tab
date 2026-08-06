import { db } from '@/shared/storage/app-db';
import type { GratitudeEntry } from '@/shared/types/table';
import { getTodayKey } from '@/shared/utils/date';

export async function getTodayGratitude(): Promise<GratitudeEntry | undefined> {
  return db.gratitude.where('date').equals(getTodayKey()).first();
}

export async function saveGratitude(entry: string): Promise<GratitudeEntry> {
  const date = getTodayKey();
  const existing = await db.gratitude.where('date').equals(date).first();
  const now = Date.now();

  if (existing) {
    await db.gratitude.update(existing.id, { entry, updatedAt: now });
    return { ...existing, entry, updatedAt: now };
  }

  const id = await db.gratitude.add({ date, entry, updatedAt: now } as GratitudeEntry);
  return { id: id as number, date, entry, updatedAt: now };
}
