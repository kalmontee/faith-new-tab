import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ChromeStorageAdapter } from './chrome-adapter';

// Integration test: exercises the real adapter against the stateful
// chrome.storage.local mock installed in src/test/setup.ts. No method mocking —
// values are written and read back through the actual chrome API surface.

const adapter = new ChromeStorageAdapter();

interface Settings {
  userName: string;
  modules: Record<string, boolean>;
}

const settings: Settings = { userName: 'John', modules: { verse: true, weather: false } };

beforeEach(async () => {
  await adapter.clear();
});

describe('ChromeStorageAdapter (integration)', () => {
  it('should return null for a key that was never written', async () => {
    expect(await adapter.get('missing')).toBeNull();
  });

  it('should round-trip a value through set then get', async () => {
    await adapter.set('settings', settings);
    expect(await adapter.get<Settings>('settings')).toEqual(settings);
  });

  it('should overwrite the value on a repeated set', async () => {
    await adapter.set('name', 'first');
    await adapter.set('name', 'second');

    expect(await adapter.get<string>('name')).toBe('second');
  });

  it('should keep keys isolated from one another', async () => {
    await adapter.set('a', 1);
    await adapter.set('b', 2);

    expect(await adapter.get<number>('a')).toBe(1);
    expect(await adapter.get<number>('b')).toBe(2);
  });

  it('should remove a single key without touching the others', async () => {
    await adapter.set('a', 1);
    await adapter.set('b', 2);

    await adapter.remove('a');

    expect(await adapter.get('a')).toBeNull();
    expect(await adapter.get<number>('b')).toBe(2);
  });

  it('should clear every key', async () => {
    await adapter.set('a', 1);
    await adapter.set('b', 2);

    await adapter.clear();

    expect(await adapter.get('a')).toBeNull();
    expect(await adapter.get('b')).toBeNull();
  });

  it('should preserve nested object structure across a round-trip', async () => {
    await adapter.set('settings', settings);

    const read = await adapter.get<Settings>('settings');

    expect(read?.modules.verse).toBe(true);
    expect(read?.modules.weather).toBe(false);
  });

  it('should treat a stored null as an absent value', async () => {
    // chrome returns undefined for absent keys; the adapter coalesces both to null.
    await adapter.set<null>('nullable', null);

    expect(await adapter.get('nullable')).toBeNull();
  });

  it('should propagate a failure from the underlying chrome API', async () => {
    vi.spyOn(chrome.storage.local, 'get').mockRejectedValueOnce(new Error('quota'));

    await expect(adapter.get('settings')).rejects.toThrow('quota');
  });
});
