import { create } from 'zustand';
import type { CurrentVerse } from '../types/module';

interface CurrentVerseState {
  verse: CurrentVerse | null;
  setCurrentVerse: (verse: CurrentVerse) => void;
}

// Ordering: `verse` stays null until the bible module publishes one (cache or network),
// so readers must treat null as "not ready" and disable their verse actions.
export const useCurrentVerseStore = create<CurrentVerseState>((set) => ({
  verse: null,
  setCurrentVerse: (verse) => set({ verse }),
}));
