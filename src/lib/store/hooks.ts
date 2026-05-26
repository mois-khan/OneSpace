"use client";

import { useMemo } from "react";
import {
  selectActivity,
  selectAtRiskMembers,
  selectBranchPerformance,
  selectBranchRevenue,
  selectBranches,
  selectInvoices,
  selectKpis,
  selectLeads,
  selectMembers,
  selectNotifications,
  selectPreRegistrations,
  selectRenewalsDue,
  selectRooms,
  selectSearch,
  selectTodayFocus,
  selectUnreadNotificationCount,
  selectVisitHistoryByPhone,
  selectVisitors,
} from "./selectors";
import { useAppState } from "./provider";

export function useBranch() {
  const state = useAppState();
  return {
    selectedBranchId: state.selectedBranchId,
    branches: state.branches,
    selectedBranch:
      state.selectedBranchId === "all"
        ? null
        : state.branches.find((b) => b.id === state.selectedBranchId) || null,
  };
}

export function useBranches() {
  return selectBranches(useAppState());
}

export function useMembers(branchId?: string) {
  const s = useAppState();
  return useMemo(() => selectMembers(s, branchId), [s, branchId]);
}

export function useAllMembers() {
  return useAppState().members;
}

export function useLeads(branchId?: string) {
  const s = useAppState();
  return useMemo(() => selectLeads(s, branchId), [s, branchId]);
}

export function useVisitors(branchId?: string) {
  const s = useAppState();
  return useMemo(() => selectVisitors(s, branchId), [s, branchId]);
}

export function usePreRegistrations(branchId?: string) {
  const s = useAppState();
  return useMemo(() => selectPreRegistrations(s, branchId), [s, branchId]);
}

export function useVisitHistory(phone: string) {
  const s = useAppState();
  return useMemo(() => selectVisitHistoryByPhone(s, phone), [s, phone]);
}

export function useRooms(branchId?: string) {
  const s = useAppState();
  return useMemo(() => selectRooms(s, branchId), [s, branchId]);
}

export function useAllBookings() {
  return useAppState().bookings;
}

export function useInvoices(branchId?: string) {
  const s = useAppState();
  return useMemo(() => selectInvoices(s, branchId), [s, branchId]);
}

export function useKpis(branchId?: string) {
  const s = useAppState();
  return useMemo(() => selectKpis(s, branchId), [s, branchId]);
}

export function useBranchPerformance() {
  const s = useAppState();
  return useMemo(() => selectBranchPerformance(s), [s]);
}

export function useBranchRevenue() {
  const s = useAppState();
  return useMemo(() => selectBranchRevenue(s), [s]);
}

export function useRenewalsDue(days = 30, branchId?: string) {
  const s = useAppState();
  return useMemo(() => selectRenewalsDue(s, days, branchId), [s, days, branchId]);
}

export function useAtRiskMembers(branchId?: string) {
  const s = useAppState();
  return useMemo(() => selectAtRiskMembers(s, branchId), [s, branchId]);
}

export function useTodayFocus(branchId?: string) {
  const s = useAppState();
  return useMemo(() => selectTodayFocus(s, branchId), [s, branchId]);
}

export function useActivity(branchId?: string, limit?: number) {
  const s = useAppState();
  return useMemo(() => selectActivity(s, branchId, limit), [s, branchId, limit]);
}

export function useNotifications() {
  const s = useAppState();
  return selectNotifications(s);
}

export function useUnreadCount() {
  const s = useAppState();
  return selectUnreadNotificationCount(s);
}

export function useOccupancyTrend() {
  return useAppState().occupancyTrend;
}

export function useSearch(query: string, limit?: number) {
  const s = useAppState();
  return useMemo(() => selectSearch(s, query, limit), [s, query, limit]);
}

export function useCurrentUser() {
  return useAppState().currentUser;
}

export function useNow() {
  return useAppState().now;
}
