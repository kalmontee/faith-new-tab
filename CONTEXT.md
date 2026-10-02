# Context

Terms used in this codebase. Architecture vocabulary (module, interface, seam, adapter, depth) follows the `codebase-design` skill.

- **Cached resource** (`shared/lib/cached-resource.ts`): cache-first module. A caller supplies a policy (`storageKey`, `isFresh`, `toEntry`, `toData`) and a fetcher; it returns `get(key)` (cache if fresh, else fetch and store) and `refresh(key)` (always fetch and store). `refresh` is the entry point for the future background alarm.
- **Cache policy**: the per-resource rules for freshness and entry shape. Verse: same `dateKey`. Weather: 30 minute TTL, location within ~0.1°, same unit.
- **Daily entry** (`shared/lib/daily-entry.ts`): one row per day on a Dexie table with `date`, `id`, `updatedAt`. `getToday()` and `saveToday(fields)` (a transactional upsert). Used by focus and gratitude.
- **Live collection** (`shared/hooks/use-live-collection.ts`): a hook over Dexie `liveQuery` returning `{ data, isLoading }`. It re-emits on any write to the queried tables, including from other tabs. The querier must be a stable reference.
- **Optimistic override** (`shared/hooks/use-optimistic-override.ts`): shows a pending value (todo drag order, just-saved entry) until the live collection emits a new reference.
- **Fail-soft storage** (`shared/storage/fail-soft-storage.ts`): the `storage` implementation. Never throws; falls back to localStorage when `chrome.storage` is unavailable.
- **Resolved modules** (`resolveModules(moduleStates)` in `shared/lib/module-registry.ts`): registry modules in display order with the user's enabled override applied over each default.
- **Current verse**: ambient, unpersisted store holding the verse on screen. Null until the bible module publishes one; readers disable verse actions while null.

## Decisions not taken
- `dexie-react-hooks` for live queries: rejected in favor of the in-house hook (about 15 lines on `liveQuery`, no new dependency).
- TanStack Query over Dexie: rejected; it keeps manual re-reads and has no cross-tab updates for IndexedDB.
- Replacing the ambient current-verse store with an explicit interface: not done; one reader, one publisher, and modules cannot import each other.
