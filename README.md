# OneSpace — Operational Intelligence for Coworking

> The command center for multi-branch coworking operators. One unified platform for visitors, bookings, members, renewals, leads, and revenue — AI-aware, role-scoped, and built for India.

---

## Project Overview

### The problem

Coworking operators in India run their business across **six disconnected tools**: a spreadsheet for members, WhatsApp for visitors, separate booking apps per branch, an accounting tool nobody opens, scattered notes for renewals, and memory for everything else. The cost is real — missed renewals, empty desks, and revenue leakage that doesn't surface until the month closes.

### The solution

**OneSpace** consolidates the entire coworking business lifecycle into a single, high-clarity SaaS platform purpose-built for multi-branch operators. It replaces the toolbox with **one workspace** that handles:

- Smart visitor management with **QR-based pre-registration, kiosk self-check-in, and digital badges**
- Conference room bookings with **conflict detection**
- Interactive **multi-branch floor maps** with live occupancy
- Member CRM with **risk scoring and AI retention emails**
- **Renewals pipeline** with bulk personalized outreach
- Sales lead **kanban with drag-and-drop stages**
- **AI assistant** (Gemini-powered) that knows the user's role, branch, and live data
- **Universal role-based access control** with 14 role × branch personas
- Cross-page **real-time data propagation** (check in a visitor → dashboard updates instantly)

### Problem statement alignment

OneSpace directly addresses the GradSkills Summership 2026 PropTech problem statement: *"Coworking spaces managing multiple branches struggle with fragmented operations across visitor handling, bookings, client onboarding, renewals, finances, and internal communication."*

8 of 16 listed solution modules are fully implemented; 3 are partially implemented (onboarding wizard, tickets per-member, page-level RBAC); the remaining 5 (quotation/proposal, team management, finance UI, internal task management, integrations layer, website CMS) are acknowledged in the V2 roadmap.

---

## Setup Instructions

### Prerequisites

- **Node.js 20.x** or higher
- **npm** (or pnpm / yarn — the repo uses npm by default)
- A **Google Gemini API key** (free tier works fine — get one at [aistudio.google.com](https://aistudio.google.com/app/apikey))

### Quick start (3 minutes)

```bash
# 1. Clone the repository
git clone https://github.com/<your-username>/onespace.git
cd onespace

# 2. Install dependencies
npm install

# 3. Create your .env file
cp .env.example .env
```

Open `.env` in your editor and paste your Gemini key:

```env
GEMNINI_API_KEY=AIza...your-key-here
NEXT_PUBLIC_SUPABASE_URL=https://placeholder.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=placeholder
```

> **Note:** The env variable name is `GEMNINI_API_KEY` (with the typo preserved from the original project). The Supabase variables are placeholders — the current build runs entirely on a deterministic in-memory store and does not require a real Supabase instance.

```bash
# 4. Run the dev server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). You'll be redirected to `/login`. Click **"Login as CS Coworking Space"** and you're in.

### Available scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Start Next.js dev server with hot reload |
| `npm run build` | Production build |
| `npm run start` | Run the production build |
| `npm run lint` | ESLint check |
| `npx tsc --noEmit` | TypeScript type check |

### Production build

```bash
npm run build
npm run start
```

Deploys cleanly to Vercel — push to GitHub and import the repo at [vercel.com/new](https://vercel.com/new). Set the `GEMNINI_API_KEY` environment variable in the Vercel dashboard.

---

## Features Implemented

### 1. Universal multi-branch dashboard (`/dashboard`)

- **Pulse Bar** — 4 live action signals (renewals due, overdue invoices, high-risk members, visitors today)
- **AI Insight Banner** — click to open the assistant with a context-aware prompt
- **4 KPI cards** with 30-day sparklines and tabular numbers (Occupancy, MRR, At-Risk Revenue, Active Members)
- **Today's Focus** — three-column command queue (Renewals · Overdue · Front desk)
- **Branch Performance Matrix** — sortable table with health pills and 14-day occupancy sparklines, clickable rows that open the corresponding floor map
- **Trends** — 30-day occupancy + revenue charts (Recharts)
- All metrics auto-scope to the active branch and active role

### 2. Smart Visitor Management with QR codes (`/visitors`)

The signature feature of OneSpace. **Three QR touchpoints in one continuous flow:**

- **Pre-registration** — host fills a form → generates a unique invite QR + WhatsApp share link (`wa.me`) with a pre-baked message
- **Kiosk Mode** — full-screen QR for tablets at the front desk; walk-in visitors scan to start check-in on their phone
- **Mobile self-check-in** at `/checkin/[code]` — visitor enters their invite code → confirms details → check-in completes; their phone displays a **personal badge QR** for door access and exit

Other components on the page:
- **Live arrivals ticker** with rotating recent check-ins
- **5 smart KPIs** (Currently inside, Overstaying >8h, Pre-registered awaiting, Avg visit, Peak hour)
- **Pre-registration queue** with ETA chips, resend, and cancel actions
- **Visitor log** with live duration ticking, smart status pills, search/filter
- **Visitor detail panel** with full visit history (by phone number — auto-detects returning visitors)
- **Host autocomplete** for fast walk-in check-in

### 3. RBAC-aware AI Assistant (`Cmd/Ctrl + J`)

A Gemini 2.5 Flash-powered chat panel with **proper role-based access control**:

- **9 read tools + 3 suggestion tools** exposed to the model via function calling
- **System prompt** baked with role description, branch scope, today's KPIs, and branch summary
- **Suggested action chips** in responses — click "✨ Renew {Member}" to dispatch the action via the store
- **Tool allowlist per role** — Community Manager cannot call finance tools even if the model tries
- **Branch lock enforcement** — scoped roles see only their branch's data
- 4 role-aware **starter prompts** per persona
- Server-side route: [`/api/ai/chat`](src/app/api/ai/chat/route.ts)

### 4. Universal Role Switcher + RBAC

A first-class TopBar widget that lets you switch between **14 role × branch personas**:

- **Cross-organization roles**: Owner, Operations Lead (see all branches)
- **Branch-locked roles**: Branch Manager × 6 branches, Community Manager × 6 branches (12 personas)
- **Real enforcement at three layers:**
  1. **Sidebar nav** — hides nav items the role can't access (e.g., Community sees no Renewals or Leads)
  2. **Branch selector** — becomes a `🔒 Locked` chip for scoped roles; the dropdown disappears
  3. **Store reducer** — `SET_BRANCH` is rejected at the data layer if it conflicts with `branchScope`. Even if the UI is bypassed, the data is safe.
- **Dashboard adapts visibly** — Community Manager doesn't see MRR or At-Risk Revenue cards; the AI Insight banner is hidden; the PulseBar reshapes

### 5. Renewals & Risk (`/renewals`)

- **Renewal Hero** — At-Risk Revenue headline + 4-band stacked bar (Critical · High · Watch · Healthy) with member counts
- **30-day Renewal Timeline** — bar chart of expiring contracts, color-coded by member risk
- **5 filter chips** — All · Critical (70+) · High · Expiring ≤30d · Ghosting ≥14d
- **Risk Table** with multi-select checkboxes, avatar identity, **"Why at risk"** reason chips (Contract expiring · No visit · Open tickets), 3-action affordances per row (AI Suggest Offer · Email · Renew)
- **Floating Selection Toolbar** when rows are selected: AI Email all · Renew all · WhatsApp blast
- **Bulk Email Modal** — fires parallel Gemini calls (one personalized email per recipient) with live progress UI, expandable previews, and a mock send

### 6. Members directory (`/members` + `/members/[id]`)

- Grid / table view toggle
- Search by name, company, email
- Plan filter
- Member detail page with **risk gauge**, contact info, recent activity timeline, AI retention email modal (Gemini-powered), one-click renewal, invoice history tab
- Onboarding wizard modal (multi-step)

### 7. Leads pipeline (`/leads`)

- **4-column active kanban** (New · Toured · Proposal · Negotiating) — fits comfortably at 1280px+
- **Collapsible "Recently closed"** drawer showing Won + Lost as compact grid
- **Drag-and-drop** stage transitions via `@dnd-kit`
- **Quick-close buttons** ("Mark Won" / "Mark Lost") on Negotiating and Proposal cards
- **Move-to menu** on every card (the ⋯ button) for non-adjacent stage moves
- **Stale-card visual escalation** — amber border at >7d, red border + "Stale Nd — at risk" ribbon at >14d
- Inline "Add Lead" quick form
- Pipeline stats bar with per-stage counts and totals

### 8. Interactive Floor Map (`/floor-map`)

- Hand-crafted SVG layouts per branch (6 unique floor plans)
- **Zones, seats, room codes** with status-colored circles/rectangles
- **Pan & zoom** via `react-zoom-pan-pinch`
- **Drag-to-move** seats (interactive layout editing)
- **Rich hover tooltips** with member name, plan, MRR
- **Zone-type filter chips** (Hot desks / Dedicated / Cabins / Meeting rooms)
- **Status legend** with live count badges
- **Seat detail slide-out panel** with member context and quick actions
- Branch-aware — switches layouts in animated transitions
- URL param support (`/floor-map?branch=b2`)

### 9. Conference room bookings (`/bookings`)

- Day calendar with hourly grid
- Room selector tabs (per branch)
- Quick book panel with conflict detection
- Date navigation + Today button

### 10. Universal infrastructure

- **Cross-page real-time data propagation** — check in a visitor, the dashboard "Visitors today" KPI increments live without a refresh
- **Single source of truth** via React Context + reducer (`src/lib/store/`)
- **Deterministic data generation** — seeded RNG so the demo state is reproducible
- **Command palette** (`Cmd/Ctrl + K`) — searches members, leads, visitors, branches; jump-to-page navigation
- **Notifications popover** wired to derived alerts (renewals due, invoices overdue, visitor overstays)
- **Profile menu** with user identity and sign-out
- **Sonner toasts** for every action confirmation
- **Mobile-friendly check-in route** at `/checkin` and `/checkin/[code]`

### 11. Login + onboarding placeholder (`/login`)

- 2-column branded landing — gradient panel left, sign-in card right
- One-click **"Login as CS Coworking Space"** — sets the demo Owner user
- "New registration" → modal explaining V2 self-serve signup with email capture

---

## Tech Stack Used

### Frontend framework
- **[Next.js 16.2](https://nextjs.org/)** with App Router, Server Components, and Turbopack
- **React 19.2** with the new compiler-aware rules (`react-hooks/purity`, `set-state-in-effect`)
- **TypeScript 5** in strict mode

### Styling
- **Tailwind CSS 4** with `@theme` inline configuration (no separate `tailwind.config`)
- **CSS variables** for the design system (CS-red `#E8192C`, status colors, hero gradients)
- **`tw-animate-css`** for animation primitives
- **Plus Jakarta Sans** (headings) + **Inter** (body) via `next/font/google`

### UI primitives
- **[shadcn](https://ui.shadcn.com/) 4.8** for base components (Card, Button, Dialog, Input, Badge)
- **[@base-ui/react](https://base-ui.com/) 1.5** — Dialog, Popover, Input primitives (the new Floating UI library)
- **[lucide-react](https://lucide.dev/) 1.16** for icons
- **[framer-motion](https://www.framer.com/motion/) 12.40** for transitions and gestures

### Data visualization
- **[Recharts](https://recharts.org/) 3.8** for line, bar, and area charts (dashboard, renewals timeline, sparklines)
- **Hand-crafted SVG** for the interactive floor maps (seats, zones, doors, badges)
- **[react-zoom-pan-pinch](https://github.com/prc5/react-zoom-pan-pinch) 4.0** for floor-map pan & zoom

### Interactions
- **[@dnd-kit](https://dndkit.com/) 6.3** for drag-and-drop on the leads kanban and floor-map seat editing
- **[qrcode.react](https://github.com/zpao/qrcode.react) 4.2** for visitor invite QRs, kiosk QRs, and badges
- **[Sonner](https://sonner.emilkowal.ski/) 2.0** for toast notifications

### AI & API
- **[Google Generative AI SDK](https://github.com/google/generative-ai-js) 0.24** — Gemini 2.5 Flash
- Two server routes:
  - **[`/api/ai/chat`](src/app/api/ai/chat/route.ts)** — multi-turn function calling for the assistant
  - **[`/api/ai/retention-email`](src/app/api/ai/retention-email/route.ts)** — single-call email generator
- **`@anthropic-ai/sdk` 0.98** is installed but currently unused (Gemini is the active provider)

### Architecture & state management
- **React Context + useReducer** with discriminated-union actions
- **Pure selector functions** layered over the reducer
- **Convenience hooks** (`useMembers`, `useKpis`, `useTodayFocus`, etc.) for component ergonomics
- **Deterministic seeded RNG** (Park–Miller) for reproducible demo data
- **No external state library** — vanilla React, no Redux, no Zustand

### Utilities
- **clsx + tailwind-merge** for class composition (`cn()` helper)
- **date-fns 4** for date manipulation
- **class-variance-authority** for variant-based component styling

### Tooling
- **ESLint 9** with `eslint-config-next` (core-web-vitals + typescript rule sets)
- **PostCSS** with `@tailwindcss/postcss`

---

## Project Structure (high level)

```
onespace/
├── src/
│   ├── app/                          ← Next.js App Router pages
│   │   ├── dashboard/page.tsx
│   │   ├── floor-map/page.tsx
│   │   ├── members/{page,[id]/page}.tsx
│   │   ├── visitors/page.tsx
│   │   ├── renewals/page.tsx
│   │   ├── leads/page.tsx
│   │   ├── bookings/page.tsx
│   │   ├── checkin/{page,[code]/page}.tsx   ← Mobile QR check-in
│   │   ├── login/page.tsx
│   │   ├── onboarding/page.tsx
│   │   └── api/ai/{chat,retention-email}/route.ts
│   │
│   ├── components/
│   │   ├── layout/                   ← AppShell, Sidebar, TopBar, RoleSwitcher, NotificationsPopover, ProfileMenu, CommandPalette
│   │   ├── assistant/                ← AssistantRoot, AssistantPanel
│   │   ├── dashboard/                ← PulseBar, KpiHeroCard, AiInsightBanner, TodayFocusCard, BranchTable, OccupancyChart, RevenueChart, Sparkline, SectionHeader
│   │   ├── visitors/                 ← LiveArrivalsTicker, VisitorKpiStrip, VisitorLog, VisitorDetailPanel, CheckInPanel, PreRegistrationQueue
│   │   ├── renewals/                 ← RenewalHero, RenewalTimeline, RiskTable, BulkEmailModal, SelectionToolbar, RenewalModal
│   │   ├── members/                  ← MemberCard, MemberTable, RiskGauge, RiskBar, OnboardingWizard, AIEmailModal
│   │   ├── leads/                    ← KanbanBoard, KanbanColumn, LeadCard
│   │   ├── bookings/                 ← DayCalendar, RoomSelector, QuickBookPanel
│   │   ├── floor-map/                ← MapContainer, MapControls, SeatNode, SeatDetailsPanel
│   │   └── ui/                       ← shadcn primitives (Card, Button, Dialog, Input, Badge, Select)
│   │
│   ├── lib/
│   │   ├── store/                    ← Unified data layer (provider, reducer, selectors, hooks, generators)
│   │   ├── ai/                       ← RBAC config, server-side tool implementations, snapshot builder
│   │   ├── rbac/                     ← Permission keys + useCan() hook
│   │   ├── data/floor-plan.ts        ← Per-branch SVG floor plan generators
│   │   └── utils.ts                  ← cn(), formatCurrency(), formatDate()
│   │
│   └── types/index.ts                ← All TypeScript interfaces
│
└── README.md                         ← This file
```

---

## Demo Flow (recommended order to explore)

1. Hit `/login` → click **"Login as CS Coworking Space"**
2. Walk down the dashboard — note the PulseBar, AI Insight banner, KPI cards, Today's Focus, Branch matrix
3. Press **`Ctrl/Cmd + J`** → ask the AI assistant *"Which branches need attention right now?"*
4. Click a suggestion chip to dispatch a real action via the store
5. Click the **role switcher** in the TopBar → switch to **"Community Manager · Raidurg"** and watch the dashboard re-render with RBAC enforced
6. Switch back to **Owner** → go to **`/visitors`** → click the **"Pre-register"** tab → fill out a quick invitation → see the QR + WhatsApp share link
7. Switch to the **"Kiosk Mode"** tab → click **fullscreen** to see the front-desk QR
8. Open `/checkin` on a second device (or new tab) → enter the invite code → confirm
9. Navigate to **`/renewals`** → click **"Critical (70+)"** filter → select 5 members → click **"AI Email all"** → watch Gemini draft personalized emails in parallel
10. Drag a lead between stages on **`/leads`** → mark a Negotiating card as Won

A walkthrough video accompanies this submission.

---

## Known Limitations & V2 Roadmap

**Honest accounting of what's not done yet:**

- **No real backend.** Data lives in client-side state. A refresh resets mutations. Supabase wiring is V2.
- **No real authentication.** The login button is a one-click demo entry. Real auth (Supabase Auth or NextAuth) is V2.
- **Onboarding wizard is a modal stub.** It opens but submissions are not persisted yet.
- **5 modules from the problem statement are deferred to V2:**
  - Quotation & Proposal Management
  - Employee & Team Management
  - Finance & Billing (dedicated UI; data exists in the store)
  - Ticket & Resolution Management (central queue; per-member tickets exist)
  - Internal Task Management, Website CMS, Integrations Layer, Team Chat
- **Floor-map seat drag** doesn't persist between page reloads.
- **CSV exports** are placeholders (UI exists, real export is V2).
- **WhatsApp blast** in renewals selection toolbar is a placeholder.

---

## Troubleshooting

| Problem | Fix |
|---|---|
| AI assistant returns "API key is not configured" | Check `.env` — variable is named **`GEMNINI_API_KEY`** (with the typo). Restart `npm run dev` after editing `.env`. |
| Dashboard shows old data after action | The store is in-memory; a hard refresh (`Ctrl+Shift+R`) resets it. This is by design for the demo. |
| `/floor-map` or `/checkin` shows a blank flash | Both pages use `useSearchParams()`, which Next.js 16 requires to be wrapped in `<Suspense>` — already handled. If you see persistent blankness, hard-refresh. |
| Branch selector dropdown is missing | You're in a **branch-locked role** (Branch Manager or Community Manager). Switch to Owner or Operations Lead via the role switcher to see all branches. |
| `npm install` fails | Ensure Node 20+ is installed. Delete `node_modules` and `package-lock.json`, then re-run `npm install`. |

---

## License

This project was built for the **GradSkills Summership 2026 PropTech Hackathon**. All source is original work by the OneSpace team.

---

## Credits

- **Hackathon:** GradSkills Summership 2026 — PropTech Track
- **Problem statement:** Coworking Space CRM + ERP Platform (Multi-Center Management)
- **AI:** Powered by Google Gemini 2.5 Flash
- **UI inspirations:** Linear, Stripe Dashboard, Attio, Vercel, Notion Calendar
