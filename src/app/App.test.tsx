import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';

import { App } from './App';
import Dashboard from './dashboard/Dashboard';
import { useViewStore } from '@/shared/store/view-store';
import { createQueryWrapper } from '@/test/test-utils';

// The persistent background element rendered by DashboardBackground. Selected
// by data hook rather than gradient string, since BackgroundPicker swatches
// also carry inline gradients.
function backgroundLayers(container: HTMLElement): NodeListOf<Element> {
  return container.querySelectorAll('[data-app-background]');
}

describe('App shell', () => {
  beforeEach(() => {
    useViewStore.setState({ view: 'dashboard' });
  });

  it('should render the dashboard content', () => {
    render(<App />, { wrapper: createQueryWrapper() });
    expect(screen.getByText(/God's Plan\. Better You\./i)).toBeTruthy();
  });

  it('should render exactly one persistent background around the content', () => {
    const { container } = render(<App />, { wrapper: createQueryWrapper() });
    expect(backgroundLayers(container)).toHaveLength(1);
  });

  it('should render the dashboard view without a background of its own', () => {
    const { container } = render(<Dashboard />, { wrapper: createQueryWrapper() });
    expect(backgroundLayers(container)).toHaveLength(0);
  });

  it('should show the settings view when the view store opens settings', async () => {
    useViewStore.setState({ view: 'settings' });
    render(<App />, { wrapper: createQueryWrapper() });
    expect(await screen.findByRole('heading', { name: 'Settings' })).toBeTruthy();
  });

  it('should keep exactly one background when swapped to the settings view', async () => {
    useViewStore.setState({ view: 'settings' });
    const { container } = render(<App />, { wrapper: createQueryWrapper() });
    // Wait for the lazy Settings chunk before asserting the background survived.
    await screen.findByRole('heading', { name: 'Settings' });
    expect(backgroundLayers(container)).toHaveLength(1);
  });
});
