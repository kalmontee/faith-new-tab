import { describe, it, expect, beforeEach } from 'vitest';

import { useViewStore } from './view-store';

describe('view-store', () => {
  beforeEach(() => {
    useViewStore.setState({ view: 'dashboard' });
  });

  it('should default to the dashboard view', () => {
    expect(useViewStore.getState().view).toBe('dashboard');
  });

  it('should switch to the settings view when openSettings is called', () => {
    useViewStore.getState().openSettings();
    expect(useViewStore.getState().view).toBe('settings');
  });

  it('should return to the dashboard view when closeSettings is called', () => {
    useViewStore.getState().openSettings();
    useViewStore.getState().closeSettings();
    expect(useViewStore.getState().view).toBe('dashboard');
  });
});
