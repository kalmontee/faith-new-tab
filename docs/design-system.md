# Design System

Visual specification derived from the project mockup. This is the source of truth for how the dashboard looks and feels.

---

## Design Philosophy

The dashboard should feel like opening a window at dawn — warm, calm, and grounding. It is not a productivity tool that happens to have Bible verses. It is a faith-centered space that happens to be productive. Every visual decision serves that calm.

The aesthetic sits between Momentum (ambient, photo-forward) and Arc's New Tab (structured, utility-rich). Cards float over a full-bleed background image with glassmorphism — translucent, blurred, with soft borders.

---

## Background

- Full-viewport background image, edge to edge, no margins
- Default theme: mountain/valley sunrise landscape, warm golden light
- Image should be high resolution (at minimum 1920×1080)
- Slight darkening overlay to ensure card readability (approximately `rgba(0, 0, 0, 0.15)` over the image)
- Background options: Mountains, Ocean, Minimal, Solid Color, Daily Bing Image, Unsplash

---

## Card System (Glassmorphism)

Every module renders inside a card. Cards share these properties:

```css
background: rgba(15, 20, 25, 0.55); /* dark translucent fill */
backdrop-filter: blur(20px);
-webkit-backdrop-filter: blur(20px);
border: 1px solid rgba(255, 255, 255, 0.08);
border-radius: 16px;
padding: 20px 24px;
color: #ffffff;
```

- No solid backgrounds. Every card is see-through.
- Subtle white inner border for depth against the background.
- Consistent border-radius across all cards (16px).
- Cards do not have drop shadows — the blur effect provides depth.

---

## Layout Grid

The dashboard uses CSS Grid, not Flexbox, for the card layout.

```
┌──────────────────────────────────────────────────┐
│              [Greeting + Clock]                  │  ← full width, centered
│                                                  │
│  [Focus]        [Bible Verse]        [Weather]   │  ← 3-column row
│                   (large)                        │
│  [Prayer]                          [Gratitude]   │  ← verse card spans 2 rows
│                                                  │
│  [Todo]         [Quote]          [Quick Actions]  │  ← 3-column row
│                                                  │
│  [Footer Bar ─────────────────────────────────]  │  ← full width
└──────────────────────────────────────────────────┘
```

Grid definition (approximate):

```css
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr 1.4fr 1fr;
  grid-template-rows: auto auto auto auto auto;
  gap: 16px;
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px 32px;
}
```

The Bible Verse card is the visual centerpiece — it occupies the center column and spans two rows vertically.

---

## Typography

### Hierarchy

| Element                | Style                                                                                                        |
| ---------------------- | ------------------------------------------------------------------------------------------------------------ |
| Time display           | ~80px, light weight (300), white, slight letter-spacing. The "AM/PM" suffix is smaller (~24px), same weight. |
| Greeting               | ~20px, regular weight, white with warm tone                                                                  |
| Date                   | ~14px, regular weight, muted white (opacity ~0.7)                                                            |
| Verse text             | ~22px, serif or elegant sans-serif, white, inside large curly quotes                                         |
| Verse reference        | ~14px, medium weight, gold/amber accent color                                                                |
| Card section headers   | ~11px, uppercase, letter-spacing 1.5px, muted (opacity 0.6). Preceded by a small colored icon/emoji.         |
| Card body text         | ~14px, regular weight, white (opacity 0.9)                                                                   |
| Interactive text links | ~13px, medium weight, accent color (warm gold or teal-green)                                                 |
| Footer verse           | ~13px, regular weight, muted white                                                                           |

### Font Recommendations

- **Display (time, greeting):** Inter, or a clean geometric sans (light weight for the clock)
- **Verse text:** A slightly more refined face — consider Lora, Merriweather, or Source Serif for the verse quote to differentiate it from UI text
- **UI text:** Inter or system font stack
- **Monospace (dates, labels):** JetBrains Mono or system monospace (for timestamps, references)

---

## Color Palette

### Primary Colors

| Name         | Hex                        | Usage                                           |
| ------------ | -------------------------- | ----------------------------------------------- |
| Card Fill    | `rgba(15, 20, 25, 0.55)`   | Card backgrounds                                |
| White        | `#FFFFFF`                  | Primary text                                    |
| Muted White  | `rgba(255, 255, 255, 0.6)` | Section headers, secondary text                 |
| Gold Accent  | `#D4A547`                  | Verse references, interactive links, highlights |
| Green Accent | `#6BBF7B`                  | "Add a Request", positive actions, checkmarks   |
| Warm Amber   | `#E8B84B`                  | Sun icon, weather accent                        |

### Section Header Icons (color-coded)

| Module            | Icon Color     |
| ----------------- | -------------- |
| Today's Focus     | Yellow/gold ✨ |
| Prayer Requests   | Red 🙏         |
| Today's Gratitude | Pink/red ❤️    |
| To-Do List        | Green ✅       |
| Quick Actions     | Yellow ⚡      |

### Card Border

```css
border: 1px solid rgba(255, 255, 255, 0.08);
```

On hover or focus, subtly increase to `rgba(255, 255, 255, 0.15)`.

---

## Component Details

### Header Bar (top)

- Left: small app icon (seed/sprout) + tagline "New Day. God's Plan. Better You." in muted white
- Right: settings gear icon, theme toggle (sun/moon), bookmark icon
- No background — floats over the main background

### Bible Verse Card (center)

- Large opening curly quote mark `"` in gold/amber, decorative
- Verse text in serif, centered, white
- Horizontal divider line below the verse (thin, muted)
- Reference text below divider in gold accent (e.g. "Philippians 4:13")
- "New Verse" button with refresh icon, centered below reference
- This card is the largest and most visually prominent

### Weather Card (top right)

- Location pin icon + city name at top
- Large temperature number (~48px bold)
- Degree symbol as superscript
- Sun/cloud icon to the right of the temperature, warm amber
- Condition label below ("Sunny")
- High/Low range below that, smaller text

### Todo Card (bottom left)

- Section header with green checkmark icon
- "+" button aligned right in the header for adding items
- Each item: unchecked checkbox + label, or checked with strikethrough/filled check
- Clean vertical list, no card nesting

### Quick Actions Card (bottom right)

- 2×2 grid of buttons
- Each button: icon + short label, inside a subtle inner card/tile
- Share Verse, Copy Verse, Favorite, Settings
- Tiles have a slightly lighter background than the parent card

### Footer Bar (bottom)

- Full width, no card background (transparent)
- Left side: book icon + verse text + reference in gold
- Right side: row of small icon buttons (calendar, music, plant)
- Thin top border separating from dashboard content

---

## Interaction States

- **Hover on cards:** Slight border brightness increase, gentle scale (1.005)
- **Hover on buttons/links:** Color shift to brighter accent, cursor pointer
- **Active/pressed:** Subtle scale down (0.98)
- **Focus (keyboard):** Visible focus ring, 2px offset, accent color
- **Checkbox toggle:** Smooth fill animation with green checkmark

---

## Motion

- Cards fade in with a staggered delay on load (100ms offset per card)
- Use Framer Motion `layoutId` for settings → dashboard transitions if applicable
- Respect `prefers-reduced-motion`: disable all animations, show content immediately
- No parallax, no scroll-jacking, no bouncing elements

---

## Responsive Behavior

The extension primarily targets the New Tab page at desktop widths, but should degrade gracefully:

| Breakpoint | Layout                                         |
| ---------- | ---------------------------------------------- |
| ≥1024px    | Full 3-column grid as designed                 |
| 768–1023px | 2-column grid, verse card stacks above weather |
| <768px     | Single column, vertical stack                  |

---

## Dark / Light / System Theme

- **Dark (default):** As designed — dark translucent cards over a warm background image
- **Light:** Cards shift to `rgba(255, 255, 255, 0.65)`, text becomes dark (`#1A1A1A`), background image brightness increases
- **System:** Follows `prefers-color-scheme`

Theme is controlled via CSS custom properties on `:root`, toggled by Zustand store.
