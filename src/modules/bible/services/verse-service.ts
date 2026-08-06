import { fetchDailyVerse, fetchRandomVerse } from '../api/verse-api';
import { getCachedVerse, setCachedVerse } from '../storage/verse-storage';
import type { DailyVerse } from '../types';

// Cap random re-rolls so the "New Verse" button never loops forever.
const MAX_NEW_VERSE_ATTEMPTS = 3;

function getTodayKey(): string {
  const now = new Date();
  const yyyy = now.getFullYear();
  const mm = String(now.getMonth() + 1).padStart(2, '0');
  const dd = String(now.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export async function getDailyVerse(): Promise<DailyVerse> {
  const todayKey = getTodayKey();
  const cached = await getCachedVerse();

  if (cached && cached.dateKey === todayKey) {
    return cached.verse;
  }

  const verse = await fetchDailyVerse();
  await setCachedVerse({ verse, dateKey: todayKey });
  return verse;
}

/**
 * @deprecated Use getDailyVerse() instead. This function is only used for the "New Verse" button, which is now deprecated/not in use.
 * @param currentReference The reference of the verse currently displayed on screen. If the new verse fetched is the same as this reference, it will re-roll up to MAX_NEW_VERSE_ATTEMPTS times.
 * @returns A Promise that resolves to a DailyVerse object.
 */
export async function getNewVerse(currentReference?: string): Promise<DailyVerse> {
  let verse = await fetchRandomVerse();

  // Re-roll if OurManna hands back the verse already on screen.
  for (let attempt = 1; attempt < MAX_NEW_VERSE_ATTEMPTS && verse.reference === currentReference; attempt++) {
    verse = await fetchRandomVerse();
  }

  await setCachedVerse({ verse, dateKey: getTodayKey() });
  return verse;
}
