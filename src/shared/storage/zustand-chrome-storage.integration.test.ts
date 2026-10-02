import { describe, it, expect, beforeEach, vi } from 'vitest';
import { zustandChromeStorage } from './index';
import { useSettingsStore } from '@/shared/store/settings-store';

beforeEach(() => {
  localStorage.clear();
});

describe('zustandChromeStorage', () => {
  it('should return null for a key that was never written', async () => {
    expect(await zustandChromeStorage.getItem('missing')).toBeNull();
  });

  it('should round-trip a string through chrome.storage.local', async () => {
    await zustandChromeStorage.setItem('k', '{"a":1}');

    expect(await zustandChromeStorage.getItem('k')).toBe('{"a":1}');
    expect(localStorage.getItem('k')).toBeNull();
  });

  it('should stringify a non-string value stored by another writer', async () => {
    await chrome.storage.local.set({ k: { a: 1 } });

    expect(await zustandChromeStorage.getItem('k')).toBe('{"a":1}');
  });

  it('should remove a key', async () => {
    await zustandChromeStorage.setItem('k', 'v');
    await zustandChromeStorage.removeItem('k');

    expect(await zustandChromeStorage.getItem('k')).toBeNull();
  });

  it('should fall back to localStorage when chrome is unavailable', async () => {
    vi.stubGlobal('chrome', undefined);

    await zustandChromeStorage.setItem('k', '{"a":1}');

    expect(await zustandChromeStorage.getItem('k')).toBe('{"a":1}');
    await zustandChromeStorage.removeItem('k');
    expect(await zustandChromeStorage.getItem('k')).toBeNull();
  });
});

describe('settings store persistence', () => {
  it('should write settings under the new-day:settings key', async () => {
    useSettingsStore.getState().setUserName('Grace');

    await vi.waitFor(async () => {
      expect(await zustandChromeStorage.getItem('new-day:settings')).toContain('"userName":"Grace"');
    });
  });

  it('should rehydrate settings from the new-day:settings key', async () => {
    await zustandChromeStorage.setItem('new-day:settings', JSON.stringify({ state: { userName: 'Ruth' }, version: 0 }));

    await useSettingsStore.persist.rehydrate();

    expect(useSettingsStore.getState().userName).toBe('Ruth');
  });
});
