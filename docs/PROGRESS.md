# OneSpace — Build Progress
**Deadline: Tomorrow 11:59 PM IST | Hackathon: GradSkills Summership 2026**

---

## Timeline Overview
```
Phase 1 — Foundation     (2–3h)   Scaffold, theme, layout shell
Phase 2 — Dashboard      (1.5h)   KPIs, branch table, charts
Phase 3 — Floor Map      (3h)     SVG map, interactions, panels  ← MOST TIME
Phase 4 — Members        (2h)     List, profile, AI email
Phase 5 — Visitors       (1.5h)   Check-in, table, QR
Phase 6 — Renewals       (1h)     Risk table, bulk actions
Phase 7 — Leads          (1.5h)   Kanban board, drag-drop
Phase 8 — Bookings       (1h)     Calendar, quick book
Phase 9 — Polish + Demo  (2h)     Animations, empty states, script
                         ─────
Total:                   ~17h     Achievable before deadline
```

---

## Phase 1 — Foundation
**Goal:** App runs, sidebar shows, routing works, design tokens set.

- [x] `npx create-next-app@latest onespace --typescript --tailwind --app`
- [x] Install dependencies:
  ```bash
  npm install @anthropic-ai/sdk lucide-react recharts 
  npm install framer-motion sonner react-zoom-pan-pinch
  npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities
  npm install qrcode.react
  npx shadcn@latest init
  npx shadcn@latest add button card badge input select dialog
  ```
- [ ] `app/globals.css` — CSS variables (all tokens from DESIGN.md)
- [ ] `app/layout.tsx` — root layout, Google Fonts (Plus Jakarta Sans + Inter)
- [ ] `components/layout/Sidebar.tsx` — dark navy, CS logo, nav items
- [ ] `components/layout/TopBar.tsx` — white bar, page title, search icon
- [ ] `components/layout/AppShell.tsx` — composes sidebar + topbar + children
- [ ] `middleware.ts` — redirect / → /dashboard, /login guard
- [ ] `lib/data/seed.ts` — ALL seed data (members, leads, visitors, branches, seats)
- [ ] `types/index.ts` — TypeScript interfaces
- [ ] `lib/utils.ts` — cn(), formatCurrency(), formatDate(), getRiskColor()
- [ ] `lib/risk-score.ts` — risk scoring function
- [ ] Deploy to Vercel (do this early, avoid last-minute scramble)

**Done when:** Sidebar renders, nav items click between routes (404 is fine), dark sidebar with red active state visible.

---

## Phase 2 — Dashboard
**Goal:** Full dashboard with live-feeling data.

- [ ] `app/dashboard/page.tsx`
- [ ] `components/dashboard/StatCard.tsx`
  - Props: label, value, sub, trend, icon, cta
  - Red top border accent
  - Count-up animation on mount (framer-motion)
- [ ] `components/dashboard/BranchTable.tsx`
  - 6 branches, mini progress bars, health badges
  - Row click → navigate to floor map with branch pre-selected
- [ ] `components/dashboard/AlertFeed.tsx`
  - 6 pre-seeded alerts, colored left borders
  - LIVE badge with pulse animation
- [ ] `components/dashboard/OccupancyChart.tsx`
  - Recharts LineChart, 6 branch lines, 30 days of fake data
- [ ] `components/dashboard/RevenueChart.tsx`
  - Recharts horizontal BarChart, red bars

**Done when:** Dashboard loads with all 4 sections, charts render, KPI numbers visible.

---

## Phase 3 — Floor Map ⭐ CRITICAL PATH
**Goal:** The demo centrepiece. Visual, interactive, memorable.

- [ ] `public/floor-bg-gachibowli.svg` — hand-draw floor outline:
  - Walls, doors, room labels, zones
  - Keep it clean: thick lines for walls, thin for internal dividers
- [ ] `components/floor-map/FloorControls.tsx`
  - Branch pill selector (6 branches)
  - Floor tab selector
  - Heatmap toggle switch
  - LIVE badge
- [ ] `components/floor-map/FloorMap.tsx`
  - `<TransformWrapper>` wrapping the SVG
  - Renders `<SeatCircle>` for each seat
  - Handles seat click → setSelectedSeat
  - Heatmap mode: swaps color calculation
- [ ] `components/floor-map/SeatCircle.tsx`
  - SVG `<circle>` or `<rect>` with status colors
  - Hover tooltip (portal, positioned)
  - CSS transition on fill (400ms)
- [ ] `components/floor-map/SeatDetailPanel.tsx`
  - Framer-motion slide-in from right
  - Available seat view: booking form
  - Occupied seat view: member card
  - Meeting room view: today's schedule
- [ ] `components/floor-map/RoomPanel.tsx`
  - Timeline of today's bookings (color blocks)
  - Quick book slot
- [ ] `app/floor-map/page.tsx` — assembles controls + map + panel
- [ ] `app/api/seats/route.ts` — POST to update seat status
- [ ] Heatmap data generation (last 30 days mock usage per seat)
- [ ] Supabase realtime subscription (optional, add if time allows)

**Done when:** Can click a seat, panel slides in, can "book" it, seat turns red with animation. Branch switching changes the map.

---

## Phase 4 — Members + AI Email
**Goal:** Member list with risk scores and the AI email wow moment.

- [ ] `app/members/page.tsx` — filter bar + grid/table toggle
- [ ] `components/members/MemberCard.tsx`
  - Avatar, risk badge, plan tags, metrics
  - Hover: red top border glow
- [ ] `components/members/MemberTable.tsx`
  - Sortable columns, pagination
  - ··· action menu
- [ ] `components/members/RiskGauge.tsx`
  - SVG arc, animates 0→score on mount
  - Color changes green/amber/red
- [ ] `components/members/RiskBar.tsx`
  - Thin inline progress bar for cards
- [ ] `components/members/OnboardingWizard.tsx`
  - 4-step modal
  - Step 2: mini floor map for seat selection
  - Step 4: invoice preview + WhatsApp link stub
- [ ] `app/members/[id]/page.tsx`
  - Left sticky card + right tabs layout
  - Risk gauge + factors list
  - All 5 tabs: Overview, Bookings, Invoices, Tickets, Notes
- [ ] `components/members/AIEmailModal.tsx`
  - Loading state animation
  - Editable subject + body
  - WhatsApp link generation
- [ ] `app/api/ai/retention-email/route.ts` — Claude API call
- [ ] `lib/claude.ts` — Anthropic SDK client

**Done when:** Can view member profile, risk gauge animates, click [Draft AI Email], loading → email appears, can copy/send.

---

## Phase 5 — Visitors
**Goal:** Working check-in flow with QR generation.

- [ ] `app/visitors/page.tsx`
- [ ] `components/visitors/VisitorTable.tsx`
  - Live duration counter for "Inside" visitors
  - Status pills, check-out action
- [ ] `components/visitors/CheckInForm.tsx`
  - Form with purpose dropdown
  - Submit → QR code appears
  - Row slides into table
- [ ] `components/visitors/QRDisplay.tsx`
  - qrcode.react component
  - WhatsApp share link below QR
- [ ] 4 stat cards (today's count, inside, left, overstaying)

**Done when:** Can fill form, submit, QR appears, row appears in table.

---

## Phase 6 — Renewals
**Goal:** Risk table, bulk actions, quick renewal.

- [ ] `app/renewals/page.tsx`
- [ ] 3 KPI cards (high risk, medium, expiring soon)
- [ ] Filter tabs (All/High/7d/30d/90d)
- [ ] Risk table with all columns
- [ ] [Renew] button → modal (mark as renewed, updates status)
- [ ] [Email] button → opens AI email modal (reuse from Phase 4)
- [ ] Bulk select + send reminder button

**Done when:** Table loads, can click [Renew] and see status change.

---

## Phase 7 — Leads Kanban
**Goal:** Visual pipeline with drag-and-drop and convert-to-member.

- [ ] `app/leads/page.tsx`
- [ ] `components/leads/KanbanBoard.tsx`
  - @dnd-kit setup
  - Column-to-column drag
  - Optimistic state update on drop
- [ ] `components/leads/KanbanColumn.tsx`
  - Column header: name + count + total value
  - Won column: red/special styling
- [ ] `components/leads/LeadCard.tsx`
  - Draggable handle
  - ··· context menu (hover)
  - [Convert to Member] button in Won column
- [ ] Add lead inline form (slide-down on button click)
- [ ] Lead stats bar (counts per stage)

**Done when:** Can drag a card from Negotiating → Won, [Convert to Member] button appears.

---

## Phase 8 — Bookings Calendar
**Goal:** Room booking with day-view and conflict detection.

- [ ] `app/bookings/page.tsx`
- [ ] `components/bookings/DayCalendar.tsx`
  - Time grid 7AM–10PM
  - Booking blocks (colored, named)
  - "Now" red line indicator
  - Click empty slot → fill quick book panel
- [ ] `components/bookings/QuickBookPanel.tsx`
  - Form: date, time, member, purpose
  - Conflict detection against existing bookings
  - Submit → block appears in calendar
- [ ] Room selector tabs (4 rooms)
- [ ] Date nav arrows

**Done when:** Calendar shows bookings, can click empty slot and fill form, submit creates block.

---

## Phase 9 — Polish & Demo Prep
**Goal:** Make it feel like shipped software.

### UI Polish
- [ ] Empty states on all pages (SVG illustration + CTA)
- [ ] Loading skeletons on all data-dependent sections
- [ ] Sonner toasts: wire up all user actions
- [ ] Command palette (cmd+K): basic search across members + routes
- [ ] Mobile responsiveness check (sidebar collapses to icons on <768px)
- [ ] Favicon: red CS mark
- [ ] Page `<title>` tags: "Dashboard | OneSpace", etc.
- [ ] 404 page with CS branding + [Go to Dashboard]

### Animations
- [ ] Framer Motion page transitions (opacity fade)
- [ ] Count-up on all KPI numbers
- [ ] Risk gauge: animate 0→score on mount
- [ ] Card hover states (translateY + shadow)
- [ ] Floor map: seat color transitions
- [ ] Alert feed: slide-in on new items

### Demo Prep
- [ ] Seed data review: all names are Indian, all prices in ₹
- [ ] Pre-fill login form (owner credentials)
- [ ] Ravi Kumar profile: risk score 88, correct factors showing
- [ ] Gachibowli floor map: 26/34 seats occupied, 2 reserved
- [ ] Record backup Loom video (just in case)
- [ ] Test on Chrome (primary) + Safari (backup)
- [ ] Test at 1920×1080 (projector resolution)
- [ ] Vercel deployment working with ANTHROPIC_API_KEY env var
- [ ] GitHub repo: public, clean README with demo link

### README.md
- [ ] Project name + tagline
- [ ] Demo URL (Vercel link)
- [ ] Screenshots of key pages
- [ ] Tech stack
- [ ] Run locally instructions (npm install + env vars + npm run dev)
- [ ] Team names

---

## Submission Checklist
- [ ] Vercel URL live and accessible
- [ ] GitHub repo public
- [ ] All 9 pages load without errors
- [ ] AI email feature works (ANTHROPIC_API_KEY set in Vercel)
- [ ] Floor map demo: seat booking works
- [ ] Login role-switching works
- [ ] README complete

---

## Current Status
```
Phase 1 — Foundation    [ ] Not started
Phase 2 — Dashboard     [ ] Not started
Phase 3 — Floor Map     [ ] Not started
Phase 4 — Members + AI  [ ] Not started
Phase 5 — Visitors      [ ] Not started
Phase 6 — Renewals      [ ] Not started
Phase 7 — Leads         [ ] Not started
Phase 8 — Bookings      [ ] Not started
Phase 9 — Polish        [ ] Not started
```
Update this as you go. Mark phases `[~]` in progress, `[x]` done.