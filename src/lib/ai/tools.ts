import type { ChatSnapshot } from "./snapshot";
import type { ToolName } from "./rbac";

const DAY = 24 * 60 * 60 * 1000;
const clamp = (n: number, min: number, max: number) => Math.max(min, Math.min(max, n));

/**
 * A suggested-action descriptor returned from tools like `suggest_renewal`.
 * The client renders these as clickable chips in the assistant message and
 * dispatches the corresponding store action when the user confirms.
 */
export interface SuggestedAction {
  id: string;
  kind: "renew" | "email" | "check_in";
  label: string;
  description?: string;
  /** Action-specific payload */
  payload: Record<string, unknown>;
}

export interface ToolResult {
  /** Plain-JSON result the model will see in the function-call response */
  data: unknown;
  /** Optional UI suggestions to surface in the chat */
  suggestions?: SuggestedAction[];
}

interface ToolContext {
  snapshot: ChatSnapshot;
  /** Active branch lock; `"all"` means cross-branch access permitted. */
  branchLock: string;
}

function resolveBranchId(ctx: ToolContext, requested?: string): string | undefined {
  if (ctx.branchLock !== "all") return ctx.branchLock;
  if (!requested || requested === "all") return undefined;
  return requested;
}

function filterByBranch<T extends { branchId?: string }>(
  list: T[],
  branchId: string | undefined,
): T[] {
  if (!branchId) return list;
  return list.filter((x) => x.branchId === branchId);
}

type ToolHandler = (args: Record<string, unknown>, ctx: ToolContext) => ToolResult;

export const TOOL_HANDLERS: Record<ToolName, ToolHandler> = {
  get_kpis: (args, ctx) => {
    const branchId = resolveBranchId(ctx, args.branchId as string | undefined);
    if (!branchId) return { data: ctx.snapshot.kpis };

    const members = ctx.snapshot.members.filter((m) => m.branchId === branchId);
    const overdueInvoices = ctx.snapshot.invoices.filter(
      (i) => i.branchId === branchId && i.status === "overdue",
    );
    const today = new Date(ctx.snapshot.now);
    today.setHours(0, 0, 0, 0);
    const todayMs = today.getTime();

    return {
      data: {
        branchId,
        activeMembers: members.filter((m) => m.status !== "churned").length,
        mrr: members.reduce((acc, m) => acc + m.monthlyFee, 0),
        atRiskMrr: members
          .filter((m) => m.riskScore >= 70)
          .reduce((acc, m) => acc + m.monthlyFee, 0),
        highRiskCount: members.filter((m) => m.riskScore >= 70).length,
        overdueInvoices: overdueInvoices.length,
        overdueAmount: overdueInvoices.reduce((acc, i) => acc + i.amount, 0),
        renewalsDueIn7Days: members.filter((m) => {
          const d = (new Date(m.contractEnd).getTime() - ctx.snapshot.now) / DAY;
          return d > 0 && d <= 7;
        }).length,
        renewalsDueIn30Days: members.filter((m) => {
          const d = (new Date(m.contractEnd).getTime() - ctx.snapshot.now) / DAY;
          return d > 0 && d <= 30;
        }).length,
        visitorsToday: ctx.snapshot.visitors.filter(
          (v) => v.branchId === branchId && new Date(v.checkInAt).getTime() >= todayMs,
        ).length,
      },
    };
  },

  get_branch_performance: (_args, ctx) => {
    if (ctx.branchLock === "all") return { data: ctx.snapshot.branchPerformance };
    return {
      data: ctx.snapshot.branchPerformance.filter((b) => b.id === ctx.branchLock),
    };
  },

  list_at_risk_members: (args, ctx) => {
    const branchId = resolveBranchId(ctx, args.branchId as string | undefined);
    const minRisk = clamp(Number(args.minRisk ?? 70), 0, 100);
    const limit = clamp(Number(args.limit ?? 10), 1, 25);

    const list = filterByBranch(ctx.snapshot.members, branchId)
      .filter((m) => m.riskScore >= minRisk)
      .sort((a, b) => b.riskScore - a.riskScore)
      .slice(0, limit)
      .map((m) => ({
        id: m.id,
        name: m.name,
        company: m.company,
        branchId: m.branchId,
        planType: m.planType,
        monthlyFee: m.monthlyFee,
        riskScore: m.riskScore,
        daysSinceLastVisit: m.daysSinceLastVisit,
        contractEnd: m.contractEnd,
      }));

    return { data: { count: list.length, members: list } };
  },

  list_renewals_due: (args, ctx) => {
    const branchId = resolveBranchId(ctx, args.branchId as string | undefined);
    const days = clamp(Number(args.days ?? 30), 1, 90);
    const limit = clamp(Number(args.limit ?? 10), 1, 25);
    const now = ctx.snapshot.now;

    const list = filterByBranch(ctx.snapshot.members, branchId)
      .filter((m) => {
        const d = (new Date(m.contractEnd).getTime() - now) / DAY;
        return d > 0 && d <= days;
      })
      .sort((a, b) => a.contractEnd.localeCompare(b.contractEnd))
      .slice(0, limit)
      .map((m) => ({
        id: m.id,
        name: m.name,
        company: m.company,
        branchId: m.branchId,
        planType: m.planType,
        monthlyFee: m.monthlyFee,
        contractEnd: m.contractEnd,
        daysLeft: Math.max(1, Math.ceil((new Date(m.contractEnd).getTime() - now) / DAY)),
        riskScore: m.riskScore,
      }));

    return { data: { count: list.length, members: list } };
  },

  list_overdue_invoices: (args, ctx) => {
    const branchId = resolveBranchId(ctx, args.branchId as string | undefined);
    const limit = clamp(Number(args.limit ?? 10), 1, 25);
    const now = ctx.snapshot.now;

    const list = filterByBranch(ctx.snapshot.invoices, branchId)
      .filter((i) => i.status === "overdue")
      .sort((a, b) => b.amount - a.amount)
      .slice(0, limit)
      .map((i) => {
        const member = ctx.snapshot.members.find((m) => m.id === i.memberId);
        return {
          id: i.id,
          memberId: i.memberId,
          memberName: member?.name,
          memberCompany: member?.company,
          branchId: i.branchId,
          amount: i.amount,
          daysOverdue: Math.max(1, Math.ceil((now - new Date(i.dueAt).getTime()) / DAY)),
        };
      });

    return { data: { count: list.length, invoices: list } };
  },

  list_visitors_today: (args, ctx) => {
    const branchId = resolveBranchId(ctx, args.branchId as string | undefined);
    const today = new Date(ctx.snapshot.now);
    today.setHours(0, 0, 0, 0);
    const todayMs = today.getTime();
    const list = filterByBranch(ctx.snapshot.visitors, branchId)
      .filter((v) => new Date(v.checkInAt).getTime() >= todayMs)
      .map((v) => {
        const hoursInside = v.checkOutAt
          ? null
          : (ctx.snapshot.now - new Date(v.checkInAt).getTime()) / (60 * 60 * 1000);
        return {
          id: v.id,
          name: v.name,
          purpose: v.purpose,
          hostName: v.hostName,
          branchId: v.branchId,
          checkInAt: v.checkInAt,
          checkOutAt: v.checkOutAt,
          currentlyInside: !v.checkOutAt,
          overstay: hoursInside !== null && hoursInside > 8,
        };
      });

    return { data: { count: list.length, visitors: list } };
  },

  list_leads: (args, ctx) => {
    const branchId = resolveBranchId(ctx, args.branchId as string | undefined);
    const stage = args.stage as string | undefined;
    const limit = clamp(Number(args.limit ?? 15), 1, 50);

    let list = filterByBranch(ctx.snapshot.leads, branchId);
    if (stage) list = list.filter((l) => l.stage === stage);

    const slim = list.slice(0, limit).map((l) => ({
      id: l.id,
      name: l.name,
      company: l.company,
      branchId: l.branchId,
      planType: l.planType,
      source: l.source,
      stage: l.stage,
      mrr: l.mrr,
      createdAt: l.createdAt,
    }));

    return { data: { count: list.length, returned: slim.length, leads: slim } };
  },

  list_notifications: (args, ctx) => {
    const limit = clamp(Number(args.limit ?? 10), 1, 25);
    const list = ctx.snapshot.notifications
      .slice()
      .sort((a, b) => Number(a.read) - Number(b.read) || b.timestamp - a.timestamp)
      .slice(0, limit)
      .map((n) => ({
        id: n.id,
        type: n.type,
        severity: n.severity,
        message: n.message,
        branchId: n.branchId,
        read: n.read,
        timestamp: n.timestamp,
      }));
    return { data: { count: list.length, notifications: list } };
  },

  find_member: (args, ctx) => {
    const query = String(args.query || "").toLowerCase().trim();
    if (!query) return { data: { found: false } };

    const candidates = ctx.snapshot.members.filter(
      (m) =>
        m.id === query ||
        m.name.toLowerCase().includes(query) ||
        (m.company || "").toLowerCase().includes(query) ||
        m.email.toLowerCase().includes(query),
    );
    const best = candidates[0];
    return {
      data: best
        ? {
            found: true,
            member: {
              id: best.id,
              branchId: best.branchId,
              name: best.name,
              company: best.company,
              email: best.email,
              phone: best.phone,
              planType: best.planType,
              monthlyFee: best.monthlyFee,
              contractEnd: best.contractEnd,
              status: best.status,
              riskScore: best.riskScore,
              daysSinceLastVisit: best.daysSinceLastVisit,
              avgVisitsPerMonth: best.avgVisitsPerMonth,
              openTickets: best.openTickets,
            },
            alternatives: candidates.slice(1, 4).map((m) => ({
              id: m.id,
              name: m.name,
              company: m.company,
            })),
          }
        : { found: false },
    };
  },

  suggest_renewal: (args, ctx) => {
    const memberId = String(args.memberId || "");
    const member = ctx.snapshot.members.find((m) => m.id === memberId);
    if (!member) {
      return { data: { accepted: false, reason: "Member not found in scope" } };
    }
    const months = clamp(Number(args.months ?? 12), 1, 36);
    return {
      data: { accepted: true, memberId, months, memberName: member.name },
      suggestions: [
        {
          id: `act-renew-${memberId}-${Date.now()}`,
          kind: "renew",
          label: `Renew ${member.name} for ${months}mo`,
          description: `Extends contract by ${months} months and resets risk score.`,
          payload: { memberId, months },
        },
      ],
    };
  },

  suggest_email_draft: (args, ctx) => {
    const memberId = String(args.memberId || "");
    const member = ctx.snapshot.members.find((m) => m.id === memberId);
    if (!member) {
      return { data: { accepted: false, reason: "Member not found in scope" } };
    }
    return {
      data: { accepted: true, memberId, memberName: member.name },
      suggestions: [
        {
          id: `act-email-${memberId}-${Date.now()}`,
          kind: "email",
          label: `Draft retention email for ${member.name}`,
          description: "Opens the AI email composer pre-filled for this member.",
          payload: { memberId },
        },
      ],
    };
  },

  suggest_check_in: (args) => {
    const name = String(args.name || "");
    const purpose = String(args.purpose || "Client meeting");
    return {
      data: { accepted: true, name, purpose },
      suggestions: [
        {
          id: `act-checkin-${Date.now()}`,
          kind: "check_in",
          label: name ? `Check in ${name}` : "Open visitor check-in",
          description: "Opens the front-desk check-in form.",
          payload: { name, purpose },
        },
      ],
    };
  },
};
