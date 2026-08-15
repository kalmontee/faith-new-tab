# Faith New Tab

> "New Day. God's Plan. Better You."

A faith-centered Chrome extension that replaces the New Tab page with a personal dashboard. Bible content is one module — the real product is a modular, offline-first dashboard platform built with modern React architecture.

Cards float over a full-bleed background image with glassmorphism — translucent, blurred, calm. The aesthetic sits between Momentum (ambient, photo-forward) and Arc's New Tab (structured, utility-rich).

---

## Features

- **Live clock & greeting** — large-format time, date, and a greeting that changes with the time of day
- **Daily Bible verse** — cached offline, "New Verse" refresh, KJV out of the box with optional ESV / NKJV via API.Bible
- **Weather** — current conditions by geolocation, °F/°C toggle, 30-minute cache
- **Today's Focus** — a short daily intention with an optional tagline
- **Prayer Requests** — add, mark answered, remove — persisted locally
- **Today's Gratitude** — one reflection per day
- **To-Do List** — a simple persistent checklist
- **Daily Inspiration** — a rotating quote, bundled locally
- **Quick Actions** — share, copy, and favorite the daily verse
- **Background picker** — six bundled gradient themes plus a solid color option
- **Settings page** — module toggles, translation, background, temperature unit, display name
- **Motion** — staggered card fade-in, checkbox micro-interactions, fully respects `prefers-reduced-motion`
- **Offline-first** — every module renders from cache before it ever touches the network

---

## Tech Stack

| Layer               | Choice                                                                       |
| ------------------- | ---------------------------------------------------------------------------- |
| Extension framework | [WXT](https://wxt.dev/) (Manifest V3, New Tab override)                      |
| UI                  | React 19 + TypeScript                                                        |
| Styling             | Tailwind CSS v4 + custom glassmorphism component system                      |
| Global state        | Zustand (persisted to `chrome.storage.local`)                                |
| Async data          | TanStack Query                                                               |
| Validation          | Zod                                                                          |
| Local storage       | Chrome Storage API + IndexedDB (Dexie) behind a `StorageService` abstraction |
| Animation           | Framer Motion                                                                |
| Icons               | Lucide React                                                                 |
| Testing             | Vitest                                                                       |

See [docs/tech-stack.md](docs/tech-stack.md) for the full rationale behind each dependency.

---

## Getting Started

### Prerequisites

- Node.js 18+
- [pnpm](https://pnpm.io/)
- Google Chrome (or any Chromium-based browser) for loading the unpacked extension

### Install

```bash
pnpm install
```

### Environment variables

Bible verses work out of the box for **KJV** (via the free [bible-api.com](https://bible-api.com), no key required). To enable **ESV** and **NKJV**, get a free key from [scripture.api.bible](https://scripture.api.bible/signup) and copy it into a `.env` file:

```bash
cp .env.example .env
```

```dotenv
VITE_BIBLE_API_KEY=your_key_here
```

### Run in development

```bash
pnpm dev
```

WXT starts a dev server with hot reload and prints an output directory. To load it in Chrome:

1. Go to `chrome://extensions`
2. Enable **Developer mode** (top right)
3. Click **Load unpacked**
4. Select the generated `.output/chrome-mv3` folder
5. Open a new tab

Changes to source files hot-reload automatically.

---

## Commands

```bash
pnpm dev                # Start the WXT dev server with hot reload
pnpm build              # Production build
pnpm zip                # Package the extension as a .zip for the Chrome Web Store

pnpm lint               # ESLint
pnpm format             # Prettier — writes formatting fixes
pnpm typecheck          # tsc --noEmit

pnpm test:coverage
pnpm test               # Vitest unit tests

pnpm prepare            # Husky
```

---

## Architecture at a Glance

```
UI (React components)
  │
  ▼
Hooks (e.g. useDailyVerse)
  │
  ▼
Feature Service (e.g. verse-service)   — decides: cache? fetch? refresh?
  │
  ▼
StorageService (abstraction)
  │
  ├── Chrome Storage API   — settings, small cached data
  └── IndexedDB via Dexie  — todos, prayer requests, gratitude entries
```

The UI never calls `fetch` or `chrome.storage` directly. Every module renders from cache first — network is a background refresh, not a blocking dependency, so the user is never staring at a spinner on New Tab.

---

## System Design

New Day is a **client-side, offline-first system** — there is no owned backend. That reframes the usual scaling questions: there is no throughput to shard, no replicas to manage. The real constraints are **per-tab startup latency, bundle size, storage quota, and cache freshness.** A New Tab is opened dozens of times a day, so the effective latency budget for first paint is _zero_ — it must come from cache, every time.

### What we're optimizing for

| Dimension          | Reality                                  | Design consequence                                                             |
| ------------------ | ---------------------------------------- | ------------------------------------------------------------------------------ |
| New-tab opens      | ~30–100 per user per day                 | Each open is a cold React mount → first paint served from cache, never network |
| External API calls | 1 verse / 24h, weather / 30min           | `dateKey` cache means OurManna is hit at most once per active day              |
| Local data volume  | Todos/prayers/gratitude/focus — KB-scale | Fits IndexedDB comfortably; no pagination or eviction strategy needed          |
| Critical bundle    | newtab entry + shell only                | Every module and the Settings page are `React.lazy`, pulled on demand          |

### High-level runtime

```
Chrome (Manifest V3)
  │
  └─ entrypoints/newtab ─► <App>
                             │  view-store (Zustand, ambient) swaps views —
                             │  no page navigation, cross-faded via View Transitions API
              ┌──────────────┴──────────────┐
              ▼                              ▼
        <Dashboard>                   <SettingsPage>  (lazy, prefetched after first paint)
              │
              ▼
      <ModuleRenderer> ── reads module-registry + per-user moduleStates overrides
              │
     ┌────────┼────────┬────────┬─────────┬────────┐
     ▼        ▼        ▼        ▼         ▼        ▼
   clock    bible   weather   focus    prayer    todo …   (each lazy + Suspense-wrapped)
              │
     UI → hook → service → storage → api   (per-module vertical slice)
```

### Deep dives

**Module registry — the composition core.** Each module ships a `ModuleDefinition`: `id`, `title`, `icon`, a **lazy** `component`, and metadata (`refreshInterval`, `gridArea`, `requiresNetwork`, optional `settingsComponent`). `ModuleRenderer` loops the registry, applies the user's enable/disable overrides from the settings store, and places each card by `gridArea`. Adding a module is a self-contained slice plus one `registerModule` call — the dashboard shell never changes. The **no-cross-module-imports** rule is the invariant that keeps the platform modular.

**Storage — two backends, one discipline.** Small hot config (settings, the daily verse cache) lives in `chrome.storage.local` behind the `StorageService` interface. List and entry data (todos, prayers, gratitude, focus, favorites) lives in IndexedDB via Dexie, with a **versioned migration chain** (`app-db.ts`, v1→v4, including an upgrade that backfills `position` onto existing todos). A Zustand-compatible async adapter persists the settings store to Chrome Storage and falls back to `localStorage` when Chrome APIs are absent. Every storage call **fails soft**, so tests and non-extension contexts degrade instead of throwing.

**Offline-first flow (verse as the reference pattern).** `getDailyVerse()` reads the cache first; if today's `dateKey` matches, it returns immediately with zero network. Otherwise it fetches, **validates the response with Zod at the boundary**, writes the cache, and returns. A malformed upstream payload becomes a caught error, not a downstream crash. First paint is always cache-served; the network is a background refresh.

**View routing without navigation.** An ambient, unpersisted `view-store` swaps Dashboard ↔ Settings inside the same document. Swaps run through `withViewTransition`, which uses the View Transitions API for a cross-fade and falls back to an instant update under `prefers-reduced-motion` or where the API is unavailable. Settings is code-split and prefetched after first paint so its transition captures real content on first open.

**Config & feature flags.** `config/app-config.yaml` is split by `dev`/`production` environment and carries feature toggles. `FeatureToggleService` **fails dark** — an undeclared flag resolves to `false`.

### Reliability

- **Failure isolation.** Each module is `Suspense`-wrapped with a skeleton fallback; `requiresNetwork` marks progressive-enhancement candidates. One module failing is contained to its own card.
- **No single point of failure that matters.** No backend means no backend outage. The one external dependency (OurManna) is masked by the 24-hour cache — a failed fetch simply serves the last good verse.
- **Schema safety.** Dexie's versioned migrations, with upgrade backfills, are the recovery story for local data.
- **Testing.** Vitest covers services and hooks; the storage layer has integration tests against `fake-indexeddb`. husky + lint-staged gate every commit.

### Tradeoffs

| Decision                          | Buys                                   | Costs                                                |
| --------------------------------- | -------------------------------------- | ---------------------------------------------------- |
| No backend, all on-device         | Privacy, zero infra, instant reads     | No cross-device sync; no server-side analytics       |
| Two storage backends (KV + Dexie) | Right tool per data shape              | Two mental models; migrations only on the Dexie side |
| Static import registry            | Simple, type-safe, tree-shakeable      | A registry edit per module (no runtime plugins)      |
| Lazy modules + Settings prefetch  | Tiny critical bundle, fast first paint | Suspense / prefetch orchestration                    |
| Feature flags from bundled YAML   | Simple, no flag service                | Flags are fixed at build time — no runtime rollout   |

**Next up:** the MV3 background service worker is currently a stub. Wiring it to the already-declared `refreshInterval` metadata (scheduled cache warming, notifications) is the natural next step, followed by optional cross-device sync via `chrome.storage.sync` behind the existing `StorageService`.

---

## Documentation

| File                                           | Contents                                                                           |
| ---------------------------------------------- | ---------------------------------------------------------------------------------- |
| [docs/architecture.md](docs/architecture.md)   | Requirements, budgets, system architecture, folder structure, data flow, tradeoffs |
| [docs/tech-stack.md](docs/tech-stack.md)       | Every dependency with rationale, plus what was deliberately left out               |
| [docs/modules.md](docs/modules.md)             | Module registry spec, per-module behavior, caching rules                           |
| [docs/design-system.md](docs/design-system.md) | Visual spec — layout grid, colors, typography, card anatomy, motion                |
| [docs/roadmap.md](docs/roadmap.md)             | Phased development plan with deliverables per phase                                |

---

## Conventions

- **Naming:** kebab-case for folders and files, PascalCase for components, camelCase for hooks/utils/services
- **Exports:** barrel files (`index.ts`) per module; named exports only, except React components used in lazy loading
- **Types:** co-located with the module that owns them; shared types live in `shared/types/`
- **No cross-module imports** — modules never import from one another; shared code goes in `shared/`
- **Commits:** [Conventional Commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `chore:`, `docs:`)

Pre-commit hooks (husky + lint-staged) run ESLint and Prettier automatically.

---

## Roadmap Status

| Phase | Focus                                                           | Status         |
| ----- | --------------------------------------------------------------- | -------------- |
| 1     | Foundation — toolchain, extension shell                         | ✅ Done        |
| 2     | Core experience — clock, verse, theme, modules, settings        | ✅ Done        |
| 3     | Productivity — full module set, grid layout                     | ✅ Done        |
| 4     | Polish — translations, backgrounds, animation, onboarding, a11y | 🚧 In progress |
| 5     | Premium — sync, AI reflection, streaks                          | ⏳ Planned     |

See [docs/roadmap.md](docs/roadmap.md) for the full deliverable list per phase.

---

## License

Private project — not currently licensed for external use.
