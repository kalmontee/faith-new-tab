import { describe, it, expect, vi, afterEach } from 'vitest';

import { withViewTransition } from './view-transition';

// jsdom implements neither startViewTransition nor matchMedia; each test opts in
// by assigning them, and we strip both afterwards so cases stay isolated.
const mutableDoc = document as unknown as {
  startViewTransition?: (cb: () => void) => { finished: Promise<void> };
};

afterEach(() => {
  delete mutableDoc.startViewTransition;
  vi.unstubAllGlobals();
});

describe('withViewTransition', () => {
  it('should run the update directly when the View Transitions API is unavailable', () => {
    const update = vi.fn();
    withViewTransition(update);
    expect(update).toHaveBeenCalledTimes(1);
  });

  it('should run the update through startViewTransition when available', () => {
    const startViewTransition = vi.fn((cb: () => void) => {
      cb();
      return { finished: Promise.resolve() };
    });
    mutableDoc.startViewTransition = startViewTransition;

    const update = vi.fn();
    withViewTransition(update);

    expect(startViewTransition).toHaveBeenCalledTimes(1);
    expect(update).toHaveBeenCalledTimes(1);
  });

  it('should skip the transition and update directly when reduced motion is preferred', () => {
    const startViewTransition = vi.fn((cb: () => void) => {
      cb();
      return { finished: Promise.resolve() };
    });
    mutableDoc.startViewTransition = startViewTransition;
    vi.stubGlobal(
      'matchMedia',
      vi.fn().mockReturnValue({ matches: true })
    );

    const update = vi.fn();
    withViewTransition(update);

    expect(startViewTransition).not.toHaveBeenCalled();
    expect(update).toHaveBeenCalledTimes(1);
  });
});
