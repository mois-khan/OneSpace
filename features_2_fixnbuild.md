# OneSpace: Features to Fix & Build Roadmap

This document outlines the complete roadmap for taking the OneSpace prototype to a fully functional, production-ready SaaS platform. You can share this document with Claude to systematically build out these features.

---

## 1. Universal UI & Navigation Completeness
*Goal: Ensure every button, dropdown, and input in the layout is fully functional and interactive.*

### Top Navigation Bar
- **Global Search Bar**: Implement a global search feature (using a modal dialog, e.g., `cmdk`) that allows users to quickly search across Members, Leads, and Rooms.
- **Notifications Dropdown**: Make the bell icon functional. It should open a popover showing recent alerts (e.g., "Meeting room double-booked", "Visitor arrived", "Invoice overdue").
- **Profile Dropdown**: Make the user avatar functional. It should open a menu with "Account Settings", "Organization Settings", and "Log Out".

### Universal Actions
- Ensure all tables have working pagination, column sorting, and filtering.
- Ensure all "Export" buttons generate a CSV download.
- Ensure all "Add / Create" buttons open a functional slide-over panel or modal with a form.

---

## 2. Multi-Branch Architecture & Dedicated Dashboards
*Goal: Allow Org Admins to see global data, but easily filter down to view dedicated dashboards for specific branches.*

### Branch Selector Context
- **Global State**: Implement a `BranchContext` (using React Context or Zustand) to store the currently selected branch (e.g., `All Branches`, `Branch A`, `Branch B`).
- **Selector UI**: Add a dropdown in the TopBar or Sidebar allowing the Admin to switch contexts.

### Dynamic Dashboards
- **Dashboard Component**: The main dashboard charts (Revenue, Occupancy, Leads pipeline) must dynamically re-fetch or filter their data whenever the `BranchContext` changes.
- **Data Consistency**: Ensure that if "Branch A" is selected, navigating to `/members` or `/leads` automatically filters the tables to only show data for Branch A.

---

## 3. Module-Specific Functionality
*Goal: Make every page a fully functional CRUD (Create, Read, Update, Delete) interface.*

- **Members Page**: 
  - Add functional "Edit Member" modal.
  - Make the "Status" badge toggleable (Active/Inactive).
- **Leads Page (Kanban)**:
  - Add a "New Lead" modal.
  - Implement Lead detail view (opening a side-panel when clicking a lead card).
- **Visitors Page**:
  - Add a "Check-in Visitor" form with QR code generation placeholder.
  - Add a "Check-out" action button on the active visitor rows.
- **Renewals/Billing**:
  - Create the UI for upcoming renewals.
  - Add functionality to manually send invoice reminders.
- **Bookings Page**:
  - Connect the Calendar UI to a functional "Book Room" modal that checks for time conflicts.

---

## 4. Real Authentication & Onboarding
*Goal: Implement secure Login, Signup, and Organization onboarding.*

- **Auth Provider Integration**: Re-integrate Supabase Auth (or NextAuth).
- **Login/Signup Pages**: 
  - Build functional screens for Login, Signup, and Forgot Password.
- **Onboarding Flow**: 
  - Wire up the new `/onboarding` 3-step wizard to the database so that submitting it actually creates the `Organization`, `Branches`, and sets the user's role to `ORG_ADMIN`.

---

## 5. The AI Layer (RBAC-Aware Chatbot)
*Goal: Implement a natural language AI assistant that admins/managers can talk to for insights.*

### AI Architecture
- **Tech Stack**: Use Vercel AI SDK + OpenAI (or Anthropic) APIs.
- **UI Element**: Add a floating chat widget (or a dedicated `/ai` page) called "SpaceGenie".

### Functionalities & Tool Calling
- **Text-to-SQL / API Tools**: Give the AI the ability to execute database queries or call API endpoints based on the user's prompt.
  - *Example 1:* "How many Flexi slots are left in Madhapur?" -> AI queries the assets table and responds.
  - *Example 2:* "Which users have overdue invoices?" -> AI queries the invoices table and lists them.
  
### Role-Based Access Control (RBAC) in AI
- The AI must be injected with the user's current role and `branch_id`.
- **Constraint**: If a Branch Manager asks "Show me all revenue", the AI must restrict its query to ONLY return revenue for that specific manager's branch. An Org Admin asking the same question gets global revenue.
