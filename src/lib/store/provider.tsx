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
  Member,
  Notification,
  Visitor,
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
  generateRooms,
  generateVisitors,
} from "./generate";
import type { AppState } from "./selectors";

type Action =
  | { type: "SET_BRANCH"; branchId: string }
  | { type: "SET_USER"; user: CurrentUser }
  | { type: "CHECK_IN_VISITOR"; payload: Omit<Visitor, "id" | "checkInAt" | "qrCode"> }
  | { type: "CHECK_OUT_VISITOR"; id: string }
  | { type: "RENEW_MEMBER"; memberId: string; months?: number }
  | { type: "MOVE_LEAD"; leadId: string; stage: Lead["stage"] }
  | { type: "ADD_LEAD"; payload: Omit<Lead, "id" | "createdAt"> }
  | { type: "CREATE_BOOKING"; payload: Omit<Booking, "id"> }
  | { type: "CANCEL_BOOKING"; id: string }
  | { type: "MARK_NOTIFICATION_READ"; id: string }
  | { type: "MARK_ALL_NOTIFICATIONS_READ" }
  | { type: "PAY_INVOICE"; id: string }
  | { type: "PUSH_NOTIFICATION"; payload: Omit<Notification, "id" | "read" | "timestamp"> & { timestamp?: number } }
  | { type: "PUSH_ACTIVITY"; payload: Omit<ActivityEvent, "id" | "timestamp"> & { timestamp?: number } };

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
  const rooms = generateRooms();
  const bookings = generateBookings(now);
  const notifications = generateNotifications(now, members, invoices, visitors, leads);
  const activity = generateActivity(now, members, visitors, leads, bookings, invoices);
  const occupancyTrend = generateOccupancyTrend(now);

  return {
    branches: BRANCHES,
    members,
    leads,
    visitors,
    bookings,
    rooms,
    invoices,
    notifications,
    activity,
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
    case "SET_BRANCH":
      return { ...state, selectedBranchId: action.branchId };

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
      return {
        ...state,
        visitors: [newVisitor, ...state.visitors],
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

    default:
      return state;
  }
}

const StateCtx = createContext<AppState | null>(null);
const DispatchCtx = createContext<React.Dispatch<Action> | null>(null);

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  // Anchor "now" once per session via useReducer's lazy initializer.
  const [state, dispatch] = useReducer(
    reducer,
    undefined as unknown as number,
    () => buildInitialState(Date.now()),
  );

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
      renewMember: (memberId: string, months = 12) =>
        dispatch({ type: "RENEW_MEMBER", memberId, months }),
      moveLead: (leadId: string, stage: Lead["stage"]) =>
        dispatch({ type: "MOVE_LEAD", leadId, stage }),
      addLead: (payload: Omit<Lead, "id" | "createdAt">) =>
        dispatch({ type: "ADD_LEAD", payload }),
      createBooking: (payload: Omit<Booking, "id">) =>
        dispatch({ type: "CREATE_BOOKING", payload }),
      cancelBooking: (id: string) => dispatch({ type: "CANCEL_BOOKING", id }),
      markNotificationRead: (id: string) =>
        dispatch({ type: "MARK_NOTIFICATION_READ", id }),
      markAllNotificationsRead: () =>
        dispatch({ type: "MARK_ALL_NOTIFICATIONS_READ" }),
      payInvoice: (id: string) => dispatch({ type: "PAY_INVOICE", id }),
      pushNotification: (
        payload: Omit<Notification, "id" | "read" | "timestamp"> & { timestamp?: number },
      ) => dispatch({ type: "PUSH_NOTIFICATION", payload }),
    }),
    [dispatch],
  );
}

/* keep DAY constant for downstream callers if needed */
export { DAY };
