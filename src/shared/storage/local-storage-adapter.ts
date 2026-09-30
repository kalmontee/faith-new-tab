import type { StorageService } from './storage-service';

export class LocalStorageAdapter implements StorageService {
  async get<T>(key: string): Promise<T | null> {
    const raw = localStorage.getItem(key);

    if (raw === null) return null;

    try {
      return JSON.parse(raw) as T;
    } catch {
      return raw as T;
    }
  }

  async set<T>(key: string, value: T): Promise<void> {
    localStorage.setItem(key, JSON.stringify(value));
  }

  async remove(key: string): Promise<void> {
    localStorage.removeItem(key);
  }

  async clear(): Promise<void> {
    localStorage.clear();
  }
}
