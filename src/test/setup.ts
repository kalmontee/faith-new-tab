// Global test setup — loaded via vitest.config.ts `setupFiles`.
//
// Two things every test needs:
//   1. A real (in-memory) IndexedDB so the Dexie layer works in JSDOM. Storage
//      integration tests exercise the actual database rather than a mock.
//   2. A minimal `chrome.storage.local` mock so the ChromeStorageAdapter and the
//      Zustand chrome-backed storage have a stateful backend to talk to.

import 'fake-indexeddb/auto';
import { beforeEach, afterEach, vi } from 'vitest';

// ── chrome.storage.local mock ──────────────────────────────────────────────
// A stateful in-memory store so get/set/remove/clear behave like the real API.

const store = new Map<string, unknown>();

function createChromeMock() {
  return {
    storage: {
      local: {
        get: vi.fn(async (key?: string | string[] | null) => {
          if (key == null) return Object.fromEntries(store);
          const keys = Array.isArray(key) ? key : [key];
          const result: Record<string, unknown> = {};
          for (const k of keys) {
            if (store.has(k)) result[k] = store.get(k);
          }
          return result;
        }),
        set: vi.fn(async (items: Record<string, unknown>) => {
          for (const [k, v] of Object.entries(items)) store.set(k, v);
        }),
        remove: vi.fn(async (key: string | string[]) => {
          const keys = Array.isArray(key) ? key : [key];
          for (const k of keys) store.delete(k);
        }),
        clear: vi.fn(async () => {
          store.clear();
        }),
      },
    },
    runtime: {
      getURL: vi.fn((path: string) => `chrome-extension://test-id/${path}`),
    },
  };
}

// Expose the backing store so tests can reset it between cases.
export function resetChromeStorage() {
  store.clear();
}

// Re-stub before every test: individual tests may call vi.unstubAllGlobals()
// in their own teardown, which would otherwise strip `chrome` for later tests.
beforeEach(() => {
  vi.stubGlobal('chrome', createChromeMock());
});

afterEach(() => {
  resetChromeStorage();
});
