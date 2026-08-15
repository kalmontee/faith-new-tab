# Architecture

New Day is a **client-side, offline-first system** — there is no owned backend. That reframes the usual scaling questions: there is no throughput to shard, no replicas to manage. The real constraints are **per-tab startup latency, bundle size, storage quota, and cache freshness.** A New Tab is opened dozens of times a day, so the effective latency budget for first paint is *zero* — it must come from cache, every time. Every design decision below serves that.

---

## Requirements & Scope

**What it is.** A Chrome Manifest V3 New Tab override that renders a faith-centered dashboard. Bible content is one module among nine; the real product is a **modular dashboard platform** where each widget is a self-registering, independently-loaded unit.

**Functional**

- Replace New Tab with a dashboard of toggleable modules (clock, verse, weather, focus, prayer, gratitude, todo, quotes, quick-actions).
- Each module persists its own state locally and survives offline / API failure.
- User configures name, background, units, and enabled modules — inline, without a page reload.
- Daily Bible verse from a third-party API (OurManna), cached 24h.

**Non-functional**

- **Offline-first:** cache-before-network; no loading spinner blocks first paint.
- **Fast first paint:** the perceived latency budget is effectively zero.
- **Small critical bundle:** Settings and every module are code-split out of the newtab path.
- **Privacy:** all user data stays on-device; only the `storage` permission is requested.
- **Progressive enhancement:** a network-dependent module failing never breaks the dashboard.

---

## Capacity & Budgets

The scaling problem is not throughput — it's **startup latency and bundle discipline per tab.**

| Dimension            | Estimate                        | Implication                                                        |
| -------------------- | ------------------------------- | ----------------------------------------------------------------- |
| New-tab opens        | ~30–100 / user / day            | Each open is a cold React mount → first paint served from cache   |
| External API calls   | 1 verse / 24h + weather / 30min | `dateKey` cache means OurManna is hit at most once per active day |
| Local data volume    | Dozens of rows, KB-scale        | Fits IndexedDB comfortably; no pagination, sharding, or eviction  |
| chrome.storage quota | ~5–10 MB                        | Settings + verse cache are tiny (<50 KB)                          |
| Critical bundle      | newtab entry + shell only       | Modules & Settings are `React.lazy`, pulled on demand            |

---

## High-Level System

```
Chrome Extension (Manifest V3)
            │
            ▼
      New Tab Entry (React + WXT)
            │
  ┌─────────┼─────────┐
  ▼         ▼         ▼
Dashboard  Settings  Background Worker
  │
  ▼
Module Registry
  │
  ├── Bible Verse
  ├── Weather
  ├── Clock
  ├── Todo
  ├── Gratitude
  ├── Prayer
  ├── Focus
  ├── Quotes
  ├── Quick Actions
  └── (future modules)
```

---

## Folder Structure

Organized by feature, not by file type. (`srcDir: 'src'` in `wxt.config.ts`; the manifest itself is inline there rather than a separate `manifest.ts`.)

```
src/
│
├── entrypoints/                     # WXT entrypoints (each folder/file = one build target)
│   ├── newtab/
│   │   ├── index.html
│   │   └── main.tsx                 # Mounts <App>
│   ├── settings/
│   │   ├── index.html
│   │   └── main.tsx
│   └── background.ts                # MV3 service worker (currently a stub)
│
├── app/
│   ├── App.tsx                       # Swaps Dashboard / SettingsPage on view-store, cross-faded
│   ├── dashboard/
│   │   ├── Dashboard.tsx            # Grid shell
│   │   ├── DashboardBackground.tsx  # Background image/color layer
│   │   ├── DashboardHeader.tsx      # Greeting + clock + settings entry point
│   │   ├── DashboardFooter.tsx      # Bottom verse bar + nav icons
│   │   ├── ModuleRenderer.tsx       # Loops the registry, applies moduleStates overrides
│   │   └── footer-verses.ts
│   └── settings/
│       ├── SettingsPage.tsx         # Lazy-loaded, prefetched after first paint
│       ├── BackgroundPicker.tsx
│       └── UnitToggle.tsx
│
├── modules/
│   ├── bible/
│   │   ├── api/
│   │   │   └── verse-api.ts         # Fetch from OurManna
│   │   ├── components/
│   │   │   ├── VerseCard.tsx        # Main card UI (the module's lazy component)
│   │   │   ├── VerseReference.tsx
│   │   │   └── Skeleton.tsx
│   │   ├── hooks/
│   │   │   └── use-daily-verse.ts
│   │   ├── services/
│   │   │   └── verse-service.ts     # Cache / fetch / store orchestration
│   │   ├── storage/
│   │   │   └── verse-storage.ts     # chrome.storage.local, keyed by dateKey
│   │   ├── types.ts
│   │   ├── module.ts                # ModuleDefinition + registerModule-eligible export
│   │   └── index.ts                 # Barrel export
│   │
│   ├── weather/                     # Same api/components/hooks/services/storage shape (+utils/)
│   ├── todo/                        # No api/storage — services call shared/storage/app-db.ts (Dexie) directly
│   ├── gratitude/                   # Same Dexie-backed shape as todo/
│   ├── prayer/                      # Same Dexie-backed shape as todo/
│   ├── focus/                       # Same Dexie-backed shape as todo/, no index.ts barrel
│   ├── clock/                       # components/ + hooks/ only, no network or persistence
│   ├── quotes/                      # Bundled data (quotes-data.ts), daily-rotation pick, no api/
│   └── quick-actions/               # Favorites service (Dexie) + opens Settings via view-store
│
├── shared/
│   ├── ui/                          # shadcn/ui primitives in use today: card.tsx, toggle.tsx
│   ├── lib/
│   │   ├── module-registry.ts       # Central registry: registerModule/getEnabledModules
│   │   ├── daily-rotation.ts        # Deterministic day-of-year picker (quotes, footer verses)
│   │   ├── view-transition.ts       # withViewTransition() wrapper for view-store swaps
│   │   └── utils.ts
│   ├── storage/
│   │   ├── storage-service.ts       # StorageService interface — get/set/remove/clear
│   │   ├── chrome-adapter.ts        # StorageService impl over chrome.storage.local (settings, KV cache)
│   │   ├── app-db.ts                # Dexie database + versioned migration chain (v1→v4)
│   │   └── index.ts                 # Exports `storage` (KV) and `zustandChromeStorage` (persist adapter)
│   ├── store/                       # Zustand stores
│   │   ├── settings-store.ts        # userName, moduleStates, units, background — persisted via zustandChromeStorage
│   │   ├── view-store.ts            # Ambient dashboard/settings view toggle (unpersisted)
│   │   └── current-verse-store.ts
│   ├── feature-flags/
│   │   ├── feature-toggle-service.ts # Fails dark: undeclared flag ⇒ false
│   │   └── flags.ts
│   ├── types/
│   │   ├── module.ts                # ModuleDefinition, ModuleConfig, CurrentVerse
│   │   ├── table.ts                 # Dexie row types (TodoItem, etc.)
│   │   ├── app-config.ts
│   │   ├── feature-toggles.ts
│   │   └── background-presets.ts
│   ├── enums/
│   │   └── toggles.ts
│   └── utils/
│       ├── date.ts                  # getTodayKey() — the dateKey cache-freshness check
│       ├── greeting.ts
│       └── background.ts
│
└── yaml.d.ts

config/
└── app-config.yaml                  # Split by dev/production, read by FeatureToggleService
```

---

## Architectural Pattern: Feature-Based Architecture

Each module owns everything it needs:

```
module/
  ├── api/          → Network calls
  ├── components/   → React components
  ├── hooks/        → Custom hooks (public API for the UI)
  ├── services/     → Business logic + orchestration
  ├── storage/      → Persistence (uses shared StorageService)
  ├── types.ts      → Module-specific types
  └── index.ts      → Module registration
```

No cross-module coupling. If two modules need the same utility, it goes in `shared/`.

---

## Module Registry

Every module registers itself by providing a `ModuleDefinition`:

```ts
interface ModuleDefinition {
  id: string; // e.g. "verse", "weather"
  title: string; // e.g. "Daily Verse"
  description: string; // One-liner for settings
  icon: LucideIcon; // Icon component
  enabled: boolean; // Default state
  component: React.LazyExoticComponent<React.FC>;
  refreshInterval?: 'daily' | 'hourly' | '30min' | 'never';
  gridArea?: string; // CSS Grid placement hint
  requiresNetwork?: boolean; // For progressive enhancement
}
```

The dashboard simply iterates:

```tsx
enabledModules.map((mod) => (
  <Suspense key={mod.id} fallback={<ModuleSkeleton />}>
    <mod.component />
  </Suspense>
));
```

Adding a new module = creating a folder, writing the component, and registering it. Zero changes to the dashboard shell.

---

## Data Flow

**App shell: new tab → first paint**

```
Open New Tab
  │
  ▼
entrypoints/newtab/main.tsx mounts <App>
  │
  ▼
useSettingsStore hydrates from zustandChromeStorage  ← chrome.storage.local, near-instant
  │                                                     (moduleStates, userName, units, background)
  ▼
view-store defaults to 'dashboard' → <Dashboard> renders (SettingsPage stays unmounted + code-split)
  │
  ▼
ModuleRenderer reads getAllModules() from the registry, filters by
moduleStates[id] ?? module.enabled
  │
  ▼
Each enabled module mounts inside its own <Suspense>          ← layout appears immediately,
  │                                                              one skeleton per module
  ▼
Every module's hook (e.g. useDailyVerse) loads its own cached data independently
```

Settings is prefetched (`import('./settings/SettingsPage')`) in a `useEffect` after first paint, and opening it swaps `view-store` inside `withViewTransition()` so dashboard ↔ settings cross-fade instead of navigating — no route change, no remount of the shell.

**Per-module data flow (the offline-first contract, e.g. `bible`)**

```
Module hook calls its service (UI never touches storage/fetch directly)
  │
  ▼
Service reads its cache first
  │
  ├── Cache hit + same dateKey (getTodayKey())  → return immediately, zero network
  │
  └── Cache miss / stale → fetch from API → validate with Zod at the boundary
        → write cache → return
```

Modules split into two shapes depending on what they persist:

- **Network + KV-cached** (bible, weather): `services/` call `storage/` in the module, which wraps `chrome.storage.local` via the shared `StorageService`/`chrome-adapter`. Freshness is keyed by `dateKey` (bible) or a short TTL (weather).
- **Relational, offline-only** (todo, prayer, gratitude, focus, quick-actions favorites): `services/` import `db` from `shared/storage/app-db.ts` (Dexie) directly — there's no per-module `storage/` folder because IndexedDB is already the abstraction. No network step at all.
- **Static/bundled** (clock, quotes): no service layer needed — quotes picks deterministically via `shared/lib/daily-rotation.ts` (`dayOfYear() % items.length`) so "today's quote" is stable without any storage read.

The user never stares at a blank tab: skeletons render before any cache read resolves, and a stale-but-present cache always wins over waiting on the network.

---

## System Layers

```
UI (React components)
  │
  ▼
Hooks (e.g. useDailyVerse)
  │
  ▼
Feature Service (e.g. VerseService)
  │    Decides: use cache? call API? refresh? store?
  ▼
Two persistence paths, chosen per data shape — not one shared abstraction:
  │
  ├── StorageService (chrome-adapter) → chrome.storage.local
  │     Settings, feature flags, small KV caches (verse, weather)
  │
  └── db (Dexie), imported directly from shared/storage/app-db.ts
        Relational content: todos, prayer requests, gratitude, favorites
```

The UI never calls `fetch` directly, and it never calls `chrome.storage` or Dexie directly — both are reached through a service. But the two storage backends are separate, purpose-built interfaces rather than one abstraction with two adapters: `StorageService` only ever wraps `chrome.storage.local`, and Dexie-backed services hold `db` as their persistence layer instead of going through `StorageService`.

---

## Storage Layer

Two separate, purpose-built backends — not one abstraction with pluggable adapters.

**KV data** (settings, feature flags, small caches) goes through `StorageService`:

```ts
storage.get<T>(key: string): Promise<T | null>
storage.set<T>(key: string, value: T): Promise<void>
storage.remove(key: string): Promise<void>
storage.clear(): Promise<void>
```

`ChromeStorageAdapter` is the only implementation today, wrapping `chrome.storage.local` (on-device; cross-device sync via `chrome.storage.sync` is a future option behind the same interface). A second, parallel piece — `zustandChromeStorage` in `shared/storage/index.ts` — adapts the same `chrome.storage.local` calls to Zustand's `persist` middleware contract and falls back to `localStorage` when the Chrome API is unavailable (tests, dev). It's what `settings-store` uses; it does not go through `StorageService`.

**Relational data** (todos, prayer requests, gratitude entries, favorites) goes straight to `db`, a Dexie instance exported from `shared/storage/app-db.ts`, with a versioned migration chain (v1→v4). Services import `db` directly — there is no intermediate storage interface for this path, since Dexie's API is already the abstraction.

Because `StorageService` is a named interface with one implementation, adding a second backend (e.g. porting the KV path to Firefox or a web app) means writing a new adapter and swapping it in — the Dexie path would need its own equivalent effort, since it isn't behind that interface.

---

## State Management

**Global state (Zustand):**

- Theme (dark / light / system)
- User settings and preferences
- Enabled modules list
- Background image selection

**Local state (React state / hooks):**

- Todo items
- Prayer requests
- Weather data
- Current verse
- Gratitude entries

Rule of thumb: if only one module cares about it, keep it local. If the dashboard shell or settings page also needs it, promote to Zustand.

---

## Background Worker

> **Status:** currently a stub (`entrypoints/background.ts` only logs on startup). The `refreshInterval` metadata already declared on each module is the intended trigger source; wiring it up is the next step. The responsibilities below are the target design.

The Manifest V3 service worker is intended to handle:

- Alarm-based scheduled refreshes (daily verse, weather)
- Browser notifications (prayer reminders, verse of the day)
- Badge updates
- Future: cloud sync coordination

Keep the React app focused on rendering. The background worker handles timing.

---

## Offline Architecture

The cache layer sits between the UI and the network:

```
   ✅ Correct: UI → Cache → API (fallback)
   ❌ Wrong:   UI → API → Cache
```

Every module renders from cache first. Network is a background refresh, not a blocking dependency. If the network fails, the user still sees yesterday's verse, the last weather reading, and all local data.

---

## Error Boundaries

Each module is wrapped in its own error boundary. If the weather API is down, the verse card, todo list, and everything else still work. A failed module shows a minimal fallback UI, never a white screen.

---

## Tradeoffs

| Decision                          | Buys                                   | Costs                                          |
| --------------------------------- | -------------------------------------- | ---------------------------------------------- |
| No backend, all on-device         | Privacy, zero infra, instant reads     | No cross-device sync; no server analytics      |
| Two storage backends (KV + Dexie) | Right tool per data shape              | Two mental models; migrations only Dexie-side  |
| Static import registry            | Simple, type-safe, tree-shakeable      | A registry edit per module (no runtime plugins) |
| Lazy modules + prefetch Settings  | Tiny critical bundle, fast first paint | Prefetch / Suspense orchestration complexity   |
| Feature flags from bundled YAML   | Simple, no flag service                | Flags fixed at build time — no runtime rollout |

---

## Future Work

1. **Activate the service worker** — scheduled refresh honoring each module's `refreshInterval`, plus notifications. (See the Background Worker section — currently a stub.)
2. **Cross-device sync** — optional, via `chrome.storage.sync` behind the existing `StorageService`.
3. **Drag-to-reorder module layout**, persisted to settings.
4. **Observability** — the codebase has almost no structured logging today, so field failures are currently invisible. Lightweight instrumentation is the highest-leverage reliability gap.
5. **Storage-quota / eviction posture** — currently N/A because data is KB-scale, but worth stating explicitly as data grows.
