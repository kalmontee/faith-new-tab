import { describe, it, expect, beforeEach } from 'vitest';
import { zustandChromeStorage } from '@/shared/storage';
import { useSettingsStore } from './settings-store';
import type { ManualLocation } from '@/shared/types/location';

const LAGOS: ManualLocation = { name: 'Lagos', label: 'Lagos, Lagos, Nigeria', lat: 6.45, lng: 3.4 };

beforeEach(() => {
  useSettingsStore.setState({ manualLocation: null });
});

describe('settings store manual location', () => {
  it('should default to automatic (browser) location', () => {
    expect(useSettingsStore.getState().manualLocation).toBeNull();
  });

  it('should store a manual location and clear it again', () => {
    useSettingsStore.getState().setManualLocation(LAGOS);
    expect(useSettingsStore.getState().manualLocation).toEqual(LAGOS);

    useSettingsStore.getState().setManualLocation(null);
    expect(useSettingsStore.getState().manualLocation).toBeNull();
  });

  it('should keep automatic location when hydrating settings saved before manual location existed', async () => {
    await zustandChromeStorage.setItem('new-day:settings', JSON.stringify({ state: { userName: 'Grace' }, version: 0 }));

    await useSettingsStore.persist.rehydrate();

    expect(useSettingsStore.getState().userName).toBe('Grace');
    expect(useSettingsStore.getState().manualLocation).toBeNull();
  });
});
