# Tech Stack

Every dependency earns its place. Nothing is included by default.

---

## Core

| Package        | Role                | Why                                                                                                                  |
| -------------- | ------------------- | -------------------------------------------------------------------------------------------------------------------- |
| **WXT**        | Extension framework | Manifest V3 support, HMR, file-based entrypoints, build tooling. Replaces manual webpack/vite config for extensions. |
| **React 19**   | UI library          | Component model, Suspense for lazy-loaded modules, concurrent features.                                              |
| **TypeScript** | Type safety         | Catches module interface mismatches at compile time. Non-negotiable for a modular architecture.                      |

## Styling

| Package             | Role                 | Why                                                                                                                                                                           |
| ------------------- | -------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Tailwind CSS v4** | Utility-first CSS    | Fast iteration on the glassmorphism card system. No naming debates.                                                                                                           |
| **shadcn/ui**       | Component primitives | Card, Button, Dialog, Dropdown, Popover, Tabs, Tooltip, Switch, Drawer, Command, Separator. Accessible, unstyled, composable. Not a dependency — code is copied in and owned. |

## State & Data

| Package            | Role              | Why                                                                                                              |
| ------------------ | ----------------- | ---------------------------------------------------------------------------------------------------------------- |
| **Zustand**        | Global state      | Tiny, no boilerplate, works perfectly for theme/settings/module-list. No Redux.                                  |
| **TanStack Query** | Async data        | Handles caching, stale-while-revalidate, background refetch, retry logic. Pairs with the offline-first strategy. |
| **Zod**            | Validation        | Validates API responses and storage data at runtime. Catches corrupt or unexpected data before it hits the UI.   |
| **Dexie**          | IndexedDB wrapper | Typed, promise-based IndexedDB for larger datasets (todos, prayer log, journal).                                 |

## UI Enhancement

| Package           | Role      | Why                                                                                      |
| ----------------- | --------- | ---------------------------------------------------------------------------------------- |
| **Framer Motion** | Animation | Smooth card transitions, fade-ins, layout animations. Respects `prefers-reduced-motion`. |
| **Lucide React**  | Icons     | Consistent, tree-shakable icon set. Used in module headers, quick actions, settings.     |

## Quality

| Package      | Role       | Why                                                                   |
| ------------ | ---------- | --------------------------------------------------------------------- |
| **Vitest**   | Testing    | Fast, Vite-native. Unit tests for services, hooks, and storage logic. |
| **ESLint**   | Linting    | Catch bugs and enforce conventions.                                   |
| **Prettier** | Formatting | Consistent code style, zero debates.                                  |

## Browser APIs

| API                       | Role                                  |
| ------------------------- | ------------------------------------- |
| **Chrome Storage API**    | Sync-able settings and preferences    |
| **chrome.alarms**         | Scheduled background refreshes        |
| **chrome.notifications**  | Verse of the day, prayer reminders    |
| **Geolocation API**       | Weather module (with user permission) |
| **chrome.action (badge)** | Unread count or streak indicator      |

---

## What's NOT included and why

| Omitted                         | Reason                                                                            |
| ------------------------------- | --------------------------------------------------------------------------------- |
| Redux / Redux Toolkit           | Overkill. Zustand handles global state with a fraction of the boilerplate.        |
| Axios                           | `fetch` is sufficient. TanStack Query handles retries and caching.                |
| Styled Components / CSS Modules | Tailwind covers everything. No runtime CSS-in-JS overhead.                        |
| Next.js / Remix                 | This is a Chrome extension, not a web app. WXT is the right tool.                 |
| Firebase                        | Not needed in Phase 1–4. If cloud sync is added later, Supabase is a lighter fit. |
