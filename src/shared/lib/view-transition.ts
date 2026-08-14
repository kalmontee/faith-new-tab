import { flushSync } from 'react-dom';

function prefersReducedMotion(): boolean {
  return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
}

// Run a DOM-mutating update inside a same-document View Transition for a smooth
// cross-fade. Falls back to an instant update where the API is unavailable or
// the user prefers reduced motion. flushSync forces React to commit the update
// synchronously so the transition captures the new DOM.
export function withViewTransition(update: () => void): void {
  if (!document.startViewTransition || prefersReducedMotion()) {
    update();
    return;
  }

  document.startViewTransition(() => flushSync(update));
}
