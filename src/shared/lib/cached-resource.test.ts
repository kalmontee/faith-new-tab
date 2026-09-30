import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createCachedResource, type CachePolicy } from './cached-resource';
import type { StorageService } from '@/shared/storage';

function memoryStorage(): StorageService & { data: Map<string, unknown> } {
  const data = new Map<string, unknown>();
  return {
    data,
    get: async <T,>(key: string) => (data.has(key) ? (data.get(key) as T) : null),
    set: async <T,>(key: string, value: T) => void data.set(key, value),
    remove: async (key) => void data.delete(key),
    clear: async () => data.clear(),
  };
}

interface Entry {
  value: string;
  cachedAt: number;
  scope: string;
}

const TTL = 1000;

const policy: CachePolicy<string, string, Entry> = {
  storageKey: 'test:slot',
  isFresh: (entry, scope, now) => entry.scope === scope && now - entry.cachedAt < TTL,
  toEntry: (value, scope, now) => ({ value, cachedAt: now, scope }),
  toData: (entry) => entry.value,
};

let now: number;
let store: ReturnType<typeof memoryStorage>;
let fetcher: ReturnType<typeof vi.fn<(scope: string) => Promise<string>>>;

function build() {
  return createCachedResource({ policy, fetcher, storage: store, clock: { now: () => now } });
}

beforeEach(() => {
  now = 0;
  store = memoryStorage();
  fetcher = vi.fn(async (scope: string) => `data-${scope}-${now}`);
});

describe('createCachedResource.get', () => {
  it('should fetch and write the cache on a cold start', async () => {
    const result = await build().get('a');

    expect(result).toBe('data-a-0');
    expect(store.data.get('test:slot')).toEqual({ value: 'data-a-0', cachedAt: 0, scope: 'a' });
  });

  it('should not call the fetcher while the entry is fresh', async () => {
    const resource = build();
    await resource.get('a');
    now = TTL - 1;
    await resource.get('a');

    expect(fetcher).toHaveBeenCalledTimes(1);
  });

  it('should refetch once the entry is no longer fresh', async () => {
    const resource = build();
    await resource.get('a');
    now = TTL;

    expect(await resource.get('a')).toBe(`data-a-${TTL}`);
    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('should refetch when the key no longer matches the cached entry', async () => {
    const resource = build();
    await resource.get('a');
    await resource.get('b');

    expect(fetcher).toHaveBeenCalledTimes(2);
  });

  it('should propagate a fetch failure and leave the old entry in place', async () => {
    const resource = build();
    await resource.get('a');
    const before = store.data.get('test:slot');
    now = TTL;
    fetcher.mockRejectedValueOnce(new Error('offline'));

    await expect(resource.get('a')).rejects.toThrow('offline');
    expect(store.data.get('test:slot')).toBe(before);
  });

  it('should not write the cache when the first fetch fails', async () => {
    fetcher.mockRejectedValueOnce(new Error('offline'));

    await expect(build().get('a')).rejects.toThrow('offline');
    expect(store.data.size).toBe(0);
  });
});

describe('createCachedResource.refresh', () => {
  it('should fetch even when the entry is fresh and write the result', async () => {
    const resource = build();
    await resource.get('a');
    now = 10;

    expect(await resource.refresh('a')).toBe('data-a-10');
    expect(fetcher).toHaveBeenCalledTimes(2);
    expect(store.data.get('test:slot')).toMatchObject({ value: 'data-a-10', cachedAt: 10 });
  });

  it('should propagate a fetch failure', async () => {
    fetcher.mockRejectedValueOnce(new Error('offline'));

    await expect(build().refresh('a')).rejects.toThrow('offline');
  });
});
