import { ChromeStorageAdapter } from './chrome-adapter';
import { FailSoftStorage } from './fail-soft-storage';
import { LocalStorageAdapter } from './local-storage-adapter';

export { ChromeStorageAdapter } from './chrome-adapter';
export { LocalStorageAdapter } from './local-storage-adapter';
export type { StorageService } from './storage-service';

export const storage = new FailSoftStorage(new ChromeStorageAdapter(), new LocalStorageAdapter());

// Zustand persists JSON strings; other writers may have stored a parsed object.
export const zustandChromeStorage = {
  getItem: async (name: string): Promise<string | null> => {
    const value = await storage.get<unknown>(name);
    if (value === null) return null;

    return typeof value === 'string' ? value : JSON.stringify(value);
  },

  setItem: (name: string, value: string): Promise<void> => storage.set(name, value),

  removeItem: (name: string): Promise<void> => storage.remove(name),
};
