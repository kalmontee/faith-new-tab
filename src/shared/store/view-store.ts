import { create } from 'zustand';

import { withViewTransition } from '@/shared/lib/view-transition';

export type AppView = 'dashboard' | 'settings';

interface ViewState {
  view: AppView;
  openSettings: () => void;
  closeSettings: () => void;
}

// Ambient, unpersisted app-view state. Lives in shared/ (not app/) so modules
// like quick-actions can open Settings without importing app-level code, and so
// the persistent shell can swap views without a page navigation. Swaps run inside
// a view transition so both entry points cross-fade uniformly.
export const useViewStore = create<ViewState>((set) => ({
  view: 'dashboard',
  openSettings: () => withViewTransition(() => set({ view: 'settings' })),
  closeSettings: () => withViewTransition(() => set({ view: 'dashboard' })),
}));
