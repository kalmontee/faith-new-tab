import { create } from 'zustand';

export type AppView = 'dashboard' | 'settings';

interface ViewState {
  view: AppView;
  openSettings: () => void;
  closeSettings: () => void;
}

// Ambient, unpersisted app-view state. Lives in shared/ (not app/) so modules
// like quick-actions can open Settings without importing app-level code, and so
// the persistent shell can swap views without a page navigation.
export const useViewStore = create<ViewState>((set) => ({
  view: 'dashboard',
  openSettings: () => set({ view: 'settings' }),
  closeSettings: () => set({ view: 'dashboard' }),
}));
