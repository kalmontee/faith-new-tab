import { z } from 'zod';
import type { DailyVerse, VerseType } from '../types';

// OurManna returns extra fields (verse url, notice); we only validate what we use.
const OurMannaSchema = z.object({
  verse: z.object({
    details: z.object({
      text: z.string(),
      reference: z.string(),
      version: z.string(),
    }),
  }),
});

/**
 * @description Fetches a verse from OurManna's API and returns it in the DailyVerse format.
 * @returns A Promise that resolves to a DailyVerse object.
 */
async function fetchFromOurManna(verseType: VerseType): Promise<DailyVerse> {
  const baseUrl: string = import.meta.env.VITE_OURMANNA_API_URL;

  if (!baseUrl) {
    throw new Error('Missing VITE_OURMANNA_API_URL env var for OurManna requests.');
  }

  const url: string = `${baseUrl}?format=json&order=${verseType}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`OurManna API error: ${response.status} ${response.statusText}`);
  }

  const { verse } = OurMannaSchema.parse(await response.json());
  return {
    reference: verse.details.reference,
    text: verse.details.text.trim(),
    translation: verse.details.version,
    fetchedAt: Date.now(),
  };
}

/**
 * @description Fetches OurManna's Verse of the Day (same verse for everyone, changes daily). */
export function fetchDailyVerse(): Promise<DailyVerse> {
  return fetchFromOurManna('daily');
}

/**
 * Fetches a random verse — used by the "New Verse" button.
 * @deprecated The "New Verse" button is deprecated. Use fetchDailyVerse() instead.
 */
export function fetchRandomVerse(): Promise<DailyVerse> {
  return fetchFromOurManna('random');
}
