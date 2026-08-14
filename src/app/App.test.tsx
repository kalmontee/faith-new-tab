import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

import { App } from './App';
import Dashboard from './dashboard/Dashboard';
import { createQueryWrapper } from '@/test/test-utils';

// The persistent background is the one element carrying an inline gradient
// (the dark overlay above it is a class, not an inline style).
function gradientLayers(container: HTMLElement): NodeListOf<Element> {
  return container.querySelectorAll('[style*="linear-gradient"]');
}

describe('App shell', () => {
  it('should render the dashboard content', () => {
    render(<App />, { wrapper: createQueryWrapper() });
    expect(screen.getByText(/God's Plan\. Better You\./i)).toBeTruthy();
  });

  it('should render exactly one persistent background around the content', () => {
    const { container } = render(<App />, { wrapper: createQueryWrapper() });
    expect(gradientLayers(container)).toHaveLength(1);
  });

  it('should render the dashboard view without a background of its own', () => {
    // Task 1 lifts the background up into the shell, so Dashboard on its own
    // must not paint one — otherwise the shell would stack two backgrounds.
    const { container } = render(<Dashboard />, { wrapper: createQueryWrapper() });
    expect(gradientLayers(container)).toHaveLength(0);
  });
});
