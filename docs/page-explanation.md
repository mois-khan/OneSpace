# OneSpace: Module Breakdown & Architecture

This document serves as a comprehensive guide to what we built in the OneSpace Operations Platform, why each feature exists from a business perspective, what it specifically does, and how it was implemented technically.

---

## 1. Dashboard (`/dashboard`)
**Why we built it:** 
Founders and area managers need a 30,000-foot view of the business to track growth, identify struggling branches, and monitor financial health without digging through spreadsheets.

**What it does:** 
It displays top-level KPIs (Total MRR, Active Members, Average Occupancy), a beautiful gradient area chart showing revenue growth over the year, and a breakdown table comparing performance across different branches (Gachibowli, Jubilee Hills, etc.).

**How it works:**
- **Layout:** Uses CSS Grid (`grid-cols-1 md:grid-cols-3`) to create responsive KPI cards.
- **Charts:** Implemented using `recharts` for lightweight, responsive SVG charts. We customized the tooltips and axes to match the premium design system.
- **Data Sync:** The occupancy percentage for Gachibowli in the branch table isn't hardcoded; it dynamically imports the `generateFloorPlan` utility from the Floor Map module to calculate the *actual* seat occupancy, ensuring cross-page data consistency.

---

## 2. Floor Map (`/floor-map`)
**Why we built it:** 
Coworking spaces are spatial businesses. Community managers need to instantly see where people sit, which zones are crowded, and which desks are available for new leads.

**What it does:** 
Provides an interactive, top-down 2D map of the flagship branch. It visualizes different zones (Flexi, Dedicated, Private Cabins) and shows individual seats with color-coded availability dots (Green = Free, Red = Occupied).

**How it works:**
- **Generation:** Uses a custom programmatic algorithm (`floor-plan.ts`) to generate an array of `Seat` objects with exact `(x, y)` coordinates and dimensions, rather than using a static image.
- **Interactivity:** Wraps the grid in `framer-motion` to allow smooth panning and zooming. 
- **Rendering:** Uses absolute CSS positioning (`top`, `left`, `width`, `height`) within a relative container to draw the desks precisely on the grid.

---

## 3. Members Directory (`/members`)
**Why we built it:** 
The core CRM of the platform. Managers need a unified place to view, search, and manage their active customers.

**What it does:** 
Displays all active members in either a highly visual Card Grid or a dense Data Table. It also features a global "Onboard Member" button that launches a multi-step onboarding wizard.

**How it works:**
- **View Toggle:** Simple React state (`viewMode: 'grid' | 'table'`) conditionally renders either the `MemberGrid` or `MemberTable` component.
- **Onboarding Wizard:** A state machine utilizing a `step` variable (1 to 4) to navigate through Details, Plan & Seat, Documents, and Payment views within a single modal, simulating a frictionless sign-up process.

---

## 4. Member Profile & AI Integration (`/members/[id]`)
**Why we built it:** 
When a member complains or is at risk of churning, community managers need deep context (tickets, invoices, usage history) and tools to intervene effectively.

**What it does:** 
Shows a detailed profile for a specific member. Crucially, it includes an "AI Retention Email" tool that drafts highly personalized messages to win back at-risk members.

**How it works:**
- **Dynamic Routing:** Uses Next.js App Router dynamic segments (`app/members/[id]/page.tsx`) to grab the ID from the URL and fetch the correct member from the mock database.
- **Gemini AI Integration:** The "Generate Email" button hits a Next.js serverless API route (`/api/ai/retention-email`). This route uses the `@google/genai` SDK to prompt the Gemini model, passing in the member's specific context (e.g., "Days since last visit: 14", "Plan: Dedicated Desk") to generate a hyper-relevant, contextual email instantly.

---

## 5. Renewals & Risk (`/renewals`)
**Why we built it:** 
In coworking, retaining an existing member is far cheaper than acquiring a new one. This page acts as an early-warning radar for revenue protection.

**What it does:** 
Highlights members whose contracts are expiring within 30 days or whose usage patterns indicate they are a "flight risk." It shows exactly how much MRR (Monthly Recurring Revenue) is at stake.

**How it works:**
- **Smart Filtering:** Uses `useMemo` to filter the global members list based on `contractEnd` dates and dynamically generated `riskScore`s. 
- **Simulated Actions:** Clicking the "Renew" button opens a modal. Upon confirmation, it updates the React state to extend the member's `contractEnd` by 1 year and drops their `riskScore` to 0, immediately removing them from the risk table.

---

## 6. Leads Pipeline (`/leads`)
**Why we built it:** 
To close the loop between sales and operations. Most coworking spaces use a separate tool (like HubSpot) for sales and another for operations. This integrates them.

**What it does:** 
A full Kanban board allowing sales reps to drag-and-drop leads through stages (New → Toured → Proposal → Won). 

**How it works:**
- **Native Drag-and-Drop:** Built using lightweight HTML5 Drag-and-Drop (`onDragStart`, `onDragOver`, `onDrop`) instead of heavy third-party libraries, keeping the app lightning-fast.
- **ERP Integration:** When a lead is dropped into the "Won" column, a "Convert to Member" button appears. Clicking this directly triggers the `OnboardingWizard` component built for the Members page, proving how seamlessly the CRM talks to the Operations side.

---

## 7. Room Bookings (`/bookings`)
**Why we built it:** 
Double-booked meeting rooms are the #1 cause of member friction in coworking spaces. This provides a visual, foolproof way to manage inventory.

**What it does:** 
A day-view visual calendar showing precisely when Conference Rooms and Phone Booths are booked. It includes an optimistic Quick Book panel that detects scheduling conflicts.

**How it works:**
- **Custom Grid Rendering:** Instead of a bloated calendar library, it uses absolute positioning. Knowing the grid represents 7 AM to 10 PM, it calculates the exact `top` and `height` CSS properties for booking blocks based on the minutes elapsed since 7 AM (e.g., a 1-hour meeting is precisely 80px high).
- **Conflict Detection:** The Quick Book panel runs a continuous `useEffect` comparing the selected form times against the `startTime` and `endTime` of all existing bookings in the selected room. If they overlap, it sets a `conflict` state to true, showing a red warning and disabling the submit button.

---

## 8. Visitors (`/visitors`)
**Why we built it:** 
For security, compliance, and hospitality. Front desk staff need to rapidly log guests and notify the host members.

**What it does:** 
A live-feed of visitors currently inside the building and a fast check-in form.

**How it works:**
- **State Management:** When the form is submitted, a new visitor object is created and `unshift`ed (added to the top) of the visitors array in state, instantly updating the UI.
- **Visuals:** Uses Framer Motion's `AnimatePresence` so new rows smoothly slide into the table, and generates a mock QR code for a premium feel.
