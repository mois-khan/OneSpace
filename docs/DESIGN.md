# OneSpace — Design System
**Based on cscoworkingspaces.com exact visual identity**

---

## Brand Colors (extracted from screenshots)

```css
/* Primary */
--cs-red:         #E8192C   /* CTA buttons, active nav, logo mark, badges */
--cs-red-dark:    #C0141F   /* hover state for red buttons */
--cs-red-bg:      #FFF1F2   /* light red bg for icon cards (Why Choose section) */

/* Neutrals */
--cs-black:       #1A1A1A   /* body text, headings on white */
--cs-dark:        #111827   /* footer bg, deep sections */
--cs-white:       #FFFFFF   /* page background, cards */
--cs-gray-50:     #F8F9FA   /* page-level bg tint */
--cs-gray-100:    #F1F3F5   /* input bg, table zebra */
--cs-gray-300:    #D1D5DB   /* borders, dividers */
--cs-gray-500:    #6B7280   /* secondary text, labels */
--cs-gray-700:    #374151   /* muted headings */

/* Hero gradient (exact from site) */
--cs-hero-from:   #0D1B2A   /* dark navy left edge */
--cs-hero-to:     #8B0000   /* deep crimson red right edge */

/* Status colors (for the app layer) */
--status-green:   #16A34A   /* available, paid, healthy */
--status-amber:   #D97706   /* reserved, medium risk, warning */
--status-red:     #DC2626   /* occupied, overdue, high risk */
--status-blue:    #2563EB   /* info, bookings */
--status-gray:    #9CA3AF   /* maintenance, inactive */
```

---

## Typography

```css
/* CS Coworking uses clean, modern sans-serif */
font-family-display: 'Plus Jakarta Sans', sans-serif;   /* headings, nav, KPIs */
font-family-body:    'Inter', sans-serif;               /* body, tables, forms */

/* Scale */
--text-xs:    11px / 1.4
--text-sm:    13px / 1.5
--text-base:  15px / 1.6
--text-lg:    17px / 1.6
--text-xl:    20px / 1.4
--text-2xl:   24px / 1.3
--text-3xl:   30px / 1.2
--text-4xl:   36px / 1.1
--text-hero:  48px / 1.1   (homepage hero only)

/* Weights */
400 — body, descriptions
500 — nav items, labels, card subtitles  
600 — section headings, stat labels
700 — hero headings, KPI numbers, CTA buttons
```

---

## Logo Replication

```
The CS logo:
- "CS" in bold red, stacked character pairs (C on top-left, S on bottom-right)
  forming an interlocking square shape
- "COWORKING" in black, medium weight
- "SPACES" in black, medium weight
- "AFFORDABLE & RELIABLE" in red, tiny, below wordmark

For OneSpace app: use "CS" red monogram + "OneSpace" in black beside it
Favicon: red "CS" square on white
```

---

## App Layout

OneSpace is a **light-mode dashboard** (white base, not dark) matching CS Coworking's
own aesthetic. Red accent, dark navy for sidebar only.

```
Sidebar: dark navy (#0D1B2A) with red active states — ONLY dark element
App body: white (#FFFFFF) / gray-50 (#F8F9FA) backgrounds
Cards: white, 1px #D1D5DB border, 6px radius, subtle shadow
```

---

## Component Specs

### Sidebar
```
width: 240px (expanded), 64px (icon-only collapsed)
background: #0D1B2A
border-right: none (shadow instead: 2px 0 8px rgba(0,0,0,0.15))

Logo area (top, 64px height):
  CS red mark (24px) + "OneSpace" text (white, 16px, 600 weight)
  border-bottom: 1px solid rgba(255,255,255,0.08)

Branch switcher:
  background: rgba(255,255,255,0.06)
  border: 1px solid rgba(255,255,255,0.12)
  border-radius: 8px
  color: white
  Dropdown arrow: white
  Active branch: red dot indicator

Nav items:
  padding: 10px 16px
  border-radius: 8px
  color: rgba(255,255,255,0.65)   (inactive)
  color: #FFFFFF                   (active)
  background: #E8192C              (active item bg)
  icon-size: 18px
  font-size: 14px, weight 500
  gap between icon and label: 10px

Hover (inactive): background: rgba(255,255,255,0.06)
```

### Top Bar
```
height: 56px
background: #FFFFFF
border-bottom: 1px solid #E5E7EB
padding: 0 24px

Left: Page title — 18px, weight 600, #1A1A1A
Right (gap 16px): Search | Bell | Date | Avatar
```

### Primary Button (CTA)
```
background: #E8192C
color: #FFFFFF
font-size: 14px, weight 700
padding: 10px 20px
border-radius: 8px
border: none
hover: background #C0141F, transform translateY(-1px)
active: transform translateY(0)
```

### Secondary Button
```
background: transparent
color: #E8192C
border: 1.5px solid #E8192C
font-size: 14px, weight 600
padding: 9px 20px
border-radius: 8px
hover: background #FFF1F2
```

### Ghost Button
```
background: transparent
color: #374151
border: 1px solid #D1D5DB
padding: 9px 16px
border-radius: 8px
hover: background #F3F4F6
```

### Card
```
background: #FFFFFF
border: 1px solid #E5E7EB
border-radius: 10px
padding: 20px 24px
box-shadow: 0 1px 4px rgba(0,0,0,0.06)
```

### KPI / Stat Card
```
Same as Card but:
  border-top: 3px solid #E8192C   (top red accent bar)
  
  label: 12px, weight 500, #6B7280, uppercase, letter-spacing 0.5px
  value: 28px, weight 700, #1A1A1A, Plus Jakarta Sans
  trend: 13px — green (#16A34A) for up, red (#DC2626) for down
```

### Table
```
background: #FFFFFF
border: 1px solid #E5E7EB
border-radius: 10px
overflow: hidden

thead:
  background: #F8F9FA
  th: 12px, weight 600, #6B7280, uppercase, letter-spacing 0.4px
  padding: 12px 16px

tbody tr:
  border-top: 1px solid #F3F4F6
  padding: 14px 16px
  hover: background #FFF5F5

td: 14px, #374151
```

### Badge / Pill
```
font-size: 12px, weight 600
padding: 3px 10px
border-radius: 20px

Variants:
  success: bg #DCFCE7, text #15803D
  warning: bg #FEF3C7, text #B45309
  danger:  bg #FEE2E2, text #B91C1C
  info:    bg #DBEAFE, text #1D4ED8
  gray:    bg #F3F4F6, text #374151
  red:     bg #E8192C, text #FFFFFF    (for "LIVE", "WORKSPACE" etc)
```

### Input / Form Field
```
height: 40px
background: #FFFFFF
border: 1px solid #D1D5DB
border-radius: 8px
padding: 0 12px
font-size: 14px, #1A1A1A
placeholder: #9CA3AF

focus:
  border-color: #E8192C
  box-shadow: 0 0 0 3px rgba(232,25,44,0.12)
  outline: none
```

### Progress / Occupancy Bar
```
height: 6px
background: #F3F4F6
border-radius: 3px
fill: #E8192C (red — matches brand)

For multi-state: green fill for available count overlay
```

### Seat Circle (Floor Map)
```
r: 14px (hot desk), 12px (dedicated desk)
stroke-width: 2px

States:
  available:  fill #DCFCE7, stroke #16A34A
  occupied:   fill #FEE2E2, stroke #DC2626
  reserved:   fill #FEF3C7, stroke #D97706
  selected:   fill #E8192C, stroke #C0141F, white text
  maintenance: fill #F3F4F6, stroke #9CA3AF
```

### Risk Score Gauge
```
SVG arc, 80px diameter
0–40  : stroke #16A34A (green)
41–70 : stroke #D97706 (amber)
71–100: stroke #DC2626 (red)
Center text: score number, 18px bold
```

---

## Spacing Scale
```
4px, 8px, 12px, 16px, 20px, 24px, 32px, 40px, 48px, 64px, 80px, 96px
```

## Border Radius Scale
```
4px  — tags, small badges
6px  — inputs, small buttons
8px  — buttons, nav items, form fields
10px — cards, panels
16px — modal, large cards
24px — hero sections
```

## Shadows
```
--shadow-sm:   0 1px 3px rgba(0,0,0,0.08)
--shadow-md:   0 4px 12px rgba(0,0,0,0.10)
--shadow-lg:   0 8px 24px rgba(0,0,0,0.12)
--shadow-red:  0 4px 14px rgba(232,25,44,0.25)   (for red CTAs on hover)
```

---

## Iconography
Library: **Lucide React** (outline style, same aesthetic as CS Coworking icons)
Sizes: 16px inline, 18px nav, 20px section headers, 24px hero/empty states
Color: inherits from parent or explicit #6B7280 (muted), #E8192C (active/accent)

---

## Motion
```
All transitions: ease-out, never ease-in-out (feels snappier)

Page transition:   opacity 0→1, 150ms
Card hover:        translateY -2px, shadow enhance, 120ms
Button hover:      translateY -1px, 100ms  
Button active:     translateY 0, 80ms
Sidebar collapse:  width 240→64px, 200ms
Modal open:        scale 0.97→1 + opacity, 160ms
Panel slide:       translateX, 200ms
Count-up (KPIs):   800ms, easeOut (on mount)
Seat color change: background transition, 400ms
```

---

## Hero Gradient Pattern
Applied to: Login page, section headers inside pages
```css
background: linear-gradient(135deg, #0D1B2A 0%, #1a0a0a 50%, #8B0000 100%);
```
Text on hero: white, headings bold

---

## Exact Pricing (from screenshots — use in seed data)
```
Day Pass:
  Single Day:        ₹599/day
  10-Day Flex:       ₹3,999 /15 days validity
  20-Day Pass:       ₹6,999 /30 days validity
  Unlimited Monthly: ₹7,499 /flexible timings

Flexi Desk (Hot Desk):
  Starter Flexi:    ₹5,999/seat/month + 5hrs meeting
  Standard Flexi:   ₹6,999/seat/month + 10hrs meeting
  Founder Flexi:    ₹7,999/seat/month + 30hrs meeting

Dedicated Desk: ~₹12,000–15,000/month (inferred)
Private Cabin:  ~₹18,000–25,000/month (inferred)
```

## Locations (6 total — from screenshots)
```
1. Hitech City     (Popular)
2. Gachibowli      (New)
3. Raidurg         (Premium)
4. Kondapur
5. Shaikpet-I  (Aparna)
6. Shaikpet-II (Sattva)
```
