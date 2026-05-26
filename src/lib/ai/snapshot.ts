import type { AppState } from "@/lib/store/selectors";
import {
  selectBranchPerformance,
  selectKpis,
} from "@/lib/store/selectors";

/**
 * A compact data digest sent from the client to the chat API.
 *
 * The full app state is too large to embed in a system prompt, so we ship:
 *   - the headline KPI snapshot (always)
 *   - the branch performance matrix
 *   - the smaller entity lists in their entirety (leads, visitors, rooms, branches, notifications)
 *   - members + invoices as compact projections (only the fields the assistant needs)
 *
 * Tool-call results are computed from this snapshot on the server.
 */
export interface MemberDigest {
  id: string;
  branchId: string;
  name: string;
  company?: string;
  email: string;
  phone: string;
  planType: string;
  monthlyFee: number;
  contractEnd: string;
  status: string;
  riskScore: number;
  daysSinceLastVisit: number;
  avgVisitsPerMonth: number;
  openTickets: number;
}

export interface InvoiceDigest {
  id: string;
  memberId: string;
  branchId: string;
  amount: number;
  status: string;
  dueAt: string;
}

export interface ChatSnapshot {
  now: number;
  branches: Array<{ id: string; name: string; location: string; totalSeats: number }>;
  kpis: ReturnType<typeof selectKpis>;
  branchPerformance: ReturnType<typeof selectBranchPerformance>;
  members: MemberDigest[];
  invoices: InvoiceDigest[];
  leads: AppState["leads"];
  visitors: AppState["visitors"];
  rooms: AppState["rooms"];
  notifications: AppState["notifications"];
}

/** Build the snapshot from current store state, optionally scoped to a single branch. */
export function buildChatSnapshot(state: AppState, branchScope: string): ChatSnapshot {
  const inScope = <T extends { branchId?: string }>(items: T[]) =>
    branchScope === "all" ? items : items.filter((x) => x.branchId === branchScope);

  const branches =
    branchScope === "all"
      ? state.branches
      : state.branches.filter((b) => b.id === branchScope);

  const kpis = selectKpis(state, branchScope);
  const branchPerformance =
    branchScope === "all"
      ? selectBranchPerformance(state)
      : selectBranchPerformance(state).filter((b) => b.id === branchScope);

  const members: MemberDigest[] = inScope(state.members).map((m) => ({
    id: m.id,
    branchId: m.branchId,
    name: m.name,
    company: m.company,
    email: m.email,
    phone: m.phone,
    planType: m.planType,
    monthlyFee: m.monthlyFee,
    contractEnd: m.contractEnd,
    status: m.status,
    riskScore: m.riskScore || 0,
    daysSinceLastVisit: m.daysSinceLastVisit || 0,
    avgVisitsPerMonth: m.avgVisitsPerMonth || 0,
    openTickets: m.tickets.filter((t) => t.status === "open").length,
  }));

  const invoices: InvoiceDigest[] = inScope(state.invoices).map((i) => ({
    id: i.id,
    memberId: i.memberId,
    branchId: i.branchId,
    amount: i.amount,
    status: i.status,
    dueAt: i.dueAt,
  }));

  return {
    now: state.now,
    branches,
    kpis,
    branchPerformance,
    members,
    invoices,
    leads: inScope(state.leads),
    visitors: inScope(state.visitors),
    rooms: inScope(state.rooms),
    notifications: inScope(state.notifications),
  };
}
