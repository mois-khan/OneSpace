"use client";

import React, {
  createContext,
  useContext,
  useMemo,
  useReducer,
} from "react";
import type {
  ActivityEvent,
  Booking,
  CurrentUser,
  Invoice,
  Lead,
  LeadInteraction,
  LeadNote,
  Member,
  Notification,
  PreRegistration,
  Visitor,
  FloorPlan,
} from "@/types";
import {
  BRANCHES,
  CURRENT_USER,
  generateActivity,
  generateBookings,
  generateInvoices,
  generateLeads,
  generateMembers,
  generateNotifications,
  generateOccupancyTrend,
  generatePreRegistrations,
  generateRooms,
  generateVisitors,
} from "./generate";
import { generateFloorPlan } from "@/lib/data/floor-plan";
import type { AppState } from "./selectors";

export interface OnboardMemberPayload {
  name: string;
  company?: string;
  email: string;
  phone: string;
  planType: Member["planType"];
  monthlyFee: number;
  branchId: string;
  seatId: string;
  /** If set, the lead will be moved to "won" stage */
  leadId?: string;
}

type Action =
  | { type: "SET_BRANCH"; branchId: string }
  | { type: "SET_USER"; user: CurrentUser }
  | { type: "CHECK_IN_VISITOR"; payload: Omit<Visitor, "id" | "checkInAt" | "qrCode"> }
  | { type: "CHECK_OUT_VISITOR"; id: string }
  | { type: "ADD_PRE_REGISTRATION"; payload: Omit<PreRegistration, "id" | "createdAt" | "status" | "inviteCode"> & { inviteCode?: string } }
  | { type: "CANCEL_PRE_REGISTRATION"; id: string }
  | { type: "CONVERT_PRE_REGISTRATION"; id: string }
  | { type: "RENEW_MEMBER"; memberId: string; months?: number }
  | { type: "MOVE_LEAD"; leadId: string; stage: Lead["stage"] }
  | { type: "ADD_LEAD"; payload: Omit<Lead, "id" | "createdAt" | "interactions" | "notes"> }
  | { type: "CREATE_BOOKING"; payload: Omit<Booking, "id"> }
  | { type: "CANCEL_BOOKING"; id: string }
  | { type: "MARK_NOTIFICATION_READ"; id: string }
  | { type: "MARK_ALL_NOTIFICATIONS_READ" }
  | { type: "PAY_INVOICE"; id: string }
  | { type: "ONBOARD_MEMBER"; payload: OnboardMemberPayload }
  | { type: "PUSH_NOTIFICATION"; payload: Omit<Notification, "id" | "read" | "timestamp"> & { timestamp?: number } }
  | { type: "PUSH_ACTIVITY"; payload: Omit<ActivityEvent, "id" | "timestamp"> & { timestamp?: number } }
  | { type: "LOG_LEAD_INTERACTION"; leadId: string; interaction: Omit<LeadInteraction, "id" | "timestamp" | "author"> }
  | { type: "ADD_LEAD_NOTE"; leadId: string; text: string }
  | { type: "UPDATE_LEAD"; leadId: string; payload: Partial<Lead> }
  | { type: "SAVE_FLOOR_PLAN"; branchId: string; floorPlan: FloorPlan }
  | { type: "HYDRATE"; payload: AppState };

const DAY = 24 * 60 * 60 * 1000;

function buildInitialState(now: number): AppState {
  const members = generateMembers(now);
  const invoices = generateInvoices(now, members);
  // back-fill member.invoices with the full invoice objects for their own invoices
  for (const m of members) {
    m.invoices = invoices.filter((i) => i.memberId === m.id);
  }
  const leads = generateLeads(now);
  const visitors = generateVisitors(now);
  const preRegistrations = generatePreRegistrations(now);
  const rooms = generateRooms();
  const bookings = generateBookings(now);
  const notifications = generateNotifications(now, members, invoices, visitors, leads);
  const activity = generateActivity(now, members, visitors, leads, bookings, invoices);
  const occupancyTrend = generateOccupancyTrend(now);
  
  const floorPlans: Record<string, FloorPlan> = {};
  for (const b of BRANCHES) {
    floorPlans[b.id] = generateFloorPlan(b.id);
  }

  return {
    branches: BRANCHES,
    members,
    leads,
    visitors,
    preRegistrations,
    bookings,
    rooms,
    invoices,
    notifications,
    activity,
    floorPlans,
    occupancyTrend,
    selectedBranchId: "all",
    now,
    currentUser: CURRENT_USER,
  };
}

let notificationCounter = 1000;
let activityCounter = 1000;

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "HYDRATE":
      return action.payload;
    case "SAVE_FLOOR_PLAN":
      return {
        ...state,
        floorPlans: { ...state.floorPlans, [action.branchId]: action.floorPlan },
      };
    case "SET_BRANCH": {
      // Enforce branch lock at the store level — scoped roles cannot switch away
      // from their assigned branch even if a UI somehow tries.
      const scope = state.currentUser.branchScope;
      if (scope !== "all" && action.branchId !== scope) {
        return state;
      }
      return { ...state, selectedBranchId: action.branchId };
    }

    case "SET_USER": {
      // If new user is branch-scoped, also align the active branch filter.
      const nextBranch =
        action.user.branchScope !== "all"
          ? action.user.branchScope
          : state.selectedBranchId;
      return { ...state, currentUser: action.user, selectedBranchId: nextBranch };
    }

    case "CHECK_IN_VISITOR": {
      const id = `v-${Date.now()}`;
      const newVisitor: Visitor = {
        id,
        ...action.payload,
        checkInAt: new Date(state.now).toISOString(),
        qrCode: `qr-${id}`,
      };
      const activity: ActivityEvent = {
        id: `a-${activityCounter++}`,
        timestamp: state.now,
        type: "visitor_checkin" as const,
        message: `${newVisitor.name} checked in for "${newVisitor.purpose}"`,
        link: `/visitors`,
        branchId: newVisitor.branchId,
      };

      // Auto-add to leads if purpose is Enquiry/Event/Demo/Other (not Meeting/Interview/Personal/Delivery)
      const isMeeting = 
        newVisitor.purpose === "Meeting" || 
        newVisitor.purpose === "Interview" || 
        newVisitor.purpose === "Client Meeting" || 
        newVisitor.purpose === "Personal" || 
        newVisitor.purpose === "Delivery";
      let updatedLeads = state.leads;
      if (!isMeeting) {
        const cleanPhone = newVisitor.phone.trim();
        const leadExists = state.leads.some((l) => l.phone.trim() === cleanPhone);
        if (!leadExists) {
          const newLead: Lead = {
            id: `l-${Date.now()}`,
            branchId: newVisitor.branchId,
            name: newVisitor.name,
            phone: newVisitor.phone,
            planType: "Flexi",
            source: "Walk-in",
            stage: "new",
            createdAt: new Date(state.now).toISOString(),
            interactions: [],
            notes: [],
          };
          updatedLeads = [newLead, ...state.leads];
        }
      }

      return {
        ...state,
        visitors: [newVisitor, ...state.visitors],
        leads: updatedLeads,
        activity: [activity, ...state.activity].slice(0, 80),
      };
    }

    case "ADD_PRE_REGISTRATION": {
      const id = `preg-${Date.now()}`;
      // Short, human-friendly invite code
      const rnd = Math.random().toString(36).slice(2, 6).toUpperCase();
      const inviteCode = action.payload.inviteCode || `OS-${rnd}`;
      const preReg: PreRegistration = {
        id,
        inviteCode,
        status: "pending",
        createdAt: new Date(state.now).toISOString(),
        ...action.payload,
      };
      const activity: ActivityEvent = {
        id: `a-${activityCounter++}`,
        timestamp: state.now,
        type: "visitor_checkin" as const,
        message: `Pre-registered: ${preReg.visitorName} for ${preReg.hostName}`,
        link: "/visitors",
        branchId: preReg.branchId,
      };
      return {
        ...state,
        preRegistrations: [preReg, ...state.preRegistrations],
        activity: [activity, ...state.activity].slice(0, 80),
      };
    }

    case "CANCEL_PRE_REGISTRATION": {
      return {
        ...state,
        preRegistrations: state.preRegistrations.map((p) =>
          p.id === action.id ? { ...p, status: "cancelled" as const } : p,
        ),
      };
    }

    case "CONVERT_PRE_REGISTRATION": {
      const preReg = state.preRegistrations.find((p) => p.id === action.id);
      if (!preReg) return state;
      const visitorId = `v-${Date.now()}`;
      const newVisitor: Visitor = {
        id: visitorId,
        branchId: preReg.branchId,
        name: preReg.visitorName,
        phone: preReg.phone,
        purpose: preReg.purpose,
        hostName: preReg.hostName,
        qrCode: preReg.inviteCode,
        checkInAt: new Date(state.now).toISOString(),
        preRegistrationId: preReg.id,
      };
      const activity: ActivityEvent = {
        id: `a-${activityCounter++}`,
        timestamp: state.now,
        type: "visitor_checkin" as const,
        message: `${newVisitor.name} self-checked-in via invite ${preReg.inviteCode}`,
        link: "/visitors",
        branchId: newVisitor.branchId,
      };

      // Auto-add to leads if purpose is Enquiry/Event/Demo/Other (not Meeting/Interview/Personal/Delivery)
      const isMeeting = 
        preReg.purpose === "Meeting" || 
        preReg.purpose === "Interview" || 
        preReg.purpose === "Client Meeting" || 
        preReg.purpose === "Personal" || 
        preReg.purpose === "Delivery";
      let updatedLeads = state.leads;
      if (!isMeeting) {
        const cleanPhone = preReg.phone.trim();
        const leadExists = state.leads.some((l) => l.phone.trim() === cleanPhone);
        if (!leadExists) {
          const newLead: Lead = {
            id: `l-${Date.now()}`,
            branchId: preReg.branchId,
            name: preReg.visitorName,
            phone: preReg.phone,
            planType: "Flexi",
            source: "Walk-in",
            stage: "new",
            createdAt: new Date(state.now).toISOString(),
            interactions: [],
            notes: [],
          };
          updatedLeads = [newLead, ...state.leads];
        }
      }

      return {
        ...state,
        visitors: [newVisitor, ...state.visitors],
        leads: updatedLeads,
        preRegistrations: state.preRegistrations.map((p) =>
          p.id === action.id ? { ...p, status: "arrived" as const } : p,
        ),
        activity: [activity, ...state.activity].slice(0, 80),
      };
    }

    case "CHECK_OUT_VISITOR": {
      const v = state.visitors.find((x) => x.id === action.id);
      const visitors = state.visitors.map((x) =>
        x.id === action.id
          ? { ...x, checkOutAt: new Date(state.now).toISOString() }
          : x,
      );
      const activity: ActivityEvent[] = v
        ? [
            {
              id: `a-${activityCounter++}`,
              timestamp: state.now,
              type: "visitor_checkout" as const,
              message: `${v.name} checked out`,
              link: `/visitors`,
              branchId: v.branchId,
            } satisfies ActivityEvent,
            ...state.activity,
          ].slice(0, 80)
        : state.activity;
      return { ...state, visitors, activity };
    }

    case "RENEW_MEMBER": {
      const months = action.months ?? 12;
      const members = state.members.map((m) => {
        if (m.id !== action.memberId) return m;
        const newEnd = new Date(m.contractEnd);
        newEnd.setMonth(newEnd.getMonth() + months);
        return {
          ...m,
          contractEnd: newEnd.toISOString(),
          riskScore: 0,
          status: "active" as Member["status"],
        };
      });
      const renewed = state.members.find((m) => m.id === action.memberId);
      const activity: ActivityEvent[] = renewed
        ? [
            {
              id: `a-${activityCounter++}`,
              timestamp: state.now,
              type: "member_renewed" as const,
              message: `${renewed.name} renewed for ${months} months`,
              link: `/members/${renewed.id}`,
              branchId: renewed.branchId,
            } satisfies ActivityEvent,
            ...state.activity,
          ].slice(0, 80)
        : state.activity;
      // Also clear renewal notifications for this member
      const notifications = state.notifications.map((n) =>
        n.type === "renewal_due" && renewed && n.message.includes(renewed.name)
          ? { ...n, read: true }
          : n,
      );
      return { ...state, members, activity, notifications };
    }

    case "MOVE_LEAD": {
      const lead = state.leads.find((l) => l.id === action.leadId);
      const leads = state.leads.map((l) =>
        l.id === action.leadId ? { ...l, stage: action.stage } : l,
      );
      const activity: ActivityEvent[] = lead
        ? [
            {
              id: `a-${activityCounter++}`,
              timestamp: state.now,
              type: "lead_moved" as const,
              message: `Lead ${lead.name} → ${action.stage}`,
              link: `/leads`,
              branchId: lead.branchId,
            } satisfies ActivityEvent,
            ...state.activity,
          ].slice(0, 80)
        : state.activity;
      let notifications = state.notifications;
      if (lead && action.stage === "won") {
        notifications = [
          {
            id: `n-${notificationCounter++}`,
            type: "lead_won",
            severity: "success",
            message: `Lead won: ${lead.name}${lead.company ? ` (${lead.company})` : ""}`,
            branchId: lead.branchId,
            link: "/leads",
            timestamp: state.now,
            read: false,
          },
          ...notifications,
        ];
      }
      return { ...state, leads, activity, notifications };
    }

    case "ADD_LEAD": {
      const lead: Lead = {
        ...action.payload,
        id: `l-${Date.now()}`,
        createdAt: new Date(state.now).toISOString(),
        interactions: [],
        notes: [],
      };
      const activity: ActivityEvent = {
        id: `a-${activityCounter++}`,
        timestamp: state.now,
        type: "lead_added" as const,
        message: `New lead added: ${lead.name}`,
        link: `/leads`,
        branchId: lead.branchId,
      };
      return {
        ...state,
        leads: [lead, ...state.leads],
        activity: [activity, ...state.activity].slice(0, 80),
      };
    }

    case "CREATE_BOOKING": {
      const booking: Booking = {
        ...action.payload,
        id: `bk-${Date.now()}`,
      };
      const room = state.rooms.find((r) => r.id === booking.roomId);
      const activity: ActivityEvent = {
        id: `a-${activityCounter++}`,
        timestamp: state.now,
        type: "booking_created" as const,
        message: `${booking.guestName || "Booking"} — ${room?.name || booking.roomId}`,
        link: `/bookings`,
        branchId: room?.branchId,
      };
      return {
        ...state,
        bookings: [...state.bookings, booking],
        activity: [activity, ...state.activity].slice(0, 80),
      };
    }

    case "CANCEL_BOOKING":
      return {
        ...state,
        bookings: state.bookings.map((b) =>
          b.id === action.id ? { ...b, status: "cancelled" as Booking["status"] } : b,
        ),
      };

    case "MARK_NOTIFICATION_READ":
      return {
        ...state,
        notifications: state.notifications.map((n) =>
          n.id === action.id ? { ...n, read: true } : n,
        ),
      };

    case "MARK_ALL_NOTIFICATIONS_READ":
      return {
        ...state,
        notifications: state.notifications.map((n) => ({ ...n, read: true })),
      };

    case "PAY_INVOICE": {
      const invoices: Invoice[] = state.invoices.map((i) =>
        i.id === action.id
          ? {
              ...i,
              status: "paid" as Invoice["status"],
              paidAt: new Date(state.now).toISOString(),
            }
          : i,
      );
      const inv = state.invoices.find((i) => i.id === action.id);
      const activity: ActivityEvent[] = inv
        ? [
            {
              id: `a-${activityCounter++}`,
              timestamp: state.now,
              type: "invoice_paid" as const,
              message: `Invoice ${inv.id} marked paid`,
              link: `/dashboard`,
              branchId: inv.branchId,
            } satisfies ActivityEvent,
            ...state.activity,
          ].slice(0, 80)
        : state.activity;
      return { ...state, invoices, activity };
    }

    case "PUSH_NOTIFICATION":
      return {
        ...state,
        notifications: [
          {
            id: `n-${notificationCounter++}`,
            read: false,
            timestamp: action.payload.timestamp ?? state.now,
            ...action.payload,
          },
          ...state.notifications,
        ],
      };

    case "PUSH_ACTIVITY":
      return {
        ...state,
        activity: [
          {
            id: `a-${activityCounter++}`,
            timestamp: action.payload.timestamp ?? state.now,
            ...action.payload,
          },
          ...state.activity,
        ].slice(0, 80),
      };

    case "LOG_LEAD_INTERACTION": {
      const { leadId, interaction } = action;
      const lead = state.leads.find((l) => l.id === leadId);
      if (!lead) return state;

      const newInteraction: LeadInteraction = {
        id: `int-${Date.now()}`,
        timestamp: new Date(state.now).toISOString(),
        author: state.currentUser.name,
        ...interaction,
      };

      const leads = state.leads.map((l) =>
        l.id === leadId
          ? { ...l, interactions: [newInteraction, ...(l.interactions || [])] }
          : l
      );

      const activity: ActivityEvent = {
        id: `a-${activityCounter++}`,
        timestamp: state.now,
        type: "lead_moved",
        message: `${state.currentUser.name} logged a ${interaction.type} for ${lead.name}`,
        link: `/leads/${lead.id}`,
        branchId: lead.branchId,
      };

      return {
        ...state,
        leads,
        activity: [activity, ...state.activity].slice(0, 80),
      };
    }

    case "ADD_LEAD_NOTE": {
      const lead = state.leads.find((l) => l.id === action.leadId);
      if (!lead) return state;
      const newNote: LeadNote = {
        id: `note-${Date.now()}`,
        author: state.currentUser.name,
        timestamp: new Date(state.now).toISOString(),
        text: action.text,
      };
      const leads = state.leads.map((l) =>
        l.id === action.leadId ? { ...l, notes: [newNote, ...(l.notes || [])] } : l
      );
      return { ...state, leads };
    }

    case "UPDATE_LEAD": {
      const leads = state.leads.map((l) =>
        l.id === action.leadId ? { ...l, ...action.payload } : l
      );
      return { ...state, leads };
    }

    case "ONBOARD_MEMBER": {
      const p = action.payload;
      const memberId = `m-ob-${Date.now()}`;
      const contractStart = new Date(state.now).toISOString();
      const contractEndDate = new Date(state.now);
      contractEndDate.setMonth(contractEndDate.getMonth() + 12);
      const contractEnd = contractEndDate.toISOString();

      const newMember: Member = {
        id: memberId,
        branchId: p.branchId,
        name: p.name,
        email: p.email,
        phone: p.phone,
        company: p.company,
        planType: p.planType,
        monthlyFee: p.monthlyFee,
        contractStart,
        contractEnd,
        status: "active",
        seatId: p.seatId,
        riskScore: 0,
        tickets: [],
        invoices: [],
        memberSince: new Date(state.now).toLocaleDateString("en-US", { month: "short", year: "numeric" }),
        monthsAsMember: 0,
        daysSinceLastVisit: 0,
        avgVisitsPerMonth: 0,
      };

      // Create a pending invoice for the new member
      const newInvoice: Invoice = {
        id: `inv-${memberId}-0`,
        memberId,
        branchId: p.branchId,
        amount: p.monthlyFee,
        status: "pending",
        issuedAt: contractStart,
        dueAt: new Date(state.now + 7 * DAY).toISOString(),
      };

      // If converting a lead, mark it as won
      const leads = p.leadId
        ? state.leads.map((l) =>
            l.id === p.leadId ? { ...l, stage: "won" as Lead["stage"] } : l,
          )
        : state.leads;

      const convertedLead = p.leadId ? state.leads.find((l) => l.id === p.leadId) : null;

      const newActivity: ActivityEvent[] = [
        {
          id: `a-${activityCounter++}`,
          timestamp: state.now,
          type: "member_onboarded" as const,
          message: `${p.name} onboarded${p.company ? ` (${p.company})` : ""} — ${p.planType} plan`,
          link: `/members/${memberId}`,
          branchId: p.branchId,
        },
      ];

      if (convertedLead) {
        newActivity.push({
          id: `a-${activityCounter++}`,
          timestamp: state.now,
          type: "lead_moved" as const,
          message: `Lead ${convertedLead.name} → won (onboarded)`,
          link: `/leads`,
          branchId: convertedLead.branchId,
        });
      }

      const newNotifications: Notification[] = [
        {
          id: `n-${notificationCounter++}`,
          type: "member_onboarded",
          severity: "success",
          message: `New member onboarded: ${p.name}${p.company ? ` (${p.company})` : ""} — ₹${(p.monthlyFee / 1000).toFixed(0)}k/mo`,
          branchId: p.branchId,
          link: `/members/${memberId}`,
          timestamp: state.now,
          read: false,
        },
      ];

      if (convertedLead) {
        newNotifications.push({
          id: `n-${notificationCounter++}`,
          type: "lead_won",
          severity: "success",
          message: `Lead won: ${convertedLead.name}${convertedLead.company ? ` (${convertedLead.company})` : ""}`,
          branchId: convertedLead.branchId,
          link: "/leads",
          timestamp: state.now,
          read: false,
        });
      }

      return {
        ...state,
        members: [newMember, ...state.members],
        invoices: [newInvoice, ...state.invoices],
        leads,
        activity: [...newActivity, ...state.activity].slice(0, 80),
        notifications: [...newNotifications, ...state.notifications],
      };
    }

    default:
      return state;
  }
}

const StateCtx = createContext<AppState | null>(null);
const DispatchCtx = createContext<React.Dispatch<Action> | null>(null);

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const now = useMemo(() => Date.now(), []);
  const initial = useMemo(() => buildInitialState(now), [now]);
  const [state, dispatch] = useReducer(reducer, initial);
  const [isLoaded, setIsLoaded] = React.useState(false);

  React.useEffect(() => {
    const saved = localStorage.getItem("onespace_state");
    if (saved) {
      try {
        dispatch({ type: "HYDRATE", payload: JSON.parse(saved) });
      } catch (e) {
        console.error("Failed to restore state", e);
      }
    }
    setIsLoaded(true);
  }, []);

  React.useEffect(() => {
    if (isLoaded) {
      localStorage.setItem("onespace_state", JSON.stringify(state));
    }
  }, [state, isLoaded]);

  React.useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === "onespace_state" && e.newValue) {
        try {
          dispatch({ type: "HYDRATE", payload: JSON.parse(e.newValue) });
        } catch (err) {
          console.error("Failed to sync state from storage event", err);
        }
      }
    };
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  return (
    <StateCtx.Provider value={state}>
      <DispatchCtx.Provider value={dispatch}>{children}</DispatchCtx.Provider>
    </StateCtx.Provider>
  );
}

export function useAppState(): AppState {
  const s = useContext(StateCtx);
  if (!s) throw new Error("useAppState must be used within AppDataProvider");
  return s;
}

export function useAppDispatch() {
  const d = useContext(DispatchCtx);
  if (!d) throw new Error("useAppDispatch must be used within AppDataProvider");
  return d;
}

/* ───────── action hook ───────── */

export function useAppActions() {
  const dispatch = useAppDispatch();

  return useMemo(
    () => ({
      setBranch: (branchId: string) => dispatch({ type: "SET_BRANCH", branchId }),
      setUser: (user: CurrentUser) => dispatch({ type: "SET_USER", user }),
      checkInVisitor: (payload: Omit<Visitor, "id" | "checkInAt" | "qrCode">) =>
        dispatch({ type: "CHECK_IN_VISITOR", payload }),
      checkOutVisitor: (id: string) => dispatch({ type: "CHECK_OUT_VISITOR", id }),
      addPreRegistration: (
        payload: Omit<PreRegistration, "id" | "createdAt" | "status" | "inviteCode"> & { inviteCode?: string },
      ) => dispatch({ type: "ADD_PRE_REGISTRATION", payload }),
      cancelPreRegistration: (id: string) =>
        dispatch({ type: "CANCEL_PRE_REGISTRATION", id }),
      convertPreRegistration: (id: string) =>
        dispatch({ type: "CONVERT_PRE_REGISTRATION", id }),
      renewMember: (memberId: string, months = 12) =>
        dispatch({ type: "RENEW_MEMBER", memberId, months }),
      moveLead: (leadId: string, stage: Lead["stage"]) =>
        dispatch({ type: "MOVE_LEAD", leadId, stage }),
      addLead: (payload: Omit<Lead, "id" | "createdAt" | "interactions" | "notes">) =>
        dispatch({ type: "ADD_LEAD", payload }),
      createBooking: (payload: Omit<Booking, "id">) =>
        dispatch({ type: "CREATE_BOOKING", payload }),
      cancelBooking: (id: string) => dispatch({ type: "CANCEL_BOOKING", id }),
      markNotificationRead: (id: string) =>
        dispatch({ type: "MARK_NOTIFICATION_READ", id }),
      markAllNotificationsRead: () =>
        dispatch({ type: "MARK_ALL_NOTIFICATIONS_READ" }),
      payInvoice: (id: string) => dispatch({ type: "PAY_INVOICE", id }),
      onboardMember: (payload: OnboardMemberPayload) =>
        dispatch({ type: "ONBOARD_MEMBER", payload }),
      pushNotification: (
        payload: Omit<Notification, "id" | "read" | "timestamp"> & { timestamp?: number },
      ) => dispatch({ type: "PUSH_NOTIFICATION", payload }),
      logLeadInteraction: (leadId: string, interaction: Omit<LeadInteraction, "id" | "timestamp" | "author">) =>
        dispatch({ type: "LOG_LEAD_INTERACTION", leadId, interaction }),
      addLeadNote: (leadId: string, text: string) =>
        dispatch({ type: "ADD_LEAD_NOTE", leadId, text }),
      updateLead: (leadId: string, payload: Partial<Lead>) =>
        dispatch({ type: "UPDATE_LEAD", leadId, payload }),
      saveFloorPlan: (branchId: string, floorPlan: FloorPlan) =>
        dispatch({ type: "SAVE_FLOOR_PLAN", branchId, floorPlan }),
    }),
    [dispatch],
  );
}

/* keep DAY constant for downstream callers if needed */
export { DAY };
