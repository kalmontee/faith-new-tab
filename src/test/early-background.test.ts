import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { beforeEach, describe, expect, it } from 'vitest';

const script = readFileSync(resolve(__dirname, '../../public/early-background.js'), 'utf-8');
const run = () => new Function(script)();

beforeEach(() => {
  localStorage.clear();
  document.documentElement.removeAttribute('style');
});

describe('early-background script', () => {
  it('should apply the mirrored background to the root element', () => {
    localStorage.setItem('new-day:bg', 'linear-gradient(to bottom, #0b1d26 0%, #7ed6d9 100%)');

    run();

    expect(document.documentElement.style.background).toContain('linear-gradient');
  });

  it('should leave the root element untouched when nothing is mirrored', () => {
    run();

    expect(document.documentElement.getAttribute('style')).toBeNull();
  });

  it('should not throw when localStorage is unavailable', () => {
    const original = Object.getOwnPropertyDescriptor(window, 'localStorage')!;
    Object.defineProperty(window, 'localStorage', {
      configurable: true,
      get() {
        throw new Error('blocked');
      },
    });

    try {
      expect(run).not.toThrow();
    } finally {
      Object.defineProperty(window, 'localStorage', original);
    }
  });
});
