import { storage as defaultStorage, type StorageService } from '@/shared/storage';

export interface Clock {
  now(): number;
}

export interface CachePolicy<Key, Data, Entry> {
  storageKey: string;
  isFresh(entry: Entry, key: Key, now: number): boolean;
  toEntry(data: Data, key: Key, now: number): Entry;
  toData(entry: Entry): Data;
}

export interface CachedResource<Key, Data> {
  get(key: Key): Promise<Data>;
  refresh(key: Key): Promise<Data>;
}

interface CachedResourceDeps<Key, Data, Entry> {
  policy: CachePolicy<Key, Data, Entry>;
  fetcher: (key: Key) => Promise<Data>;
  storage?: StorageService;
  clock?: Clock;
}

export function createCachedResource<Key, Data, Entry>({
  policy,
  fetcher,
  storage = defaultStorage,
  clock = { now: () => Date.now() },
}: CachedResourceDeps<Key, Data, Entry>): CachedResource<Key, Data> {
  async function fetchAndStore(key: Key): Promise<Data> {
    const data = await fetcher(key);
    await storage.set(policy.storageKey, policy.toEntry(data, key, clock.now()));
    return data;
  }

  return {
    async get(key) {
      const entry = await storage.get<Entry>(policy.storageKey);
      if (entry && policy.isFresh(entry, key, clock.now())) return policy.toData(entry);

      return fetchAndStore(key);
    },
    refresh: fetchAndStore,
  };
}
