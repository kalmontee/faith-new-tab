# Architecture

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

Organized by feature, not by file type.

```
src/
│
├── app/
│   ├── dashboard/
│   │   ├── Dashboard.tsx            # Main grid shell
│   │   ├── DashboardHeader.tsx      # Greeting + clock
│   │   ├── DashboardFooter.tsx      # Bottom verse bar + nav icons
│   │   └── ModuleRenderer.tsx       # Loops over enabled modules
│   ├── settings/
│   │   ├── SettingsPage.tsx
│   │   ├── sections/               # Appearance, Modules, Verse, Weather, etc.
│   │   └── types.ts
│   └── onboarding/
│       ├── OnboardingFlow.tsx
│       └── steps/
│
├── modules/
│   ├── bible/
│   │   ├── api/
│   │   │   └── verse-api.ts         # Fetch from Bible API
│   │   ├── components/
│   │   │   ├── VerseCard.tsx         # Main card UI
│   │   │   └── VerseReference.tsx
│   │   ├── hooks/
│   │   │   └── use-daily-verse.ts
│   │   ├── services/
│   │   │   └── verse-service.ts     # Cache / fetch / store orchestration
│   │   ├── storage/
│   │   │   └── verse-storage.ts
│   │   ├── types.ts
│   │   └── index.ts                 # Module registration + barrel export
│   │
│   ├── weather/                     # Same internal structure
│   ├── clock/
│   ├── todo/
│   ├── gratitude/
│   ├── prayer/
│   ├── focus/
│   ├── quotes/
│   └── quick-actions/
│
├── shared/
│   ├── ui/                          # shadcn/ui primitives (Card, Button, Dialog, etc.)
│   ├── hooks/
│   │   ├── use-storage.ts
│   │   └── use-media-query.ts
│   ├── lib/
│   │   └── module-registry.ts       # Central registry for all modules
│   ├── storage/
│   │   ├── storage-service.ts       # Abstraction over Chrome Storage + IndexedDB
│   │   ├── chrome-adapter.ts
│   │   └── indexeddb-adapter.ts
│   ├── utils/
│   │   ├── time.ts
│   │   └── greeting.ts
│   ├── theme/
│   │   └── theme-provider.tsx
│   └── types/
│       └── module.ts                # ModuleDefinition, ModuleConfig interfaces
│
├── background/
│   └── index.ts                     # Service worker: notifications, scheduled refresh
│
├── content/                         # Content scripts (if needed later)
│
└── manifest.ts
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

```
Open New Tab
  │
  ▼
Load settings from StorageService          ← instant (cached)
  │
  ▼
Determine enabled modules from registry
  │
  ▼
Render skeleton for each enabled module    ← user sees layout immediately
  │
  ▼
Each module hook loads cached data         ← content appears instantly
  │
  ▼
Check if cached data is expired
  │
  ├── Not expired → done
  └── Expired → fetch from API in background → update cache → re-render
```

The user never stares at a blank tab.

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
StorageService (abstraction)
  │
  ├── Chrome Storage API (settings, small data)
  ├── IndexedDB via Dexie (larger data: todos, prayer list, journal)
  └── In-memory cache (hot data for current session)
```

The UI never calls `fetch` directly. The UI never calls `chrome.storage` directly.

---

## Storage Layer

A single `StorageService` wraps all persistence. Modules call:

```ts
storage.get<T>(key: string): Promise<T | null>
storage.set<T>(key: string, value: T): Promise<void>
storage.remove(key: string): Promise<void>
storage.clear(): Promise<void>
```

Internally it routes:

- **Settings and preferences** → Chrome Storage (syncs across devices if user is signed in)
- **Content data** (todos, prayer requests, gratitude entries) → IndexedDB via Dexie
- **Hot reads** → In-memory cache with TTL

This abstraction means the app is not locked to Chrome. Porting to Firefox or a web app later requires swapping one adapter.

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

The Manifest V3 service worker handles:

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
