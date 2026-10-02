import { z } from 'zod';
import type { DailyVerse } from '../types';

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
 * @description Fetches OurManna's Verse of the Day (same verse for everyone, changes daily).
 * @returns A Promise that resolves to a DailyVerse object.
 */
export async function fetchDailyVerse(): Promise<DailyVerse> {
  const baseUrl: string = import.meta.env.VITE_OURMANNA_API_URL;

  if (!baseUrl) {
    throw new Error('Missing VITE_OURMANNA_API_URL env var for OurManna requests.');
  }

  const url: string = `${baseUrl}?format=json&order=daily`;
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
