import type {
  ActivityEvent,
  Booking,
  Branch,
  CurrentUser,
  Invoice,
  Lead,
  Member,
  Notification,
  PreRegistration,
  Room,
  Visitor,
} from "@/types";

const DAY = 24 * 60 * 60 * 1000;

export interface AppState {
  branches: Branch[];
  members: Member[];
  leads: Lead[];
  visitors: Visitor[];
  preRegistrations: PreRegistration[];
  bookings: Booking[];
  rooms: Room[];
  invoices: Invoice[];
  notifications: Notification[];
  activity: ActivityEvent[];
  occupancyTrend: Array<Record<string, string | number>>;
  selectedBranchId: string;
  /** ms anchor for "now" so SSR/CSR stay consistent within a session */
  now: number;
  currentUser: CurrentUser;
}

/* ───────── basic filters ───────── */

export function filterByBranch<T extends { branchId?: string }>(
  list: T[],
  branchId: string,
): T[] {
  if (branchId === "all") return list;
  return list.filter((x) => x.branchId === branchId);
}

export const selectBranches = (s: AppState): Branch[] => s.branches;

export const selectMembers = (s: AppState, branchId: string = s.selectedBranchId) =>
  filterByBranch(s.members, branchId);

export const selectLeads = (s: AppState, branchId: string = s.selectedBranchId) =>
  filterByBranch(s.leads, branchId);

export const selectVisitors = (s: AppState, branchId: string = s.selectedBranchId) =>
  filterByBranch(s.visitors, branchId);

export const selectPreRegistrations = (
  s: AppState,
  branchId: string = s.selectedBranchId,
) => filterByBranch(s.preRegistrations, branchId);

/** Visit history for a given phone number across the whole company (not branch-filtered). */
export const selectVisitHistoryByPhone = (s: AppState, phone: string) =>
  s.visitors
    .filter((v) => v.phone === phone)
    .sort((a, b) => b.checkInAt.localeCompare(a.checkInAt));

export const selectBookings = (s: AppState, roomId?: string) =>
  roomId ? s.bookings.filter((b) => b.roomId === roomId) : s.bookings;

export const selectRooms = (s: AppState, branchId: string = s.selectedBranchId) =>
  filterByBranch(s.rooms, branchId);

export const selectInvoices = (
  s: AppState,
  branchId: string = s.selectedBranchId,
  status?: Invoice["status"],
) => {
  let list = filterByBranch(s.invoices, branchId);
  if (status) list = list.filter((i) => i.status === status);
  return list;
};

export const selectNotifications = (s: AppState) => s.notifications;

export const selectUnreadNotificationCount = (s: AppState) =>
  s.notifications.filter((n) => !n.read).length;

/* ───────── KPI selectors ───────── */

export interface DashboardKpis {
  occupancy: number;
  mrr: number;
  atRiskMrr: number;
  activeMembers: number;
  overdueInvoices: number;
  overdueAmount: number;
  renewalsDueIn7Days: number;
  renewalsDueIn30Days: number;
  visitorsToday: number;
  highRiskCount: number;
  branchCount: number;
}

export function selectKpis(
  s: AppState,
  branchId: string = s.selectedBranchId,
): DashboardKpis {
  const members = selectMembers(s, branchId);
  const invoices = selectInvoices(s, branchId);
  const visitors = selectVisitors(s, branchId);
  const branches = branchId === "all" ? s.branches : s.branches.filter((b) => b.id === branchId);

  const mrr = members.reduce((acc, m) => acc + m.monthlyFee, 0);
  const atRiskMembers = members.filter((m) => (m.riskScore || 0) >= 70);
  const atRiskMrr = atRiskMembers.reduce((acc, m) => acc + m.monthlyFee, 0);
  const overdue = invoices.filter((i) => i.status === "overdue");

  const todayStart = new Date(s.now);
  todayStart.setHours(0, 0, 0, 0);
  const todayStartMs = todayStart.getTime();

  const visitorsToday = visitors.filter((v) => new Date(v.checkInAt).getTime() >= todayStartMs).length;

  const renewals7 = members.filter((m) => {
    const days = (new Date(m.contractEnd).getTime() - s.now) / DAY;
    return days > 0 && days <= 7;
  }).length;

  const renewals30 = members.filter((m) => {
    const days = (new Date(m.contractEnd).getTime() - s.now) / DAY;
    return days > 0 && days <= 30;
  }).length;

  // Occupancy: average across selected branches' floor plans (via members + branches' totalSeats)
  let occupancyPct = 0;
  if (branches.length > 0) {
    const occs = branches.map((b) => {
      const branchMembers = s.members.filter((m) => m.branchId === b.id);
      // Approximate seat count from member presence vs total seats
      const total = b.totalSeats || 1;
      const occupied = branchMembers.length;
      return Math.min(100, Math.round((occupied / total) * 100));
    });
    occupancyPct = Math.round(occs.reduce((a, b) => a + b, 0) / occs.length);
  }

  return {
    occupancy: occupancyPct,
    mrr,
    atRiskMrr,
    activeMembers: members.filter((m) => m.status !== "churned").length,
    overdueInvoices: overdue.length,
    overdueAmount: overdue.reduce((acc, i) => acc + i.amount, 0),
    renewalsDueIn7Days: renewals7,
    renewalsDueIn30Days: renewals30,
    visitorsToday,
    highRiskCount: atRiskMembers.length,
    branchCount: branches.length,
  };
}

/* ───────── branch performance matrix ───────── */

export interface BranchPerformanceRow {
  id: string;
  name: string;
  members: number;
  mrr: number;
  occupancy: number;
  overdue: number;
  health: "Healthy" | "Watch" | "Action";
  trend: number[]; // last 14 days occupancy
}

export function selectBranchPerformance(s: AppState): BranchPerformanceRow[] {
  const trendKeyFor = (name: string) => `CS Coworking - ${name}`;
  return s.branches.map((b) => {
    const members = s.members.filter((m) => m.branchId === b.id);
    const overdue = s.invoices.filter(
      (i) => i.branchId === b.id && i.status === "overdue",
    ).length;
    const mrr = members.reduce((acc, m) => acc + m.monthlyFee, 0);
    const total = b.totalSeats || 1;
    const occupancy = Math.min(100, Math.round((members.length / total) * 100));

    const trend = s.occupancyTrend
      .slice(-14)
      .map((row) => (row[trendKeyFor(b.name)] as number) || 0);

    let health: BranchPerformanceRow["health"] = "Healthy";
    if (overdue >= 2 || occupancy < 50) health = "Action";
    else if (overdue >= 1 || occupancy < 70) health = "Watch";

    return {
      id: b.id,
      name: b.name,
      members: members.length,
      mrr,
      occupancy,
      overdue,
      health,
      trend,
    };
  });
}

/* ───────── renewals & risk ───────── */

export function selectRenewalsDue(s: AppState, days: number, branchId: string = s.selectedBranchId) {
  const members = selectMembers(s, branchId);
  return members
    .filter((m) => {
      const d = (new Date(m.contractEnd).getTime() - s.now) / DAY;
      return d > 0 && d <= days;
    })
    .sort((a, b) => a.contractEnd.localeCompare(b.contractEnd));
}

export function selectAtRiskMembers(s: AppState, branchId: string = s.selectedBranchId) {
  return selectMembers(s, branchId)
    .filter((m) => (m.riskScore || 0) > 0)
    .sort((a, b) => (b.riskScore || 0) - (a.riskScore || 0));
}

/* ───────── today's focus (action queue) ───────── */

export interface FocusItem {
  id: string;
  kind: "renewal" | "overdue" | "overstay" | "highrisk";
  title: string;
  subtitle: string;
  link: string;
  severity: "warning" | "critical" | "info";
}

export function selectTodayFocus(s: AppState, branchId: string = s.selectedBranchId): FocusItem[] {
  const out: FocusItem[] = [];

  // Renewals next 5 days
  const renewals = selectRenewalsDue(s, 5, branchId).slice(0, 4);
  for (const m of renewals) {
    const days = Math.max(1, Math.ceil((new Date(m.contractEnd).getTime() - s.now) / DAY));
    out.push({
      id: `f-renew-${m.id}`,
      kind: "renewal",
      title: `Renew ${m.name}`,
      subtitle: `${m.company || "Member"} · contract ends in ${days}d · ₹${(m.monthlyFee / 1000).toFixed(0)}k MRR`,
      link: `/renewals`,
      severity: days <= 2 ? "critical" : "warning",
    });
  }

  // Overdue invoices
  const overdues = selectInvoices(s, branchId, "overdue").slice(0, 3);
  for (const inv of overdues) {
    const m = s.members.find((x) => x.id === inv.memberId);
    const daysOver = Math.max(1, Math.ceil((s.now - new Date(inv.dueAt).getTime()) / DAY));
    out.push({
      id: `f-inv-${inv.id}`,
      kind: "overdue",
      title: `Chase invoice — ${m?.company || m?.name || "Member"}`,
      subtitle: `₹${(inv.amount / 1000).toFixed(0)}k overdue ${daysOver}d`,
      link: m ? `/members/${m.id}` : "/dashboard",
      severity: daysOver > 14 ? "critical" : "warning",
    });
  }

  // Visitor overstay
  const overstaying = selectVisitors(s, branchId).filter((v) => {
    if (v.checkOutAt) return false;
    return (s.now - new Date(v.checkInAt).getTime()) / (60 * 60 * 1000) > 8;
  });
  for (const v of overstaying) {
    out.push({
      id: `f-overstay-${v.id}`,
      kind: "overstay",
      title: `Check on visitor ${v.name}`,
      subtitle: `Still checked in after 8+ hours`,
      link: `/visitors`,
      severity: "warning",
    });
  }

  return out.slice(0, 6);
}

/* ───────── activity ───────── */

export function selectActivity(s: AppState, branchId: string = s.selectedBranchId, limit = 20) {
  let list = s.activity;
  if (branchId !== "all") list = list.filter((a) => !a.branchId || a.branchId === branchId);
  return list.slice(0, limit);
}

/* ───────── revenue helpers ───────── */

export function selectBranchRevenue(s: AppState) {
  return s.branches.map((b) => {
    const members = s.members.filter((m) => m.branchId === b.id);
    return {
      branch: `CS Coworking - ${b.name}`,
      branchId: b.id,
      revenue: members.reduce((acc, m) => acc + m.monthlyFee, 0),
    };
  });
}

/* ───────── search ───────── */

export interface SearchResult {
  id: string;
  kind: "member" | "lead" | "visitor" | "branch" | "nav";
  title: string;
  subtitle?: string;
  link: string;
}

export function selectSearch(s: AppState, query: string, limit = 12): SearchResult[] {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const out: SearchResult[] = [];

  for (const m of s.members) {
    if (out.length >= limit * 2) break;
    if (
      m.name.toLowerCase().includes(q) ||
      m.email.toLowerCase().includes(q) ||
      (m.company || "").toLowerCase().includes(q)
    ) {
      out.push({
        id: `m-${m.id}`,
        kind: "member",
        title: m.name,
        subtitle: m.company || m.email,
        link: `/members/${m.id}`,
      });
    }
  }
  for (const l of s.leads) {
    if (out.length >= limit * 2) break;
    if (
      l.name.toLowerCase().includes(q) ||
      (l.company || "").toLowerCase().includes(q) ||
      l.phone.toLowerCase().includes(q)
    ) {
      out.push({
        id: `l-${l.id}`,
        kind: "lead",
        title: l.name,
        subtitle: `${l.stage} · ${l.company || l.phone}`,
        link: `/leads`,
      });
    }
  }
  for (const v of s.visitors) {
    if (out.length >= limit * 2) break;
    if (v.name.toLowerCase().includes(q) || v.purpose.toLowerCase().includes(q)) {
      out.push({
        id: `v-${v.id}`,
        kind: "visitor",
        title: v.name,
        subtitle: v.purpose,
        link: `/visitors`,
      });
    }
  }
  for (const b of s.branches) {
    if (out.length >= limit * 2) break;
    if (b.name.toLowerCase().includes(q) || b.location.toLowerCase().includes(q)) {
      out.push({
        id: `b-${b.id}`,
        kind: "branch",
        title: b.name,
        subtitle: b.location,
        link: `/floor-map?branch=${b.id}`,
      });
    }
  }
  return out.slice(0, limit);
}
