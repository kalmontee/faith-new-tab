# Development Roadmap

Build in phases. Ship each phase before starting the next.

---

## Phase 1 — Foundation

**Goal:** Empty dashboard shell that opens on New Tab, with the full toolchain working.

**Deliverables:**

- Initialize project with WXT + React 19 + TypeScript + Tailwind CSS v4
- Install and configure: shadcn/ui, Zustand, Zod, TanStack Query, Dexie, Framer Motion, Lucide React
- Set up ESLint, Prettier, Vitest, Git hooks (husky + lint-staged)
- Configure path aliases (`@/modules/*`, `@/shared/*`, `@/app/*`)
- Create the feature-based folder structure
- `manifest.ts`: override New Tab with the dashboard entry point
- Dashboard shell renders a centered "New Day" placeholder
- Build + load in Chrome successfully

**Exit criteria:** `pnpm dev` opens a new tab in Chrome that shows the dashboard shell. All lint, format, and type checks pass. One trivial Vitest test runs.

---

## Phase 2 — Core Experience

**Goal:** A functional dashboard with the clock, greeting, verse, theme, and module system.

**Deliverables:**

- **Clock + Greeting module:** Real-time clock (large format), dynamic greeting by time of day, user name from settings
- **Bible Verse module:** Fetch daily verse from API, local caching (24h TTL), display with quote typography, reference, and "New Verse" button. Support at least one translation (ESV)
- **Theme system:** Dark / Light / System toggle. CSS custom properties. Zustand store for theme state. Persist preference to Chrome Storage. (missing to do)
- **Background image:** Full-bleed background with a default bundled image. Slight overlay for readability.
- **Glassmorphism card system:** Shared Card component with translucent blur effect, consistent border-radius and padding.
- **Module registry:** `ModuleDefinition` interface, central registry, dashboard renderer that loops over enabled modules.
- **StorageService:** Abstraction layer wrapping Chrome Storage API. `get`, `set`, `remove`, `clear`.
- **Settings page:** Basic settings shell with appearance (theme toggle) and module enable/disable toggles. Persisted via StorageService.
- **Header bar:** App icon, tagline, settings link, theme toggle

**Exit criteria:** New Tab shows greeting, live clock, a cached daily verse, and a background image. Theme toggle works. Settings page lets you disable the verse card and it disappears from the dashboard.

---

## Phase 3 — Productivity Modules

**Goal:** All remaining dashboard modules are functional.

**Deliverables:**

- **Weather module:** Geolocation permission request, fetch from weather API, 30-min cache, display temperature + condition + high/low. Settings: unit (°F/°C), location.
- **Today's Focus module:** User-entered daily focus with tagline. Persisted in IndexedDB.
- **Prayer Requests module:** List of prayer items, add/remove/mark answered. IndexedDB storage.
- **Today's Gratitude module:** Daily gratitude text entry. One entry per day. IndexedDB.
- **To-Do List module:** Checkbox list, add/remove/toggle complete. IndexedDB.
- **Inspirational Quote module:** Daily quote with attribution. Can use a bundled local set or an API.
- **Quick Actions module:** 2×2 grid — Share Verse, Copy Verse, Favorite, Settings.
- **Footer bar:** Secondary verse, reference, icon buttons.
- **CSS Grid layout:** Full 3-column grid matching the mockup. Each module placed in its correct grid area.
- **IndexedDB setup:** Dexie database schema for todos, prayers, gratitude, favorites.

**Exit criteria:** Dashboard matches the mockup layout. All modules are functional, toggleable, and persist data across sessions. Quick Actions (share, copy, favorite) work.

---

## Phase 4 — Polish

**Goal:** The extension feels like a shipped product, not a side project.

**Deliverables:**

- **Multiple Bible translations:** ESV, NIV, NKJV, KJV, NLT selector in settings
- **Background image providers:** Bundled defaults, solid color, Unsplash daily, Bing daily image (could be added in the settings section).
- **Onboarding flow:** First-run experience — name, preferred translation, enable/disable modules, choose background
- **Animations:** Staggered card fade-in on load, smooth transitions on theme change, checkbox toggle animation. All behind `prefers-reduced-motion`.
- **Keyboard shortcuts:** Quick access to settings, refresh verse, add todo
- **Accessibility audit:** Focus management, ARIA labels, color contrast on both themes, screen reader testing
- **Error boundaries:** Per-module error boundaries with fallback UI
- **Offline indicator:** Subtle badge when network-dependent modules are serving cached data
- **Import / export settings:** JSON export of all settings and data for backup
- **Responsive layout:** 2-column and single-column breakpoints
- **Comprehensive testing:** Unit tests for all services and hooks. Integration tests for storage layer.

**Exit criteria:** The extension could be submitted to the Chrome Web Store. A non-technical user could install it and have a good experience without reading documentation.

---

## Phase 5 — Premium Features (optional, post-launch)

These are stretch goals that could differentiate the product or support monetization.

- **Account sync:** Optional sign-in to sync settings and data across browsers/devices (Supabase)
- **AI verse reflection:** User clicks "Explain this verse" → LLM provides historical context, practical application, cross-references, reflection questions
- **Morning / Evening routines:** Time-aware module sets. Morning: verse + weather + calendar + focus. Evening: reflection + gratitude + prayer + journal.
- **To-Do list rearrangement:** Once the user has more than one Todo on the list they can rearrange the order with a drag and drop.
- **Streaks:** Track daily verse reading, todo completion, prayer consistency, gratitude entries
- **Community themes:** Shareable theme packs (background + color palette)
- **Widget marketplace:** Community-contributed modules

---

## Milestone Summary

| Phase | Focus           | Key Outcome                                    |
| ----- | --------------- | ---------------------------------------------- |
| 1     | Foundation      | Toolchain works, extension loads in Chrome     |
| 2     | Core Experience | Clock, verse, theme, module system, settings   |
| 3     | Productivity    | All modules functional, full grid layout       |
| 4     | Polish          | Animations, accessibility, onboarding, testing |
| 5     | Premium         | AI, sync, streaks, community features          |
