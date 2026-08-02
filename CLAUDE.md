# CLAUDE.md — New Day

> "New Day. God's Plan. Better You."

A faith-centered Chrome extension that replaces the New Tab page with a personal dashboard. Bible content is one module — the real product is a modular, offline-first dashboard platform built with modern React architecture.

---

## Quick Reference

| Item           | Value                                                              |
| -------------- | ------------------------------------------------------------------ |
| Extension type | Chrome Manifest V3, New Tab override                               |
| Framework      | WXT + React 19 + TypeScript                                        |
| Styling        | Tailwind CSS v4 + shadcn/ui                                        |
| State          | Zustand (global), local state per module                           |
| Storage        | Chrome Storage API + IndexedDB (Dexie) behind an abstraction layer |
| Testing        | Vitest                                                             |
| Target quality | Comparable to Momentum, Arc New Tab, Notion Calendar               |

---

## Skills Integration

- Always check the `.claude/skills/` directory for relevant standard operating procedures or custom capabilities before starting a multi-step task.
- Treat files inside `.claude/skills/` as active system instructions whenever user prompts match a skill's description.

## Documentation Index

| File                                           | Contents                                                                                     |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------- |
| [docs/architecture.md](docs/architecture.md)   | System architecture, folder structure, patterns, data flow                                   |
| [docs/tech-stack.md](docs/tech-stack.md)       | Every dependency with rationale                                                              |
| [docs/modules.md](docs/modules.md)             | Module registry spec, per-module requirements, caching rules                                 |
| [docs/design-system.md](docs/design-system.md) | Visual design spec extracted from the mockup — layout grid, colors, typography, card anatomy |
| [docs/roadmap.md](docs/roadmap.md)             | Phased development plan with deliverables per phase                                          |

---

## Core Principles

1. **Feature-first architecture.** Organize by module, not by file type. Everything related to a feature lives together.
2. **Composition over inheritance.** Every dashboard widget is an independent module that registers itself.
3. **Service layer pattern.** UI → Hook → Service → Storage → API. The UI never knows about `fetch`.
4. **Offline-first.** Cache before network. The user never waits for a loading spinner on New Tab.
5. **Dependency inversion.** UI depends on hooks and interfaces, never on concrete API or storage implementations.
6. **Single responsibility.** One module, one service. No god files.
7. **Progressive enhancement.** The dashboard is useful even when network-dependent modules fail.

---

## Commands

```bash
# Development
pnpm dev              # Start WXT dev server with hot reload
pnpm build            # Production build
pnpm zip              # Package for Chrome Web Store

# Quality
pnpm lint             # ESLint
pnpm format           # Prettier
pnpm test             # Vitest
pnpm typecheck        # tsc --noEmit
```

---

## Project Structure (abbreviated)

```
src/
  app/                  # Page-level shells
    dashboard/          # New Tab main view
    settings/           # Extension settings page
    onboarding/         # First-run flow
  modules/              # Each module is self-contained
    bible/
    weather/
    clock/
    todo/
    gratitude/
    prayer/
    focus/
    quotes/
    quick-actions/
  shared/               # Cross-cutting utilities
    ui/                 # shadcn/ui primitives
    hooks/
    lib/
    storage/            # StorageService abstraction
    utils/
    theme/
  background/           # Service worker (notifications, scheduled refresh)
  manifest.ts
```

See [docs/architecture.md](docs/architecture.md) for full detail.

---

## Conventions

- **Naming:** kebab-case for folders and files. PascalCase for components. camelCase for hooks, utils, services.
- **Exports:** Barrel files (`index.ts`) per module. Named exports only — no default exports except for React components used in lazy loading.
- **Types:** Co-locate types with the module that owns them. Shared types go in `shared/types/`.
- **Commits:** Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:`).
- **No cross-module imports.** Modules never import from each other. Shared code goes in `shared/`.
