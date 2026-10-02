import { describe, it, expect } from 'vitest';
import { resolveModules } from './module-registry';

describe('resolveModules', () => {
  it('should list every module in display order', () => {
    expect(resolveModules({}).map((m) => m.id)).toEqual([
      'clock-greetings',
      'bible',
      'weather',
      'focus',
      'prayer',
      'gratitude',
      'todo',
      'quotes',
      'quick-actions',
    ]);
  });

  it('should fall back to the module default when no override exists', () => {
    const bible = resolveModules({}).find((m) => m.id === 'bible');

    expect(bible?.enabled).toBe(true);
  });

  it('should prefer the user override over the module default', () => {
    const bible = resolveModules({ bible: false }).find((m) => m.id === 'bible');

    expect(bible?.enabled).toBe(false);
  });

  it('should keep disabled modules in the list so settings can show them', () => {
    const modules = resolveModules({ bible: false });

    expect(modules).toHaveLength(9);
  });

  it('should ignore overrides for unknown module ids', () => {
    expect(resolveModules({ missing: true })).toHaveLength(9);
  });
});
