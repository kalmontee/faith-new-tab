import { create } from 'zustand';
import type { CurrentVerse } from '../types/module';

interface CurrentVerseState {
  verse: CurrentVerse | null;
  setCurrentVerse: (verse: CurrentVerse) => void;
}

// Ambient, unpersisted — lets modules that need "the verse on screen right now"
// (e.g. quick-actions' Share/Copy/Favorite) read it without importing the bible module.
export const useCurrentVerseStore = create<CurrentVerseState>((set) => ({
  verse: null,
  setCurrentVerse: (verse) => set({ verse }),
}));
