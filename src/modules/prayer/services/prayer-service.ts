import { db } from '@/shared/storage/app-db';
import type { PrayerRequest } from '@/shared/types/table';

export async function getAllPrayers(): Promise<PrayerRequest[]> {
  return db.prayers.orderBy('createdAt').reverse().toArray();
}

export async function addPrayer(text: string): Promise<PrayerRequest> {
  const trimmed = text.trim();
  const createdAt = Date.now();
  const id = await db.prayers.add({
    text: trimmed,
    answered: false,
    createdAt,
    answeredAt: null,
  } as PrayerRequest);
  return { id: id as number, text: trimmed, answered: false, createdAt, answeredAt: null };
}

export async function toggleAnswered(id: number): Promise<void> {
  const prayer = await db.prayers.get(id);
  if (!prayer) return;

  const answered = !prayer.answered;
  await db.prayers.update(id, { answered, answeredAt: answered ? Date.now() : null });
}

export async function removePrayer(id: number): Promise<void> {
  await db.prayers.delete(id);
}
