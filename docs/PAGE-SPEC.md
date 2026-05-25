# OneSpace — Page Specifications

---

## Route Map
```
/                  → redirect to /dashboard
/login             → Login (role picker)
/dashboard         → Multi-branch overview
/floor-map         → Live seat map [WOW]
/visitors          → Visitor check-in/out
/members           → Member list + onboarding
/members/[id]      → Member profile + AI email
/renewals          → Churn risk dashboard
/bookings          → Room booking calendar
/leads             → Lead Kanban pipeline
```

---

## Page 1: Login `/login`

**Goal:** Fast entry, demo role switching, brand recognition.

### Layout
Full screen. Hero gradient background (dark navy → crimson red, matches CS site).
Center-aligned card, 420px wide.

### Card contents (top to bottom)
```
1. CS logo mark (red) + "OneSpace" wordmark — 32px centered
2. Tagline: "Operations platform for CS Coworking" — gray, 14px
3. Divider line
4. Email input (pre-filled: admin@cscoworking.in)
5. Password input (pre-filled, dots)
6. [Login →] — full-width red button
7. Divider: "or demo as"
8. Three role cards in a row:
   [👑 Owner]     Abhijeet · all branches
   [🏢 Manager]   Gachibowli branch
   [💰 Finance]   Billing only
   Click → fills credentials + logs in instantly
9. Footer: "CS Coworking Spaces © 2026"
```

### Behavior
- Role card click → 300ms spinner → redirect to /dashboard
- Owner role → sees all 6 branches
- Manager → sees only Gachibowli, no billing tab
- Finance → sees only billing, members read-only

---

## Page 2: Dashboard `/dashboard`

**Goal:** Monday morning pulse. 4 KPIs, branch table, alerts, 2 charts.

### Layout
```
Row 1: 4 KPI stat cards (equal width, 25% each)
Row 2: Branch table (65%) | Alerts feed (35%)  
Row 3: Occupancy trend chart (60%) | Revenue by branch chart (40%)
```

### KPI Cards (top row)
```
Card 1 — Total Occupancy
  Value: 76%
  Sub: "Across 6 branches today"
  Trend: +3% vs last week ↑ green
  Icon: TrendingUp, red

Card 2 — Monthly Revenue  
  Value: ₹6,84,200
  Sub: "Collected this month"
  Trend: -₹12,000 from target ↓ amber
  Icon: IndianRupee, red

Card 3 — At-Risk Revenue
  Value: ₹1,08,500
  Sub: "5 members at high churn risk"
  CTA: "View renewals →" red link
  Icon: AlertTriangle, red

Card 4 — Active Members
  Value: 1,500+
  Sub: "18 contracts due in 30 days"
  Trend: +6 this month ↑ green
  Icon: Users, red
```

### Branch Table (left panel)
```
Header: "Branch Overview" + branch count badge
Columns: Branch | Occupancy | Members | MRR | Overdue | Health

Data rows:
  Hitech City    | 82% ████████░ | 48 | ₹2,12,400 | 0 | 🟢 Healthy
  Gachibowli     | 78% ███████░░ | 41 | ₹1,84,800 | 1 | 🟡 Watch
  Raidurg        | 85% █████████ | 36 | ₹1,62,000 | 0 | 🟢 Healthy
  Kondapur       | 71% ███████░░ | 32 | ₹1,44,000 | 0 | 🟢 Healthy
  Shaikpet-I     | 68% ██████░░░ | 28 | ₹1,26,000 | 2 | 🔴 Action
  Shaikpet-II    | 61% ██████░░░ | 24 | ₹1,08,000 | 1 | 🟡 Watch

Occupancy: inline mini bar (red fill, 80px wide, 6px height)
Health: colored pill badge
Row click → navigates to /floor-map?branch=[id]
```

### Alerts Feed (right panel)
```
Header: "Live Alerts" + pulsing green dot (LIVE)
Max 6 items, scrollable

Items:
  🔴 Ravi Kumar contract ends in 5 days — no renewal (2h ago) [Gachibowli]
  🟡 Room A double-booking attempt prevented (4h ago) [Hitech City]
  🔴 Invoice ₹14,000 overdue 18 days — TechNest Solutions (Today) [Raidurg]
  🟢 New member: Priya Mehta onboarded, Dedicated Desk (Today) [Gachibowli]
  🟡 Meghana Rao — 20 days since last visit (1d ago) [Hitech City]
  🔴 Shaikpet-I occupancy below 60% threshold (2d ago)

Each item: colored left border (3px) + icon + text + branch tag + time
```

### Charts Row (bottom)
```
Chart 1 — Occupancy trend (line, last 30 days)
  All 6 branches as separate lines
  X: dates, Y: 0–100%
  Tooltip on hover showing per-branch value
  Legend below chart

Chart 2 — Revenue by branch (horizontal bar)
  One bar per branch, sorted descending
  Red bars, value labels at end
  ₹ formatted
```

---

## Page 3: Floor Map `/floor-map` ⭐ WOW FEATURE

**Goal:** Live SVG seat map with real-time booking. The demo centrepiece.

### Layout
```
Top bar: Branch pills | Floor tabs | View toggle | Heatmap toggle | LIVE badge
Body: SVG map (fills remaining space, zoomable) + collapsible side panel
Right sidebar (200px): occupancy stats + quick legend
```

### Top Controls
```
Branch selector (pill tabs):
  Hitech City | Gachibowli [active] | Raidurg | Kondapur | Shaikpet-I | Shaikpet-II

Floor tabs (below branch row):
  Ground Floor [active] | 1st Floor | 2nd Floor

Right side of top bar:
  [🗺 Map] [≡ List] toggle buttons
  [Heatmap] toggle switch
  🟢 LIVE badge (pulsing)
```

### SVG Floor Map — Gachibowli Layout
```
Dimensions: viewBox="0 0 900 600"
Background: #F8F9FA with 20px grid lines (#E5E7EB, 0.5px)

Physical layout:
  ┌─────────────────────────────────────────────┐
  │  [Reception desk - rect, labeled]           │
  │                                             │
  │  [Zone A — Hot Desks 3×4 = 12 seats]       │
  │  [HD-A01..HD-A12 circles]                   │
  │                              [Conf Alpha]   │
  │  [Zone B — Hot Desks 2×5 = 10 seats]       │
  │  [HD-B01..HD-B10 circles]    [8-seater]    │
  │                                             │
  │  [Dedicated Desks 2×4 = 8 seats]           │
  │  [DD-01..DD-08 rounded rects]               │
  │                              [Conf Beta]    │
  │  [C1] [C2] [C3] [C4]        [4-seater]    │
  │  Private Cabins                             │
  │                                             │
  │  [Kitchen/Lounge]  [WC]   [Entrance →]     │
  └─────────────────────────────────────────────┘

Zones labeled with a light background rect + zone name text
Walls: 2px dark lines
Doors: gap in wall lines
```

### Seat Rendering
```
Hot desk (circle, r=14):
  Available:    fill #DCFCE7, stroke #16A34A, 2px
  Occupied:     fill #FEE2E2, stroke #DC2626, 2px
  Reserved:     fill #FEF3C7, stroke #D97706, 2px
  Maintenance:  fill #F3F4F6, stroke #9CA3AF, 1px
  Selected:     fill #E8192C, stroke #C0141F, white label

Dedicated desk (rounded rect, 28×22):
  Same color states as above

Conference room (large rect, labeled):
  Available: #DCFCE7 fill
  Booked:    #FEE2E2 fill with booking label inside

Cabin (rect, 40×50):
  Same color states

Seat label inside shape:
  font-size: 9px, weight 600
  e.g., "A01", "DD3", "C1"
```

### Interactions
```
Hover → tooltip (floating):
  "[Seat code] · [Status]"
  If occupied: "+ [Member name]"
  If reserved: "+ Reserved until [time]"

Click available seat → side panel opens (slide from right, 280px)
Click occupied seat → side panel shows member details
```

### Side Panel — Available Seat
```
Header: "HD-A07" in mono font + status badge (green "Available")
Type: Hot Desk · Zone A · Ground Floor

[Book this seat] section:
  Member: searchable dropdown
  Date: date picker (today default)
  Duration: [Half Day] [Full Day] [Custom] pill toggle
  [Confirm Booking] → red button, full width

On confirm:
  Seat color animates → red (400ms)
  Toast: "HD-A07 booked for [name]"
  Panel updates to "Occupied" view
```

### Side Panel — Occupied Seat
```
Member avatar (48px initials circle, red bg)
Name: bold, 16px
Company: muted, 14px
Plan badge + Branch badge

Details:
  Seat: DD-03
  Check-in: Today, 9:14 AM
  Contract: ends Aug 31, 2026
  Monthly: ₹12,000

Risk bar: [████░░░░] 42 — medium

[View Profile →] red link
[Check Out] ghost button
```

### Side Panel — Conference Room
```
"Conference Alpha" header
Capacity: 8 seats
Status: Booked / Available

Today's schedule (timeline):
  9:00–10:00  Client Call — Priya Mehta         [purple]
  11:00–13:00 Board Meeting — TechNest          [blue]
  14:00–      Available
  15:00–16:30 NimbleCloud Pitch                 [teal]

[Book a slot] → red button → opens time picker
```

### Right Stats Sidebar
```
"Gachibowli · Ground Floor"

Counts (animate on load):
  ● 26 Occupied  (red dot)
  ● 6  Available (green dot)
  ● 2  Reserved  (amber dot)
  ─────────────
  34 total seats

Mini occupancy ring (SVG, 80px, red fill)
"76% occupied"

Today's check-ins:
  Avatar stack (5 visible + "+21 more")
  "26 members checked in"

Rooms status:
  Alpha: 🔴 Busy till 3 PM
  Beta:  🟢 Available [Book]
```

### Heatmap Mode (toggle)
```
When on:
  Seat colors become intensity-based (30-day occupancy):
  0–30%:  fill #EFF6FF (cold blue)
  31–60%: fill #FEF3C7 (warm amber)
  61–80%: fill #FED7AA (orange)
  81–100%: fill #E8192C (hot red)
  
Transition: all seat fills morph in 500ms
Legend bar shows in bottom-left: Cold → Hot
```

---

## Page 4: Visitors `/visitors`

**Goal:** Replace WhatsApp visitor logs. Real-time front desk view.

### Layout
```
Top: 4 stat cards (full width)
Body: Visitor table (65%) | Check-in panel (35%)
```

### Stat Cards
```
Today's Visitors: 18
Currently Inside: 11  
Checked Out: 7
Overstaying (>8h): 1 [red badge]
```

### Visitor Table
```
Columns: # | Photo | Name | Phone | Purpose | Host | Check-in | Duration | Status | Action

Rows (12 sample, Gachibowli):
  Rakesh Sharma   | 📷 | +91 98765 43210 | Client meeting | Priya Mehta  | 9:30  | 2h 14m | Inside   | [Out]
  Divya Nair      | 📷 | +91 87654 32109 | Interview      | Arun Kumar   | 10:15 | 1h 29m | Inside   | [Out]
  Faisal Ahmed    | 📷 | +91 76543 21098 | Site visit     | (Walk-in)    | 11:00 | 44m    | Inside   | [Out]
  Sneha Reddy     | 📷 | +91 65432 10987 | Demo           | Vikram Rao   | 8:45  | —      | Left     | —
  Arvind Patil    | 📷 | +91 54321 09876 | Delivery       | Reception    | 7:50  | —      | Left     | —

Status:
  Inside:     green pill + duration counter (live)
  Left:       gray pill
  Overstaying: amber pill + "⚠ 8h+" badge

Photo: 32px circle, initials fallback
"Check out" button: small ghost button, turns red on confirm
```

### Check-in Panel (right)
```
Header: "Check In Visitor"

Form:
  Full Name *
  Mobile Number * (+91 prefix built in)
  Purpose: [Client Meeting ▾] dropdown
    Client Meeting | Interview | Demo | Delivery | Personal | Other
  Host Member: [Search member...] searchable
  [📷 Take Photo] button → opens webcam modal

[Check In] → red button, full width

After submit:
  QR code appears (128×128px, border, shadow)
  "Share via WhatsApp" link below QR
  Row animates into table (slide down)

---

QR Scan section (below form):
  Dashed border box, 200×120px
  Camera icon + "Scan to check out"
  (demo: pre-generated QR triggers check-out animation)
```

---

## Page 5: Members `/members`

**Goal:** All 1500+ members, filterable, with one-click onboarding.

### Layout
```
Top: Filter bar (full width)
Sub-header: result count + view toggle
Body: Card grid (3 col) or Table (toggle)
```

### Filter Bar
```
Branch:   [All ▾] [Hitech City] [Gachibowli] [Raidurg] [Kondapur] [Shaikpet-I] [Shaikpet-II]
Plan:     [All ▾] [Day Pass] [Flexi Desk] [Dedicated] [Cabin]
Status:   [All ▾] [Active] [Trial] [Expiring <30d] [Churned]
Search:   🔍 Search name, company, email...

Right: [+ Onboard Member] red button | [⊞ Grid] [≡ Table] toggle
```

### Member Card (grid view, 3 columns)
```
Card (white, border, 10px radius, hover: red top border):
  Top row:
    Avatar (48px, colored initials) + Risk badge (top-right corner)
    e.g., "PM" in red circle + "72 ⚠" amber badge
  
  Name: "Priya Mehta" — 15px, 600 weight
  Company: "NimbleCloud Pvt. Ltd." — 13px, gray
  
  Tags row: [Gachibowli] [Dedicated Desk]  (pills, gray bg)
  
  Metrics:
    📅 Mar 2025 – Aug 2026
    💰 ₹12,000/month
    🪑 DD-03
  
  Risk bar: thin progress bar (0–100, color-coded)
  
  Footer (border-top):
    [View] [Renew] [Message] — ghost buttons, 13px
```

### Member Table (list view)
```
Columns: Member | Branch | Plan | MRR | Contract End | Risk | Status | ···

Sortable: MRR, Contract End, Risk (click header)
Risk column: colored pill (number + badge)
Status: Active/Trial/Expiring/Churned pills
··· menu: View Profile | Edit | Send Reminder | Terminate

Pagination: 25 per page, prev/next + page numbers
```

### Onboarding Wizard (modal, 4 steps)
```
Step bar: [1 Details] ──── [2 Plan & Seat] ──── [3 Docs] ──── [4 Payment]

Step 1 — Personal Details:
  Full Name | Email | Phone
  Company Name | GST Number (optional)
  [Next →]

Step 2 — Plan & Seat:
  Plan type cards (tap to select):
    [Day Pass] [Flexi Desk] [Dedicated Desk] [Private Cabin]
  Monthly fee: auto-filled, editable
  Start date | End date
  Seat: [Assign from floor map] button → opens mini floor map modal
  [Next →]

Step 3 — Documents:
  [Upload ID (Aadhaar/PAN)] dropzone
  Agreement: [Preview PDF] stub
  [Send agreement via WhatsApp] button → toast
  [Next →]

Step 4 — Payment:
  Invoice preview card (auto-generated)
  [Send Razorpay Link via WhatsApp] → red button → toast "Link sent!"
  [Mark as Cash Payment] → ghost button
  [Activate Member] → green button → confetti + redirect to profile
```

---

## Page 6: Member Profile `/members/[id]`

**Goal:** Full 360° view. The AI retention email demo.

### Layout
```
Left column (320px, sticky): Identity + risk card
Right column: Tabs — Overview | Bookings | Invoices | Tickets | Notes
```

### Left Identity Card
```
Large avatar (72px, red bg initials)
Name: 20px, 700
Company: 15px, gray

Branch + Plan badges (row)

── Risk Score ──────────────────
SVG gauge (100px): arc, colored 0-100
Center: "82" in 22px bold
Below: "High churn risk" in red, 13px

Risk factors list:
  ⚠ Last visit 22 days ago (avg: 16/month)
  ⚠ 2 open support tickets
  ⚠ Contract ends in 18 days
  ✓ No payment delays
  ✓ 14 months as member (loyalty+)

── Actions ─────────────────────
[✨ Draft AI Retention Email]    ← red, full width, star icon
[📅 Send Renewal Reminder]       ← outline
[📞 Schedule Call]               ← outline
[✓ Mark as Renewed]              ← green outline

── Quick Stats ─────────────────
MRR:          ₹12,000
Total paid:   ₹1,68,000
Member since: Mar 2025
Total visits: 218
Avg/month:    15.6
Seat:         DD-03, Gachibowli
```

### Right Tabs

**Overview tab:**
```
Visit frequency chart (bar, last 6 months):
  Bars show declining trend if at-risk member
  Red bars matching brand

Recent activity (list):
  Last check-in: Today 9:14 AM
  Last booking: May 20 — Conf Alpha, 2h
  Last invoice: May 1 — ₹12,000 — Paid
```

**Bookings tab:**
```
Table: Date | Room/Seat | Duration | Status
Paginated, filter by date range
```

**Invoices tab:**
```
Table: Invoice # | Period | Amount | Due | Status | Action
[Download PDF] per row (stub)
Overdue rows: red tint
```

**Tickets tab:**
```
Table: # | Category | Title | Priority | Status | Opened
Category pills: WiFi | HVAC | Billing | Other
```

**Notes tab:**
```
Timeline of internal notes (newest first)
Each note: avatar + name + date + note text
[+ Add Note] button at top → inline text area
```

### AI Email Modal
```
Trigger: [Draft AI Retention Email] button

Loading state (1.5s):
  Spinner + "OneSpace AI is personalising a message for Ravi Kumar..."

Result modal (560px):
  Header: "AI Retention Email" + [Regenerate ↺] button
  
  Subject: (editable input, pre-filled)
    "We value you, Ravi — let's talk about your space at CS Coworking"
  
  Body: (editable textarea, ~8 lines)
    Warm personal email mentioning:
    - Name and company
    - Length of membership
    - Subtle note about recent low visits (not accusatory)
    - Offer: free conference room credit
    - Invitation: community lunch Friday
    - Contact person name
  
  Actions:
    [Send via WhatsApp 💬] ← red, opens wa.me link
    [Send via Email 📧]    ← outline (toast: "Email sent!")
    [📋 Copy]              ← ghost
    
  Tone badge: "✨ Warm & Personal" (green pill, bottom)
```

---

## Page 7: Renewals `/renewals`

**Goal:** Proactive revenue protection. At-risk members surfaced clearly.

### Layout
```
Top: 3 risk KPI cards
Sub: Filter tabs (risk level / expiry window)
Body: Risk table (full width)
```

### KPI Cards (3 columns)
```
High Risk (70+):    5 members  | ₹74,000 MRR at stake  | [Act Now] red CTA
Medium Risk (40-70): 11 members | ₹1,64,000 at stake
Expiring <30 days:  18 members | ₹2,52,000 at stake
```

### Filter Tabs
```
[All At-Risk] [High 70+] [Expiring 7d] [Expiring 30d] [Expiring 90d]
```

### Risk Table
```
Columns: Member | Branch | Plan | MRR | Contract End | Risk | Factors | Actions

Pre-seeded, sorted by risk score desc:
  Ravi Kumar    | Gachibowli | Dedicated  | ₹12,000 | 5d   | 88 🔴 | visits↓ open-ticket | [Renew] [Email]
  Meghana Rao   | Hitech     | Cabin      | ₹22,000 | 14d  | 76 🔴 | 18d no visit        | [Renew] [Email]  
  Aditya Singh  | Kondapur   | Dedicated  | ₹15,000 | 21d  | 71 🔴 | contract soon       | [Renew] [Email]
  Pooja Iyer    | Gachibowli | Flexi Desk | ₹7,999  | 28d  | 64 🟡 | visits declining    | [Renew] [Email]
  Sai Teja      | Shaikpet-I | Dedicated  | ₹12,000 | 32d  | 58 🟡 | —                   | [Renew] [Email]
  Keerthi Nair  | Raidurg    | Cabin      | ₹18,000 | 45d  | 51 🟡 | slow pay history    | [Renew] [Email]
  ... 12 more rows

Risk badge: pill — green/amber/red fill with number
Factors: small chip tags (max 2 visible, "+1 more" if overflow)
[Renew]: red button → opens renewal modal
[Email]: outline → triggers AI email modal (same as profile page)

Row checkbox → bulk selection
[Send reminders to X selected] bulk action button (appears when items checked)
```

---

## Page 8: Bookings `/bookings`

**Goal:** Prevent double-bookings. Visual day/week calendar.

### Layout
```
Top: Branch + Room selector | Date nav
Body: Day-view calendar grid (full width)
Right panel (280px, fixed): Quick book form
```

### Room Selector (Gachibowli)
```
Tabs (pill style):
  [Conference Alpha (8)] [Conference Beta (4)] [Phone Booth 1] [Phone Booth 2]
  
Each tab: name + capacity + green/red dot (available/busy)
```

### Day-view Calendar
```
Time column: 7 AM – 10 PM, 30-min rows (8px height per row)
Header: Today's date + day nav [< >]

Booking blocks (color fills the slot):
  9:00–10:00   Client Call — Priya Mehta           #8B5CF6 (purple)
  11:00–13:00  Board Meeting — TechNest Solutions   #2563EB (blue)
  15:00–16:30  NimbleCloud Team Sync                #0891B2 (teal)

Empty slot styling: hover → light red tint + "+" cursor
Click empty slot → populates quick book panel time fields

Block on hover: tooltip with booker, purpose, duration
Click block → shows detail: [View Member] [Cancel Booking]

"Now" indicator: red horizontal line at current time
```

### Quick Book Panel (right)
```
Header: "Book Conference Alpha"

Form:
  Date: [Today, May 25 ▾]
  Start: [3:00 PM ▾]
  End:   [4:00 PM ▾]    (auto: start + 1h)
  Booked by: [Search member or visitor...]
  Purpose: [text input]

Conflict warning (if overlap):
  🔴 "Booked 11AM–1PM by TechNest — choose another time"
  "Beta room is free — switch?" [Yes, switch] link

[Confirm Booking] → red button
→ Block appears in calendar immediately (optimistic)
→ Toast: "Conference Alpha booked for 3–4 PM"
```

### Date Nav
```
[ < ] Mon 25 May 2026 [ > ]   [Today]  [Week view] toggle (stub)
```

---

## Page 9: Leads `/leads`

**Goal:** CRM pipeline. Convert enquiries to members. Close the CRM-ERP loop.

### Layout
```
Top: Lead stats (inline numbers) + [+ Add Lead] button
Body: Kanban board (horizontal scroll)
```

### Lead Stats Bar
```
New: 9  |  Toured: 6  |  Proposal: 5  |  Negotiating: 4  |  Won (May): 7  |  Lost: 3
```

### Kanban Board
```
6 columns, horizontal scroll on overflow
Each column: 240px wide, min-height: fills viewport

Column header:
  [Stage name]  [count badge]
  [total value in column, small gray text]
  Won column: gold/red header color

Lead card (white, border, 10px radius, draggable):
  ┌──────────────────────────────┐
  │ Sahil Gupta                  │
  │ EdTech Solutions             │
  │                              │
  │ [Cabin] [Website] source     │
  │ ₹22,000/month potential      │
  │                              │
  │ 👤 Assigned: Arun            │
  │ 🕐 3 days in stage           │  ← red if >7d
  └──────────────────────────────┘

Hover: shadow lift + ··· menu icon appears
··· menu: Edit | Assign | Schedule Tour | Delete

Won column cards show extra:
  [→ Convert to Member] button — red, full width below card
  Click → opens Onboarding Wizard (Page 5)
```

### Seed Leads (25 total)
```
NEW (9):
  Sahil Gupta     | EdTech Solutions  | Cabin    | ₹22,000 | Website  | 1d
  Ritika Jain     | Freelance Design  | Flexi    | ₹7,999  | Google   | 2d
  Karan Mehta     | MarketPro Agency  | Dedicated| ₹12,000 | Referral | 3d
  + 6 more

TOURED (6):
  Anjali Verma    | LegalEase Pvt Ltd | Dedicated| ₹15,000 | Walk-in  | 2d
  + 5 more

PROPOSAL SENT (5): with quoted amounts

NEGOTIATING (4): Srinivas, Deepika, Rohit, Fatima
  Srinivas Rao   | CloudBase Tech    | Cabin    | ₹25,000 | Referral | 6d

WON (7 — this month):
  Priya Mehta (already converted — shows converted badge)
  + 4 won, not yet onboarded → show [Convert to Member]

LOST (3): with reason tag
  "Too expensive", "Chose competitor", "No response"
```

### Add Lead (quick form — slide down on button click)
```
Row: [Name] [Company] [Phone] [Plan interest ▾] [Source ▾] [Assign ▾] [Save]
Collapses back on save → card appears in NEW column
```

---

## Global Components

### Empty States (all pages)
```
When no data: illustration (simple SVG) + title + subtitle + CTA
Example: Members page empty → person icon + "No members yet" + [Onboard First Member]
```

### Toast Notifications
```
Position: bottom-right
Auto dismiss: 4000ms
Types: success (green left border) | error (red) | info (blue)
Examples:
  ✓ "HD-A07 booked for Priya Mehta"
  ✓ "Retention email sent via WhatsApp"
  ✓ "Ravi Kumar marked as renewed"
  ✗ "Booking conflict — slot already taken"
```

### Loading States
```
KPI numbers: skeleton shimmer (gray animated bar)
Tables: 5 skeleton rows
Cards: skeleton card with shimmer
Charts: gray placeholder box with spinner
```

### Command Palette (cmd+K)
```
Opens: 300ms scale-in modal, top-center
Search across: members, leads, rooms, actions
Examples: "Book room" | "Priya Mehta" | "Renewals" | "Add visitor"
Keyboard: ↑↓ navigate, Enter select, Esc close
```
