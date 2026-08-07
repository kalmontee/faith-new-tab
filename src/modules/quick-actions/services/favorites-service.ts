import { db } from '@/shared/storage/app-db';
import type { FavoriteVerse } from '@/shared/types/table';
import type { CurrentVerse } from '@/shared/types/module';

export async function isFavorited(reference: string): Promise<boolean> {
  const existing = await db.favorites.where('reference').equals(reference).first();
  return !!existing;
}

export async function toggleFavorite(verse: CurrentVerse): Promise<boolean> {
  const existing = await db.favorites.where('reference').equals(verse.reference).first();

  if (existing) {
    await db.favorites.delete(existing.id);
    return false;
  }

  await db.favorites.add({ ...verse, createdAt: Date.now() } as FavoriteVerse);
  return true;
}
