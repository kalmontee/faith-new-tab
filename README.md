# New Day

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

Without a key, ESV and NKJV silently fall back to KJV.

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
pnpm dev              # Start the WXT dev server with hot reload
pnpm build             # Production build
pnpm zip                # Package the extension as a .zip for the Chrome Web Store

pnpm lint               # ESLint
pnpm format             # Prettier — writes formatting fixes
pnpm test               # Vitest unit tests
pnpm typecheck          # tsc --noEmit
```

---

## Project Structure

```
src/
  app/                  # Page-level shells
    dashboard/          # New Tab main view (header, footer, grid, background)
    settings/           # Extension settings page
  modules/               # Each dashboard widget is self-contained
    bible/  weather/  clock/  todo/
    gratitude/  prayer/  focus/  quotes/  quick-actions/
  shared/                # Cross-cutting code — never imported *between* modules
    ui/                  # Card, Toggle, and other shared primitives
    lib/                 # module-registry, daily-rotation, utils
    storage/             # StorageService abstraction (Chrome Storage + IndexedDB)
    store/               # Zustand stores (settings, current verse)
    types/                # Shared TypeScript types
  entrypoints/            # WXT entrypoints — background worker, newtab, settings
  styles/                 # Global Tailwind entry (app.css)
```

Each module owns everything it needs — `api/`, `components/`, `hooks/`, `services/`, `storage/`, `types.ts`, `index.ts` — and registers itself with the dashboard through `shared/lib/module-registry.ts`. Adding a new module never requires touching the dashboard shell. Full details in [docs/architecture.md](docs/architecture.md) and [docs/modules.md](docs/modules.md).

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

## Documentation

| File                                           | Contents                                                             |
| ---------------------------------------------- | -------------------------------------------------------------------- |
| [docs/architecture.md](docs/architecture.md)   | System architecture, folder structure, data flow, state management   |
| [docs/tech-stack.md](docs/tech-stack.md)       | Every dependency with rationale, plus what was deliberately left out |
| [docs/modules.md](docs/modules.md)             | Module registry spec, per-module behavior, caching rules             |
| [docs/design-system.md](docs/design-system.md) | Visual spec — layout grid, colors, typography, card anatomy, motion  |
| [docs/roadmap.md](docs/roadmap.md)             | Phased development plan with deliverables per phase                  |

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
