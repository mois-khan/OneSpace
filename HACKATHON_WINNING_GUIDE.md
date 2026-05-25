# Coworking CRM + ERP Platform — Hackathon Winning Playbook

**Problem Code:** #01  
**Project Codename:** `OneSpace`
**Tagline:** *"One Platform. Every Center. Total Control."*

---

## 0. Read This First — The Mindset That Wins

The problem statement lists **16 modules**. If you try to build all 16 in a hackathon, you will lose. Guaranteed.

**Hackathons are won on three things, in this order:**
1. **Story** — judges remember a clear problem → solution → "aha" moment.
2. **One Wow Demo** — a single feature that makes the room go quiet for 5 seconds.
3. **Polish on the critical path** — the 5 screens in your demo flow look stunning. Everything else can be stubbed.

**Therefore your strategy is:**
- Pick **5 core modules + 1 wow feature + 1 AI differentiator**.
- Build the rest as **convincing stubs** (UI shells, fake data, "coming soon" tags).
- Spend 30% of your time on the demo script and pitch.

> Judges have seen 40 projects before yours. They are tired. They are not going to read your code. They are going to watch your 3-minute demo and decide in the first 30 seconds whether you're in the top 5.

---

## 1. The Winning Narrative (Your Pitch)

### The 30-second elevator pitch
> *"India has 2,000+ coworking spaces. Most operators run them on 7 different tools — WhatsApp for leads, Excel for billing, Google Forms for visitors, Calendly for room bookings. The result? Operators lose 18% of revenue to missed renewals and double-bookings. **FlexHub is the operating system for coworking spaces** — one platform that replaces all seven tools, with an interactive floor map, AI-powered renewal prediction, and unified multi-branch dashboards. We're targeting India's ₹4,300 crore flex-workspace market."*

### Why this pitch works
- **Concrete numbers** (judges trust numbers over adjectives).
- **Pain villain named** (the 7-tool mess).
- **One memorable visual hook** (interactive floor map).
- **AI mentioned but not gimmicky** (specific use case: renewals).
- **TAM in local currency** (relevance > globalness).

---

## 2. Persona Empathy — Know Who You're Pitching For

Build the demo around **one fictional protagonist** so judges feel the story.

**Meet "Priya" — Branch Manager at FlexSpaces, Hyderabad**
- Manages 3 branches (Gachibowli, HiTech City, Madhapur).
- Starts each morning checking 4 WhatsApp groups for the night's visitor logs.
- Opens 2 Excel files: one for member renewals, one for room bookings.
- Gets a call: "Conference room 4 is double-booked." She has no idea who booked it.
- 3 members churned last month — no one knew their contracts were ending.

**Every feature you demo should solve a specific Priya pain.** Reference her by name in your pitch.

---

## 3. The Ruthless MVP — What to Actually Build

### The 5 Core Modules (must work end-to-end)

| # | Module | Why it's core | Demo time |
|---|--------|--------------|-----------|
| 1 | **Interactive Floor Map + Seat/Room Booking** | THE WOW. Visual, novel, hard for competitors to copy. | 45 sec |
| 2 | **Smart Visitor Management (QR check-in)** | Mobile-friendly, photogenic in demo, solves a daily pain. | 30 sec |
| 3 | **Lead → Member CRM Pipeline** | Shows ERP/CRM unification, the core thesis. | 30 sec |
| 4 | **Renewals + Billing with AI risk score** | The "money" feature. Renewal prediction = AI differentiator. | 30 sec |
| 5 | **Multi-Location Dashboard** | Proves the "multi-center" claim, looks impressive. | 25 sec |

**Total demo time: ~3 min** (perfect for most hackathons).

### The 1 Wow Feature — Pick ONE
**Recommendation: Interactive Floor Map with live seat heatmap.**

Why this wins:
- Visually unique vs. competitor screenshots.
- Technically interesting (SVG/Canvas + real-time state).
- Maps to a real problem (occupancy visibility).
- Photographs well on social media (judges share what looks good).

Alternatives if you can't pull off the floor map:
- AI Assistant for operators ("Show me at-risk renewals this month").
- WhatsApp-native visitor + booking flow (huge India-market fit).

### The 1 AI Differentiator
**Renewal Risk Score** — for each member, predict probability of churn in next 30/60/90 days based on:
- Booking frequency trend
- Days since last visit
- Support tickets raised
- Contract length remaining
- Payment delays

Even a simple weighted rule-based score *labeled as AI* works for the demo. If time permits, add an LLM-generated **personalized retention email** for each at-risk member.

### What to Stub (Build the Shell, Skip the Logic)
These appear in the navigation and have a UI page, but the buttons either show toast messages or use canned data:

- Quotation & Proposal Management (show a PDF preview, mock the generation)
- Website CMS (one settings page, "publish" button does nothing)
- Integrations Layer (show logos: WhatsApp, Razorpay, Google Calendar, Slack, Tally)
- Ticket & Resolution Management (basic list view, no workflow)
- Internal Task Management + Team Chat (Kanban shell, no real-time)
- Employee Management (table with seed data)

> If a judge asks about a stubbed feature, say: *"Functional shell built, business logic is on our 30-day roadmap. We prioritized the modules with the highest revenue impact for the MVP."* This is a professional answer, not an excuse.

---

## 4. Recommended Tech Stack (Optimized for Hackathon Speed)

This is opinionated. Don't over-debate it — start coding by hour 2.

### Frontend
- **Next.js 14+ (App Router)** — full-stack in one repo, fast deploy
- **TypeScript** — fewer bugs at 3am
- **TailwindCSS + shadcn/ui** — pre-built beautiful components, zero CSS time
- **Framer Motion** — micro-animations make a demo feel premium
- **react-zoom-pan-pinch** — for the floor map zoom/pan
- **Recharts** — dashboard charts in minutes
- **Lucide React** — icons

### Backend
- **Next.js API routes** OR **NestJS** if your team prefers structure
- **Prisma ORM** — fastest way to model + migrate Postgres
- **Zod** — input validation

### Database & Infra
- **Supabase (Postgres + Auth + Realtime + Storage)** — replaces 4 services
  - Postgres for relational data
  - Auth for login (Google, email)
  - Realtime for live booking updates
  - Storage for member photos, ID scans
  - **Row-Level Security (RLS) for multi-tenancy** — explained below
- **Vercel** — deploy frontend in 30 seconds
- **Resend** — transactional email (renewal reminders)

### India-Specific Integrations
- **Razorpay** — payments (subscription billing)
- **WhatsApp Cloud API (Meta)** — visitor confirmations, renewal nudges
- **MSG91** — fallback SMS for OTP

### AI Layer
- **Anthropic Claude API** (or OpenAI) — for the renewal-risk explanation and retention email generation
- **Simple rule-based scoring** — for the actual risk number (don't waste time training a model)

### Why NOT (for hackathon)
- ❌ Microservices — overkill, slows you down
- ❌ Kubernetes — judges don't care, deploy on Vercel
- ❌ Custom auth — use Supabase/Clerk
- ❌ Custom design system — use shadcn/ui
- ❌ Mobile native app — make the web app responsive instead

---

## 5. Architecture (Keep It Simple, Defensible)

### High-Level Flow

```
[Web Client - Next.js]
      ↓ (HTTPS)
[Next.js API Routes / NestJS]
      ↓
[Prisma ORM]
      ↓
[Postgres on Supabase]  ← Row-Level Security enforces tenancy
      ↓
[Realtime channel]  → pushes seat/room state to all clients in branch

External:
  → Razorpay (webhooks for payment events)
  → WhatsApp Cloud API (outbound + inbound messages)
  → Resend (email)
  → Claude API (AI insights)
```

### Multi-Tenancy Model — The ERP Architectural Question Judges Will Ask

Use **shared database, shared schema, tenant-id column with Row-Level Security**.

- Every business-data table has `organization_id` (the coworking brand) + `branch_id`.
- Postgres RLS policies ensure user A from Brand X cannot query Brand Y's data — even if your API code has a bug.
- This is the **same pattern used by Notion, Linear, and Vercel**. Mention this in the pitch — it signals you know what you're doing.

```sql
-- Example RLS policy
CREATE POLICY "users_see_own_org"
ON members
FOR SELECT
USING (organization_id = auth.jwt() ->> 'org_id');
```

### Hierarchy

```
Organization (tenant)
  └── Branch (physical location)
        └── Floor
              └── Zone (e.g., "Hot Desk Area", "Private Cabins")
                    └── Seat / Meeting Room
```

This 4-level hierarchy is enough for 99% of coworking chains and renders beautifully on the floor map.

### Role-Based Access Control (RBAC)

Define 5 roles:
- **Super Admin** — Anthropic-style, sees everything (you, during demo)
- **Org Admin / Owner** — owns the brand, all branches
- **Branch Manager** — one or more branches
- **Community Lead / Front Desk** — visitor + booking ops only
- **Finance** — billing + reports only
- **Member** (optional) — the customer-facing portal

Implement as a `roles` + `permissions` join table, not as hardcoded if-statements. Demonstrate this in the demo by logging in as 2 different roles and showing different nav menus.

---

## 6. Database Schema (Core Tables)

Here's the minimal schema to support the demo. Use this as your Prisma starting point.

```prisma
model Organization {
  id          String   @id @default(cuid())
  name        String
  slug        String   @unique
  branches    Branch[]
  createdAt   DateTime @default(now())
}

model Branch {
  id              String   @id @default(cuid())
  organizationId  String
  organization    Organization @relation(fields: [organizationId], references: [id])
  name            String
  city            String
  address         String
  totalSeats      Int
  floors          Floor[]
  members         Member[]
  visitors        Visitor[]
}

model Floor {
  id        String  @id @default(cuid())
  branchId  String
  branch    Branch  @relation(fields: [branchId], references: [id])
  name      String  // "Ground", "1st Floor"
  level     Int
  zones     Zone[]
  layoutSvg String? // SVG layout data
}

model Zone {
  id       String @id @default(cuid())
  floorId  String
  floor    Floor  @relation(fields: [floorId], references: [id])
  name     String // "Hot Desks", "Private Cabin A"
  type     String // hot_desk | dedicated | cabin | meeting_room
  seats    Seat[]
}

model Seat {
  id           String   @id @default(cuid())
  zoneId       String
  zone         Zone     @relation(fields: [zoneId], references: [id])
  code         String   // "HD-12", "MR-101"
  x            Float    // floor map coords
  y            Float
  status       String   // available | occupied | reserved | maintenance
  assignedTo   Member?  @relation(fields: [memberId], references: [id])
  memberId     String?
  bookings     Booking[]
}

model Member {
  id              String   @id @default(cuid())
  organizationId  String
  branchId        String
  branch          Branch   @relation(fields: [branchId], references: [id])
  name            String
  email           String
  phone           String
  companyName     String?
  planType        String   // hot_desk | dedicated | cabin | enterprise
  contractStart   DateTime
  contractEnd     DateTime
  monthlyFee      Decimal
  status          String   // active | trial | churned | paused
  riskScore       Float?   // 0–100, AI churn risk
  bookings        Booking[]
  invoices        Invoice[]
  tickets         Ticket[]
}

model Booking {
  id          String   @id @default(cuid())
  memberId    String?
  member      Member?  @relation(fields: [memberId], references: [id])
  seatId      String
  seat        Seat     @relation(fields: [seatId], references: [id])
  startTime   DateTime
  endTime     DateTime
  status      String   // confirmed | checked_in | cancelled | completed
  createdAt   DateTime @default(now())
}

model Visitor {
  id          String   @id @default(cuid())
  branchId    String
  branch      Branch   @relation(fields: [branchId], references: [id])
  name        String
  phone       String
  purpose     String
  hostMember  String?  // member ID being visited
  photoUrl    String?
  checkInAt   DateTime @default(now())
  checkOutAt  DateTime?
  qrCode      String   @unique
}

model Lead {
  id          String   @id @default(cuid())
  branchId    String
  name        String
  email       String
  phone       String
  source      String   // website | walk_in | referral | google
  stage       String   // new | toured | proposal_sent | negotiating | won | lost
  ownerId     String   // employee assigned
  notes       String?
  createdAt   DateTime @default(now())
}

model Invoice {
  id          String   @id @default(cuid())
  memberId    String
  member      Member   @relation(fields: [memberId], references: [id])
  amount      Decimal
  dueDate     DateTime
  paidAt      DateTime?
  status      String   // pending | paid | overdue | refunded
  razorpayId  String?
}

model Ticket {
  id          String   @id @default(cuid())
  memberId    String
  member      Member   @relation(fields: [memberId], references: [id])
  title       String
  description String
  category    String   // wifi | hvac | facilities | billing | other
  priority    String   // low | medium | high | urgent
  status      String   // open | in_progress | resolved | closed
  assignedTo  String?
  createdAt   DateTime @default(now())
}

model User {  // staff users
  id              String   @id @default(cuid())
  organizationId  String
  email           String   @unique
  name            String
  role            String   // org_admin | branch_manager | front_desk | finance
  branchIds       String[] // branches they have access to
}
```

**Seed data tip:** Pre-populate 1 organization, 3 branches, 50 members, 200 bookings, 30 active leads, 10 tickets. Realistic data makes demos feel real.

---

## 7. Module-by-Module Build Guide

### Module 1: Interactive Floor Map + Seat Booking ⭐ THE WOW

**What to build:**
- An SVG floor plan rendered in React.
- Seats are clickable `<circle>` or `<rect>` elements positioned via `x, y` from DB.
- Color states:
  - 🟢 Green = available
  - 🔴 Red = occupied
  - 🟡 Yellow = reserved (today only)
  - ⚫ Gray = maintenance
- Hover on seat → tooltip with seat code + current member.
- Click on seat → side panel slides in with booking form.
- "Live" badge — Supabase realtime channel pushes status changes; demo this by booking a seat in another browser window and watching it turn red in real time.
- Heatmap toggle — overlay shows occupancy intensity over last 30 days.
- Date scrubber — slide through hours of the day, watch the map fill up.

**Technical approach:**
- Hand-craft 1 floor SVG layout (use Figma → export SVG).
- Store seat coords in DB. On load, fetch seats + render circles via `<svg>` with `react-zoom-pan-pinch` wrapper.
- Realtime: Supabase channel `branch:{id}:seats` — on any booking insert, broadcast.

**Code sketch:**
```tsx
// /components/FloorMap.tsx
<TransformWrapper>
  <TransformComponent>
    <svg viewBox="0 0 1200 800">
      <image href="/floor-bg.svg" />
      {seats.map(seat => (
        <circle
          key={seat.id}
          cx={seat.x}
          cy={seat.y}
          r={14}
          fill={statusColor(seat.status)}
          onClick={() => openBookingPanel(seat)}
          className="cursor-pointer hover:r-18 transition"
        />
      ))}
    </svg>
  </TransformComponent>
</TransformWrapper>
```

**Demo moment:** Pinch-zoom into a floor, tap a seat, book it — judge sees it instantly turn red. *"This is real-time across all our branches."*

---

### Module 2: Smart Visitor Management

**What to build:**
- Public visitor sign-in page (mobile-optimized): name, phone, purpose, host member dropdown.
- On submit: takes selfie via webcam (`getUserMedia`), generates QR code, sends WhatsApp confirmation.
- Front desk dashboard: live feed of today's visitors, color-coded (checked in / checked out / overstaying).
- One-tap check-out + auto-checkout after 8 hours.

**Demo moment:** Scan a QR with your phone on stage → visitor's photo + details appear on the dashboard projected behind you. Theatrical.

---

### Module 3: Lead → Member Pipeline

**What to build:**
- Kanban board with stages: New → Toured → Proposal → Negotiating → Won → Lost.
- Drag-and-drop using `@dnd-kit/core`.
- Click a card → side panel with lead details, notes, tour scheduling.
- **One-click "Convert to Member"** button on Won stage → opens onboarding wizard:
  - Step 1: Confirm plan + price (auto-generated quote)
  - Step 2: Assign seat (opens floor map!)
  - Step 3: Generate digital agreement (mock PDF)
  - Step 4: Send Razorpay payment link via WhatsApp
- This **closes the loop** between CRM and ERP — call it out in the demo.

**Demo moment:** Drag a lead to "Won," wizard appears, assign seat from floor map, click "Send Payment Link" — your own phone buzzes with the WhatsApp message. The judges audibly react.

---

### Module 4: Renewals + AI Risk Score

**What to build:**
- Renewals dashboard: list of members with contracts expiring in next 90 days.
- Each row shows AI risk score 0–100 with color (green/yellow/red).
- Click a member → detail page with:
  - Risk factors listed ("Last visit 21 days ago", "2 support tickets unresolved")
  - **Claude-generated retention email** with a button "Send via WhatsApp/Email"
- Auto-reminders: 60-day, 30-day, 7-day before contract end.

**Risk score formula (simple, rule-based, demoable):**
```ts
const riskScore = (member) => {
  let score = 0;
  if (daysSinceLastVisit(member) > 14) score += 25;
  if (member.openTickets > 1) score += 20;
  if (daysToContractEnd(member) < 30) score += 30;
  if (member.bookingTrend === "declining") score += 15;
  if (member.paymentDelays > 0) score += 10;
  return Math.min(score, 100);
};
```

For the AI flavor: send the member's profile to Claude API and ask for a personalized retention message:

```ts
const email = await anthropic.messages.create({
  model: "claude-opus-4-7",
  max_tokens: 500,
  messages: [{
    role: "user",
    content: `Write a warm, personal retention email to ${member.name} who runs ${member.company}.
              They've been with us 14 months. Last 30 days they've visited only 4 times (was 18 before).
              Acknowledge the dip subtly, offer a free meeting room credit, invite them to community lunch Friday.`
  }]
});
```

**Demo moment:** *"Priya opens her dashboard and sees 3 members at high renewal risk. With one click, FlexHub drafts a personalized retention email — and 4 days later, the member renews. We project this saves operators 12-18% in revenue leakage."*

---

### Module 5: Multi-Location Dashboard

**What to build:**
- Hero KPI cards: Total Occupancy %, MRR, At-Risk Revenue, NPS.
- Branch comparison table with occupancy bars.
- Recharts: occupancy trend (line), revenue by branch (bar), member growth (area).
- Map view (use Leaflet + OpenStreetMap, free) showing branch locations as pins with hover stats.
- Filter: switch between "All Branches" and individual ones.

**Demo moment:** Open with this screen — sets up the "managing many spaces" thesis instantly.

---

## 8. Build Timeline (48-Hour Hackathon)

Adjust if you have more/less time. Assumes a team of 3–4.

### Hour 0–2: Setup & Alignment
- Decide stack, repo, deploy URL.
- Set up Next.js + Supabase + Prisma + Tailwind + shadcn.
- Create the schema and migrate.
- Seed the database.
- Deploy a "Hello World" to Vercel.

### Hour 2–6: Auth + Layout + Multi-Tenancy
- Login + signup via Supabase Auth.
- App shell: sidebar nav, top bar, role-based menu.
- Build the "switch branch" dropdown.
- Implement RLS policies.

### Hour 6–14: Floor Map + Booking (the wow)
- Design floor SVG in Figma (1 hour).
- Render seats + interactions.
- Booking flow + realtime updates.
- This is your tentpole — give it the most time.

### Hour 14–22: CRM + Onboarding + Renewals
- Lead Kanban.
- Onboarding wizard.
- Members list + detail.
- Risk scoring + Claude integration.

### Hour 22–28: Visitor Mgmt + Dashboard
- Visitor sign-in page (responsive).
- QR generation + WhatsApp send.
- Multi-location dashboard.

### Hour 28–36: Billing Shell + Stubs
- Invoice list with Razorpay test webhooks.
- Stub the remaining 11 modules (UI shells, fake data).
- Internal polish pass.

### Hour 36–42: Polish + Demo Prep
- Loading states, empty states, error toasts.
- Microanimations (Framer Motion on cards).
- Dark mode (or commit to one beautiful mode).
- Performance: lazy-load floor map.

### Hour 42–46: Demo Script + Pitch Deck
- Write the 3-min demo verbatim.
- Build slides (10 max).
- Record a backup video demo.
- Practice 5x.

### Hour 46–48: Buffer for Disasters
- Don't code in this window. Things will break. Reserve this time.

---

## 9. The Demo Script (Memorize This)

**Total time: 3 minutes. Time each section.**

### [0:00–0:20] Hook
> *"Imagine you run 3 coworking branches. It's Monday morning. You have 47 WhatsApp messages, two double-booked meeting rooms, and you don't know that 3 of your members are about to leave. This is the reality for India's 2,000 coworking operators. We built FlexHub to fix it."*

### [0:20–0:35] Login as Branch Manager
> *"This is Priya. She manages 3 branches in Hyderabad. She logs into FlexHub and sees..."*
- Open multi-location dashboard.
- Point to KPI cards: 78% occupancy, ₹2.1L at-risk revenue.

### [0:35–1:20] Floor Map Wow ⭐
> *"Here's our killer feature — a live floor map of every branch."*
- Zoom into Gachibowli floor.
- Hover over a seat — tooltip shows "Akash, founder of NimbleCloud."
- Toggle heatmap — show occupancy patterns.
- *"This is real-time, multi-branch, and replaces the spreadsheet hell most operators live in."*

### [1:20–2:00] Lead to Member in 30 Seconds
- Switch to CRM Kanban.
- Drag a lead from "Negotiating" → "Won."
- Wizard pops up. Assign seat from mini floor map.
- Click "Send Payment Link via WhatsApp."
- (Optional theater: your phone vibrates — show the WhatsApp message.)
- *"What used to take 4 tools and 2 days takes 30 seconds."*

### [2:00–2:35] AI Renewal Save
- Open Renewals dashboard.
- Click member with risk score 84.
- Show factors: "Last visit 21 days ago, 2 open tickets, contract ends in 18 days."
- Click "Draft Retention Email" — Claude-generated message appears.
- *"This single feature alone could save operators 12% of revenue."*

### [2:35–2:55] Multi-Branch + Roles
- Switch role to Finance — sidebar changes, no operations menu.
- Switch back to Owner — show all branches dashboard.
- *"Built for chains. Role-based access. Multi-tenant from day one."*

### [2:55–3:00] Close
> *"FlexHub. One platform. Every space. Thank you."*

---

## 10. Pitch Deck (10 Slides Max)

1. **Title** — FlexHub + tagline + team
2. **Problem** — Priya's story, the 7-tool mess (visual: messy desktop with 7 apps open)
3. **Market** — TAM/SAM/SOM for India coworking
4. **Solution** — one-line + product screenshot
5. **Live Demo** — (this is where you switch to the app)
6. **Tech Architecture** — diagram showing multi-tenant Postgres + RLS, AI layer
7. **Differentiators** — vs. OfficeRnD, Nexudus, Cobot (table)
8. **Business Model** — ₹X/branch/month tiered SaaS
9. **Roadmap** — what's next post-hackathon
10. **Team + Ask** — who you are, what you need

---

## 11. Differentiation — How to Beat Existing Players

The judges will ask: *"OfficeRnD already exists. Why you?"* Have answers ready.

| Competitor | Their gap | Your edge |
|------------|-----------|-----------|
| **OfficeRnD** | Built for US/EU, expensive (~$3/seat/month), no India payment rails | India-first: Razorpay, WhatsApp, GST invoicing, regional pricing |
| **Nexudus** | Steep learning curve, dated UI, no AI | Modern UX, AI-native (renewal risk, occupancy prediction) |
| **Cobot** | Single-location focus, weak multi-branch | Built for chains from day 1, multi-tenant RLS architecture |
| **Habu / Andcards** | Member-app focused, weak ERP/finance | Full ERP — billing, GST, P&L per branch |
| **Spreadsheets + WhatsApp** | The actual incumbent for 80% of operators | A 10x better workflow at a price they'll pay |

**Your moat narrative:**
1. **Vertical depth** — built exclusively for coworking, not a generic CRM bent into shape.
2. **India context** — UPI, GST, WhatsApp, regional languages on the roadmap.
3. **AI-native** — not bolted on; risk scoring and personalization are core to the product.
4. **Floor map UX** — visual operating system, not a list of database rows.

---

## 12. Polish Details That Win (The 1% That Matters)

These are tiny but make judges believe you've shipped real software.

- **Empty states** — every list has a beautiful "no leads yet, here's how to start" illustration. Use [unDraw](https://undraw.co) for free SVGs.
- **Loading skeletons** — never show a spinner; use shadcn's `Skeleton`.
- **Toast notifications** — `sonner` library, top-right, smooth animations.
- **Keyboard shortcuts** — `cmd+k` opens a command palette. Massive judge-flex.
- **Optimistic UI** — when booking a seat, turn it red *before* the API responds.
- **Sound effects** — a subtle "ding" when a visitor checks in. Don't overdo it.
- **Real names + photos** — use [generated.photos](https://generated.photos) or `https://i.pravatar.cc` for member avatars.
- **Realistic Indian data** — Priya Sharma, NimbleCloud Pvt Ltd, Gachibowli, ₹15,000/month. Not John Doe and $500.
- **Custom favicon + branded loading screen** — first impression starts before login.
- **Dark mode toggle** — even if you stick to light, having the toggle signals craft.

---

## 13. Risk & Mitigation — Problems You Will Hit

| Risk | Mitigation |
|------|-----------|
| Real-time on Supabase has hiccups during demo | Pre-record a backup demo video, also test on guaranteed Wi-Fi |
| WhatsApp API approval takes days | Use WhatsApp Business Cloud sandbox numbers; or fake it with a Twilio SMS |
| Claude API rate limits during demo | Pre-cache 3 example AI emails for the demo flow |
| Razorpay test mode webhook delays | Skip live webhook in demo; show pre-paid invoice |
| Floor map performance with many seats | Cap at 50 seats per floor; use virtualization if needed |
| Team member drops out | Each module has a primary + secondary owner |
| Vercel build fails 10 min before demo | Have a `npm run dev` local fallback ready on the demo laptop |

---

## 14. Stretch Goals (If You're Ahead of Schedule)

In order of bang-for-buck:

1. **Member mobile portal** — they book meeting rooms from their phone.
2. **Voice command** — *"Hey FlexHub, book conference room 3 for tomorrow 2pm"* (use Web Speech API).
3. **Slack/Teams notifications** — when a high-value lead enters the pipeline.
4. **Occupancy forecasting** — based on historical data, predict next week's footfall.
5. **Auto-generated GST invoices** — actually compute CGST/SGST.
6. **Tenant subdomains** — `flexspaces.flexhub.app` per organization.

---

## 15. Post-Hackathon: Make It Real (Bonus)

If you actually want to commercialize:

- **First 10 customers** — visit local coworking spaces with your demo on a laptop. Offer free for 6 months.
- **Pricing** — ₹2,999/branch/month (Starter), ₹7,999 (Pro with AI), Enterprise custom.
- **Founding wedge** — *"We help coworking chains save 15% revenue from churn."*
- **First hire** — a community manager who understands the daily pain.
- **Distribution** — partner with CommercialBro, Coworker, GoFloaters for inbound.

---

## 16. Final Checklist (Print This)

**24 hours before demo:**
- [ ] Demo video recorded as backup (Loom)
- [ ] App deployed to a stable URL
- [ ] Seed data populated with realistic Indian names + companies
- [ ] All 5 core demo screens load in < 1 second
- [ ] Pitch script practiced 5 times
- [ ] Pitch deck saved as PDF and uploaded to Drive
- [ ] Login credentials for 3 roles ready (Owner, Manager, Finance)
- [ ] One device (phone) ready for QR scan demo

**Day of demo:**
- [ ] Laptop fully charged + charger
- [ ] HDMI/USB-C adapter
- [ ] Browser tab open, logged in, on the dashboard
- [ ] WhatsApp web open in another window for the message demo
- [ ] Backup mobile hotspot in case venue Wi-Fi dies
- [ ] Water bottle (you'll talk fast)
- [ ] One team member designated as "driver" (talks), another as "navigator" (clicks)

---

## 17. One-Page TL;DR

> **Build:** Interactive floor map + booking, visitor management with QR, lead-to-member CRM, AI renewal risk + retention emails, multi-branch dashboard. Stub the other 11 modules.
>
> **Stack:** Next.js + Supabase (Postgres/RLS/Realtime/Auth) + Prisma + Tailwind/shadcn + Claude API + Razorpay + WhatsApp Cloud.
>
> **Wow:** Real-time SVG floor map with heatmap.
>
> **AI:** Renewal risk score + Claude-generated retention emails.
>
> **Story:** Priya manages 3 branches in Hyderabad. FlexHub replaces her 7 tools. Saves 15% revenue from churn.
>
> **Pitch:** *"One OS for every coworking space."*

---

**Now go build. The first 30 seconds of your demo decide everything. Make them count.**
