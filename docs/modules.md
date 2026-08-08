# Modules

Every feature on the dashboard is a module. Modules are self-contained, independently toggleable, and register themselves through a central registry.

---

## Module Registry Interface

```ts
interface ModuleDefinition {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  enabled: boolean; // default enabled state
  component: React.LazyExoticComponent<React.FC>;
  refreshInterval?: RefreshInterval;
  gridArea?: string; // CSS Grid area name
  requiresNetwork?: boolean;
  settingsComponent?: React.LazyExoticComponent<React.FC>; // per-module settings panel
}

type RefreshInterval = 'daily' | 'hourly' | '30min' | 'never';
```

---

## Module Inventory

### Clock + Greeting

| Field     | Value                                                                                                                                                     |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ID        | `clock`                                                                                                                                                   |
| Grid area | Top center, spanning full width                                                                                                                           |
| Refresh   | Real-time (local interval)                                                                                                                                |
| Network   | No                                                                                                                                                        |
| Storage   | User's name (settings)                                                                                                                                    |
| Behavior  | Displays current time (large format: `8:30 AM`), date (`Tuesday, July 29, 2025`), and a greeting that changes by time of day ("Good Morning, Kelvin 👋"). |

### Bible Verse

| Field     | Value                                                                                                                                                                             |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ID        | `verse`                                                                                                                                                                           |
| Grid area | Center, large card                                                                                                                                                                |
| Refresh   | Daily                                                                                                                                                                             |
| Network   | Yes (API fetch), cached offline                                                                                                                                                   |
| Storage   | Cached verse (24h TTL)                                                                                                                                                            |
| Behavior  | Shows OurManna's Verse of the Day with large quote typography, the reference below (e.g. "Philippians 4:13"), and a "New Verse" refresh button (random verse). Verses are NIV.    |
| Settings  | None (OurManna serves NIV only)                                                                                                                                                   |

### Weather

| Field       | Value                                                                                                                           |
| ----------- | ------------------------------------------------------------------------------------------------------------------------------- |
| ID          | `weather`                                                                                                                       |
| Grid area   | Top right card                                                                                                                  |
| Refresh     | Every 30 minutes                                                                                                                |
| Network     | Yes (weather API)                                                                                                               |
| Storage     | Cached reading, location, unit preference                                                                                       |
| Behavior    | Location pin + city name, large temperature number, condition icon (sun/cloud/rain), condition label ("Sunny"), high/low range. |
| Settings    | Use current location toggle, temperature unit (°F / °C), refresh frequency                                                      |
| Permissions | Geolocation API (requested on first use)                                                                                        |

### Today's Focus

| Field     | Value                                                                                                                                                         |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ID        | `focus`                                                                                                                                                       |
| Grid area | Top left card                                                                                                                                                 |
| Refresh   | Never (user-entered)                                                                                                                                          |
| Network   | No                                                                                                                                                            |
| Storage   | Focus text, motivational tagline                                                                                                                              |
| Behavior  | A short user-entered focus for the day with an optional tagline beneath. Includes an inspirational one-liner at the bottom (e.g. "Trust. Pray. Keep Going."). |

### Prayer Requests

| Field     | Value                                                                                                              |
| --------- | ------------------------------------------------------------------------------------------------------------------ |
| ID        | `prayer`                                                                                                           |
| Grid area | Middle left card                                                                                                   |
| Refresh   | Never (user-entered)                                                                                               |
| Network   | No                                                                                                                 |
| Storage   | IndexedDB via Dexie — list of prayer items with timestamps                                                         |
| Behavior  | Bulleted list of prayer items. "+ Add a Request" button at the bottom. Items can be marked as answered or removed. |

### Today's Gratitude

| Field     | Value                                                                              |
| --------- | ---------------------------------------------------------------------------------- |
| ID        | `gratitude`                                                                        |
| Grid area | Middle right card                                                                  |
| Refresh   | Never (user-entered)                                                               |
| Network   | No                                                                                 |
| Storage   | IndexedDB — daily gratitude entries                                                |
| Behavior  | A text area for today's gratitude entry. "Edit" link to modify. One entry per day. |

### To-Do List

| Field     | Value                                                                                                    |
| --------- | -------------------------------------------------------------------------------------------------------- |
| ID        | `todo`                                                                                                   |
| Grid area | Bottom left card                                                                                         |
| Refresh   | Never (user-entered)                                                                                     |
| Network   | No                                                                                                       |
| Storage   | IndexedDB — todo items with completion state                                                             |
| Behavior  | Checkbox list. "+" button to add items. Completed items show a checkmark. Items persist across sessions. |

### Inspirational Quote

| Field     | Value                                                                                                    |
| --------- | -------------------------------------------------------------------------------------------------------- |
| ID        | `quotes`                                                                                                 |
| Grid area | Bottom center card                                                                                       |
| Refresh   | Daily                                                                                                    |
| Network   | Optional (can use local set)                                                                             |
| Storage   | Cached quote                                                                                             |
| Behavior  | Displays a faith-based or inspirational quote with attribution. Shown over a secondary background image. |

### Quick Actions

| Field     | Value                                                                                                                                                                 |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| ID        | `quick-actions`                                                                                                                                                       |
| Grid area | Bottom right card                                                                                                                                                     |
| Refresh   | N/A                                                                                                                                                                   |
| Network   | No                                                                                                                                                                    |
| Behavior  | 2×2 grid of icon buttons: Share Verse, Copy Verse, Favorite, Settings. Each triggers a specific action (clipboard, share API, navigate to settings, toggle favorite). |

---

## Footer Bar

Not a registered module — it's part of the dashboard shell.

- Left: book icon + secondary verse quote + reference
- Right: icon buttons (calendar, music, plant/growth)

---

## Caching Rules Summary

| Module           | Interval      | Source       |
| ---------------- | ------------- | ------------ |
| Bible Verse      | 24 hours      | API          |
| Weather          | 30 minutes    | API          |
| Quote            | 24 hours      | API or local |
| Background Image | 24 hours      | API or local |
| Clock            | Real-time     | Local        |
| Focus            | Never expires | User input   |
| Todo             | Never expires | User input   |
| Prayer           | Never expires | User input   |
| Gratitude        | Never expires | User input   |

---

## Adding a New Module

1. Create `src/modules/<name>/` with the standard internal structure (api, components, hooks, services, storage, types, index).
2. In `index.ts`, export a `ModuleDefinition` object.
3. Import and register it in `src/shared/lib/module-registry.ts`.
4. The dashboard renderer picks it up automatically.
5. Add a toggle in the settings page under "Dashboard → Modules."

Zero changes to the dashboard shell, routing, or other modules.
