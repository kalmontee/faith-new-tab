import { useState, useEffect, useCallback } from 'react';
import { useCurrentVerseStore } from '@/shared/store/current-verse-store';
import { type CurrentVerse } from '@/shared/types/module';
import { isFavorited, toggleFavorite as toggleFavoriteInStore } from '../services/favorites-service';

export interface UseQuickActionsResult {
  hasVerse: boolean;
  isFavorite: boolean;
  copyVerse: () => Promise<void>;
  shareVerse: () => Promise<void>;
  toggleFavorite: () => Promise<void>;
  openSettings: () => void;
}

function formatVerse(verse: CurrentVerse): string {
  return `"${verse.text}" — ${verse.reference}`;
}

export function useQuickActions(): UseQuickActionsResult {
  const verse = useCurrentVerseStore((s) => s.verse);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (!verse) return;

    isFavorited(verse.reference).then(setIsFavorite);
  }, [verse]);

  const copyVerse = useCallback(async () => {
    if (!verse) return;

    await navigator.clipboard.writeText(formatVerse(verse));
  }, [verse]);

  const shareVerse = useCallback(async () => {
    if (!verse) return;

    const shareText = formatVerse(verse);

    if (navigator.share) {
      await navigator.share({ text: shareText });
    } else {
      await navigator.clipboard.writeText(shareText);
    }
  }, [verse]);

  const toggleFavorite = useCallback(async () => {
    if (!verse) return;

    setIsFavorite(await toggleFavoriteInStore(verse));
  }, [verse]);

  const openSettings = useCallback(() => {
    window.location.href = chrome.runtime.getURL('settings.html');
  }, []);

  return { hasVerse: !!verse, isFavorite, copyVerse, shareVerse, toggleFavorite, openSettings };
}
