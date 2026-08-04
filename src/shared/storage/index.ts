export { ChromeStorageAdapter } from './chrome-adapter';
export type { StorageService } from './storage-service';

import { ChromeStorageAdapter } from './chrome-adapter';

export const storage = new ChromeStorageAdapter();

// Zustand-compatible async storage backed by chrome.storage.local.
// Falls back to localStorage when chrome APIs are unavailable (tests, dev).
export const zustandChromeStorage = {
  getItem: async (name: string): Promise<string | null> => {
    try {
      const result = await chrome.storage.local.get(name);
      const value = result[name];

      if (value === undefined || value === null) return null;

      return typeof value === 'string' ? value : JSON.stringify(value);
    } catch {
      return localStorage.getItem(name);
    }
  },

  setItem: async (name: string, value: string): Promise<void> => {
    try {
      await chrome.storage.local.set({ [name]: value });
    } catch {
      localStorage.setItem(name, value);
    }
  },

  removeItem: async (name: string): Promise<void> => {
    try {
      await chrome.storage.local.remove(name);
    } catch {
      localStorage.removeItem(name);
    }
  },
};
