# OneSpace — Architecture

---

## Tech Stack

```
Framework:     Next.js 14 (App Router, TypeScript)
Styling:       Tailwind CSS v3 + CSS variables
Components:    shadcn/ui (customised — white/red theme)
Icons:         Lucide React
Charts:        Recharts
Drag & Drop:   @dnd-kit/core + @dnd-kit/sortable
Floor Map:     SVG (hand-crafted) + react-zoom-pan-pinch
Toast:         Sonner
Animation:     Framer Motion (page transitions + count-up)
AI:            Anthropic Claude API (claude-sonnet-4-6)
Auth:          Supabase Auth (or NextAuth with credentials — faster)
Database:      Supabase (Postgres + Realtime)
ORM:           Prisma
QR Codes:      qrcode.react
Fonts:         Google Fonts (Plus Jakarta Sans + Inter)
Deploy:        Vercel
```

---

## Folder Structure

```
onespace/
├── app/
│   ├── layout.tsx                  ← root: sidebar + topbar shell
│   ├── page.tsx                    ← redirect → /dashboard
│   ├── globals.css                 ← CSS vars, dark sidebar, resets
│   ├── login/
│   │   └── page.tsx
│   ├── dashboard/
│   │   └── page.tsx
│   ├── floor-map/
│   │   └── page.tsx
│   ├── visitors/
│   │   └── page.tsx
│   ├── members/
│   │   ├── page.tsx
│   │   └── [id]/
│   │       └── page.tsx
│   ├── renewals/
│   │   └── page.tsx
│   ├── bookings/
│   │   └── page.tsx
│   ├── leads/
│   │   └── page.tsx
│   └── api/
│       ├── ai/
│       │   └── retention-email/
│       │       └── route.ts        ← Claude API call
│       ├── seats/
│       │   └── route.ts            ← seat booking + realtime broadcast
│       └── visitors/
│           └── route.ts
│
├── components/
│   ├── layout/
│   │   ├── Sidebar.tsx             ← nav, branch switcher, role-aware
│   │   ├── TopBar.tsx              ← search, bell, date, avatar
│   │   └── AppShell.tsx            ← sidebar + topbar composition
│   │
│   ├── dashboard/
│   │   ├── StatCard.tsx
│   │   ├── BranchTable.tsx
│   │   ├── AlertFeed.tsx
│   │   ├── OccupancyChart.tsx      ← Recharts LineChart
│   │   └── RevenueChart.tsx        ← Recharts BarChart
│   │
│   ├── floor-map/
│   │   ├── FloorMap.tsx            ← main SVG component
│   │   ├── SeatCircle.tsx          ← individual seat SVG element
│   │   ├── SeatDetailPanel.tsx     ← slide-in panel
│   │   ├── FloorControls.tsx       ← branch/floor/heatmap toggles
│   │   └── RoomBookingPanel.tsx
│   │
│   ├── members/
│   │   ├── MemberCard.tsx
│   │   ├── MemberTable.tsx
│   │   ├── RiskGauge.tsx           ← SVG arc gauge
│   │   ├── RiskBar.tsx             ← thin progress bar variant
│   │   ├── OnboardingWizard.tsx    ← 4-step modal
│   │   └── AIEmailModal.tsx        ← Claude API result modal
│   │
│   ├── visitors/
│   │   ├── VisitorTable.tsx
│   │   ├── CheckInForm.tsx
│   │   └── QRDisplay.tsx
│   │
│   ├── leads/
│   │   ├── KanbanBoard.tsx
│   │   ├── KanbanColumn.tsx
│   │   └── LeadCard.tsx
│   │
│   ├── bookings/
│   │   ├── DayCalendar.tsx
│   │   └── QuickBookPanel.tsx
│   │
│   └── ui/                         ← shadcn/ui + custom primitives
│       ├── badge.tsx
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── input.tsx
│       ├── select.tsx
│       └── ...
│
├── lib/
│   ├── data/
│   │   └── seed.ts                 ← ALL static seed data (members, leads, etc.)
│   ├── risk-score.ts               ← churn risk algorithm
│   ├── claude.ts                   ← Anthropic SDK wrapper
│   ├── supabase.ts                 ← Supabase client
│   └── utils.ts                    ← cn(), formatCurrency(), formatDate()
│
├── hooks/
│   ├── useSeats.ts                 ← seat state + realtime subscription
│   ├── useBranch.ts                ← active branch context
│   └── useRole.ts                  ← role-based access
│
├── types/
│   └── index.ts                    ← all TypeScript interfaces
│
├── prisma/
│   └── schema.prisma
│
├── public/
│   ├── cs-logo.svg
│   └── floor-bg-gachibowli.svg     ← pre-drawn floor outline
│
└── middleware.ts                    ← auth guard (redirect /login if no session)
```

---

## Data Model (Prisma Schema)

```prisma
model Branch {
  id          String   @id @default(cuid())
  name        String   // "Gachibowli", "Hitech City", etc.
  location    String   // "Gachibowli, Hyderabad"
  totalSeats  Int
  floors      Floor[]
  members     Member[]
  visitors    Visitor[]
  leads       Lead[]
  createdAt   DateTime @default(now())
}

model Floor {
  id        String  @id @default(cuid())
  branchId  String
  branch    Branch  @relation(fields: [branchId], references: [id])
  name      String  // "Ground Floor", "1st Floor"
  level     Int     // 0, 1, 2
  zones     Zone[]
}

model Zone {
  id       String @id @default(cuid())
  floorId  String
  floor    Floor  @relation(fields: [floorId], references: [id])
  name     String // "Hot Desk Zone A", "Conference Alpha"
  type     String // hot_desk | dedicated | cabin | conference | lounge
  seats    Seat[]
}

model Seat {
  id          String   @id @default(cuid())
  zoneId      String
  zone        Zone     @relation(fields: [zoneId], references: [id])
  code        String   // "HD-A01", "DD-03", "C1"
  x           Float    // SVG coordinate
  y           Float
  width       Float    @default(28)
  height      Float    @default(28)
  shape       String   @default("circle") // circle | rect
  status      String   @default("available") // available|occupied|reserved|maintenance
  memberId    String?
  member      Member?  @relation(fields: [memberId], references: [id])
  bookings    Booking[]
}

model Member {
  id            String   @id @default(cuid())
  branchId      String
  branch        Branch   @relation(fields: [branchId], references: [id])
  name          String
  email         String
  phone         String
  company       String?
  gstNumber     String?
  planType      String   // day_pass | flexi | dedicated | cabin
  monthlyFee    Decimal
  contractStart DateTime
  contractEnd   DateTime
  status        String   @default("active") // active|trial|expiring|churned
  riskScore     Float?
  seatId        String?
  seat          Seat?    @relation
  checkIns      CheckIn[]
  bookings      Booking[]
  invoices      Invoice[]
  tickets       Ticket[]
  notes         MemberNote[]
  createdAt     DateTime @default(now())
}

model Visitor {
  id          String   @id @default(cuid())
  branchId    String
  branch      Branch   @relation(fields: [branchId], references: [id])
  name        String
  phone       String
  purpose     String
  hostName    String?
  hostMemberId String?
  photoUrl    String?
  qrCode      String   @unique @default(cuid())
  checkInAt   DateTime @default(now())
  checkOutAt  DateTime?
}

model CheckIn {
  id        String   @id @default(cuid())
  memberId  String
  member    Member   @relation(fields: [memberId], references: [id])
  checkedAt DateTime @default(now())
  checkedOut DateTime?
}

model Booking {
  id        String   @id @default(cuid())
  seatId    String
  seat      Seat     @relation(fields: [seatId], references: [id])
  memberId  String?
  member    Member?  @relation(fields: [memberId], references: [id])
  guestName String?  // for non-member bookings
  purpose   String?
  startTime DateTime
  endTime   DateTime
  status    String   @default("confirmed") // confirmed|completed|cancelled
  createdAt DateTime @default(now())
}

model Lead {
  id        String   @id @default(cuid())
  branchId  String
  branch    Branch   @relation(fields: [branchId], references: [id])
  name      String
  company   String?
  email     String?
  phone     String
  planType  String   // interested plan
  source    String   // website|referral|walk_in|google|event
  stage     String   @default("new") // new|toured|proposal|negotiating|won|lost
  mrr       Decimal? // potential MRR
  assignedTo String?
  lossReason String?
  notes     String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Invoice {
  id          String   @id @default(cuid())
  memberId    String
  member      Member   @relation(fields: [memberId], references: [id])
  invoiceNum  String   // "INV-2026-089"
  amount      Decimal
  period      String   // "May 2026"
  issueDate   DateTime
  dueDate     DateTime
  paidAt      DateTime?
  status      String   @default("pending") // pending|paid|overdue|refunded
  razorpayId  String?
}

model Ticket {
  id          String   @id @default(cuid())
  memberId    String
  member      Member   @relation(fields: [memberId], references: [id])
  title       String
  category    String   // wifi|hvac|billing|facilities|other
  priority    String   // low|medium|high|urgent
  status      String   @default("open") // open|in_progress|resolved|closed
  createdAt   DateTime @default(now())
}

model MemberNote {
  id        String   @id @default(cuid())
  memberId  String
  member    Member   @relation(fields: [memberId], references: [id])
  author    String
  content   String
  createdAt DateTime @default(now())
}
```

---

## Key Technical Decisions

### 1. Static Seed Data (no DB needed for MVP)
For the hackathon, import all data from `lib/data/seed.ts` — a TypeScript
object with typed arrays for branches, members, leads, visitors, bookings.
No DB calls in components; components read from this object directly.

This means: zero setup time, instant page loads, no env var issues during demo.
Supabase Realtime only used for the floor map's live seat demo.

### 2. Role System (localStorage for demo)
```ts
// lib/useRole.ts
type Role = 'owner' | 'manager' | 'finance'

// Owner: sees everything
// Manager: sees only their branch, no billing
// Finance: sees billing + members (read-only), no leads/bookings
```
Store in localStorage on login. Sidebar and pages read role to show/hide nav items.

### 3. Floor Map Architecture
```
FloorMap.tsx
  ↓ reads seats from seed data (or Supabase realtime)
  ↓ renders <SeatCircle /> for each seat
  ↓ wrapped in <TransformWrapper> from react-zoom-pan-pinch

SeatCircle.tsx
  ↓ SVG <circle> or <rect>
  ↓ fill = statusToColor(seat.status)
  ↓ onClick → setSSelectedSeat(seat) → opens SeatDetailPanel

SeatDetailPanel.tsx
  ↓ slides in from right (framer-motion)
  ↓ shows member details or booking form
  ↓ on confirm: optimistic update → seat color changes instantly
```

Realtime (bonus, add if time allows):
```ts
// Subscribe to seat changes in Supabase
supabase
  .channel('seats')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'seats' },
    (payload) => updateSeatInState(payload.new))
  .subscribe()
```

### 4. Risk Score Algorithm
```ts
// lib/risk-score.ts
export function calculateRiskScore(member: Member): number {
  let score = 0

  const daysSinceLastVisit = getDaysSinceLastVisit(member)
  const daysToContractEnd = getDaysToContractEnd(member)
  const openTickets = member.tickets.filter(t => t.status === 'open').length
  const visitTrend = getVisitTrend(member) // 'declining' | 'stable' | 'increasing'
  const hasPaymentDelay = member.invoices.some(i => i.status === 'overdue')

  if (daysSinceLastVisit > 20) score += 30
  else if (daysSinceLastVisit > 10) score += 15

  if (daysToContractEnd < 14) score += 30
  else if (daysToContractEnd < 30) score += 20
  else if (daysToContractEnd < 60) score += 10

  if (openTickets >= 2) score += 20
  else if (openTickets === 1) score += 10

  if (visitTrend === 'declining') score += 15

  if (hasPaymentDelay) score += 10

  return Math.min(score, 100)
}
```

### 5. Claude API Call (retention email)
```ts
// app/api/ai/retention-email/route.ts
import Anthropic from '@anthropic-ai/sdk'

export async function POST(req: Request) {
  const { member } = await req.json()
  const client = new Anthropic()

  const response = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 600,
    messages: [{
      role: 'user',
      content: `Write a warm, personal retention email for a coworking space member.

Member details:
- Name: ${member.name}
- Company: ${member.company}
- Member since: ${member.memberSince} (${member.monthsAsMember} months)
- Plan: ${member.plan} at ₹${member.monthlyFee}/month
- Last visit: ${member.daysSinceLastVisit} days ago (used to visit ${member.avgVisitsPerMonth}x/month)
- Open support tickets: ${member.openTickets}
- Contract ends: ${member.daysToContractEnd} days from now

Write as: Abhijeet (Founder, CS Coworking Spaces)
Tone: warm, personal, not salesy. Reference the specific detail about low visits subtly.
Offer: free 3-hour conference room credit this week.
Include: community lunch invitation this Friday at Gachibowli branch.
Length: 5–7 sentences. No subject line in the body.
Return only the email body text, no extra formatting.`
    }]
  })

  const emailBody = response.content[0].type === 'text'
    ? response.content[0].text : ''

  const subject = `We miss you, ${member.name.split(' ')[0]} — let's catch up at CS Coworking`

  return Response.json({ subject, body: emailBody })
}
```

### 6. Multi-tenancy Approach (Hackathon version)
No actual DB-level RLS for now. Role + branch filtering done client-side:
```ts
// useBranch.ts
const { activeBranch } = useBranchStore()
const members = allMembers.filter(m => 
  activeBranch === 'all' || m.branchId === activeBranch
)
```

---

## Environment Variables
```env
# .env.local
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
ANTHROPIC_API_KEY=              ← server-side only, never expose
```

---

## Performance Notes
- All seed data in memory — zero latency
- SVG floor map: max 50 seats per floor (fine for demo)
- Charts: use `ResponsiveContainer` from Recharts
- Images: next/image for any photos
- Fonts: `next/font/google` for Plus Jakarta Sans + Inter
