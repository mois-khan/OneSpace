import type { UserRole } from "@/types";

/**
 * Tools exposed to the AI assistant. Names are intentionally stable so the
 * server-side dispatcher and the system-prompt allowlist agree on identifiers.
 */
export type ToolName =
  | "get_kpis"
  | "get_branch_performance"
  | "list_at_risk_members"
  | "list_renewals_due"
  | "list_overdue_invoices"
  | "list_visitors_today"
  | "list_leads"
  | "list_notifications"
  | "find_member"
  | "suggest_renewal"
  | "suggest_email_draft"
  | "suggest_check_in";

/** Tool descriptors used to build Gemini function declarations. */
export interface ToolDescriptor {
  name: ToolName;
  /** One-line description that goes into the function declaration. */
  description: string;
  /** OpenAPI-style parameter schema (Gemini compatible). */
  parameters: Record<string, unknown>;
}

export const TOOL_REGISTRY: Record<ToolName, ToolDescriptor> = {
  get_kpis: {
    name: "get_kpis",
    description:
      "Return today's operational KPIs (occupancy %, MRR, at-risk MRR, overdue invoices, renewals due in 7/30 days, active members, visitors today).",
    parameters: {
      type: "object",
      properties: {
        branchId: {
          type: "string",
          description:
            "Optional branch id (b1..b6). Omit or 'all' for company-wide KPIs. Ignored when the caller is branch-scoped.",
        },
      },
    },
  },
  get_branch_performance: {
    name: "get_branch_performance",
    description:
      "Return per-branch performance table: members, MRR, occupancy %, overdue invoices, health rating.",
    parameters: { type: "object", properties: {} },
  },
  list_at_risk_members: {
    name: "list_at_risk_members",
    description:
      "List members with riskScore above a threshold, optionally filtered by branch. Sorted by risk descending. Defaults to top 10.",
    parameters: {
      type: "object",
      properties: {
        minRisk: { type: "number", description: "Minimum risk score (0-100). Default 70." },
        branchId: { type: "string", description: "Optional branch id." },
        limit: { type: "number", description: "Max results. Default 10, max 25." },
      },
    },
  },
  list_renewals_due: {
    name: "list_renewals_due",
    description:
      "List members whose contracts end within N days, sorted by soonest. Default 30 days, max 90.",
    parameters: {
      type: "object",
      properties: {
        days: { type: "number", description: "Window in days (1-90). Default 30." },
        branchId: { type: "string", description: "Optional branch id." },
        limit: { type: "number", description: "Max results. Default 10, max 25." },
      },
    },
  },
  list_overdue_invoices: {
    name: "list_overdue_invoices",
    description: "List overdue invoices with amount and days past due.",
    parameters: {
      type: "object",
      properties: {
        branchId: { type: "string", description: "Optional branch id." },
        limit: { type: "number", description: "Max results. Default 10." },
      },
    },
  },
  list_visitors_today: {
    name: "list_visitors_today",
    description: "List visitors checked in today, with currently-inside / overstay flags.",
    parameters: {
      type: "object",
      properties: { branchId: { type: "string" } },
    },
  },
  list_leads: {
    name: "list_leads",
    description:
      "List leads filtered by stage (new/toured/proposal/negotiating/won/lost) and/or branch.",
    parameters: {
      type: "object",
      properties: {
        stage: {
          type: "string",
          description:
            "Lead stage: new, toured, proposal, negotiating, won, lost. Omit to include all.",
        },
        branchId: { type: "string" },
        limit: { type: "number", description: "Max results. Default 15." },
      },
    },
  },
  list_notifications: {
    name: "list_notifications",
    description: "List recent operational notifications (unread first).",
    parameters: {
      type: "object",
      properties: { limit: { type: "number" } },
    },
  },
  find_member: {
    name: "find_member",
    description:
      "Find a member by id or by name/company substring. Returns the closest match.",
    parameters: {
      type: "object",
      properties: {
        query: { type: "string", description: "Member id, name, or company text." },
      },
      required: ["query"],
    },
  },
  suggest_renewal: {
    name: "suggest_renewal",
    description:
      "Surface a suggested 'Renew member for 12 months' action button in the chat. Use when the user is discussing a renewal-worthy member.",
    parameters: {
      type: "object",
      properties: {
        memberId: { type: "string", description: "The member id to renew." },
        months: { type: "number", description: "Months to extend. Default 12." },
      },
      required: ["memberId"],
    },
  },
  suggest_email_draft: {
    name: "suggest_email_draft",
    description:
      "Surface a suggested 'Draft retention email' action button in the chat. Use when the user discusses outreach to a specific member.",
    parameters: {
      type: "object",
      properties: { memberId: { type: "string" } },
      required: ["memberId"],
    },
  },
  suggest_check_in: {
    name: "suggest_check_in",
    description:
      "Surface a suggested 'Open visitor check-in' action in the chat. Use when the user wants to register a visitor.",
    parameters: {
      type: "object",
      properties: {
        name: { type: "string" },
        purpose: { type: "string" },
      },
    },
  },
};

/** Default allow-list of tool names per role. */
const READ_TOOLS: ToolName[] = [
  "get_kpis",
  "get_branch_performance",
  "list_at_risk_members",
  "list_renewals_due",
  "list_overdue_invoices",
  "list_visitors_today",
  "list_leads",
  "list_notifications",
  "find_member",
];

const SUGGESTION_TOOLS: ToolName[] = [
  "suggest_renewal",
  "suggest_email_draft",
  "suggest_check_in",
];

export const ROLE_TOOLS: Record<UserRole, ToolName[]> = {
  owner: [...READ_TOOLS, ...SUGGESTION_TOOLS],
  operations: [...READ_TOOLS, ...SUGGESTION_TOOLS],
  branch_manager: [...READ_TOOLS, ...SUGGESTION_TOOLS],
  community: [
    "get_kpis",
    "list_visitors_today",
    "list_notifications",
    "find_member",
    "suggest_check_in",
    "suggest_email_draft",
  ],
};

export interface RoleCapabilities {
  /** Human-readable description used in the system prompt. */
  description: string;
  /** When true, all data queries are forcibly scoped to the user's branch. */
  branchLocked: boolean;
  /** What the role is permitted to discuss / be told. */
  scopeNote: string;
}

export const ROLE_META: Record<UserRole, RoleCapabilities> = {
  owner: {
    description:
      "Owner / founder. Full visibility into every branch, every metric, every member.",
    branchLocked: false,
    scopeNote: "Free to discuss any branch, any number, any member.",
  },
  operations: {
    description:
      "Operations lead. Sees every branch, every operational metric. Can plan renewals, follow-ups, occupancy moves.",
    branchLocked: false,
    scopeNote: "Free to discuss any branch and any operational metric.",
  },
  branch_manager: {
    description:
      "Branch manager — responsible for ONE branch. Should only see data and members for their branch.",
    branchLocked: true,
    scopeNote:
      "If the user asks about other branches, politely explain you can only share insights about their assigned branch.",
  },
  community: {
    description:
      "Community manager — runs the front desk and member experience for ONE branch. Limited access to finance/revenue data.",
    branchLocked: true,
    scopeNote:
      "Avoid revenue, MRR, and renewal pipeline detail. Focus on visitors, occupancy, member sentiment, and outreach. If asked about money or branches you don't own, decline politely.",
  },
};

export function toolsForRole(role: UserRole): ToolDescriptor[] {
  return ROLE_TOOLS[role].map((name) => TOOL_REGISTRY[name]);
}
