import type { UserRole } from "@/types";

/** A coarse permission key used by the UI to show/hide things and gate actions. */
export type Permission =
  | "view_finance" // dashboards, MRR cards, at-risk revenue
  | "view_renewals" // /renewals page
  | "bulk_renew" // bulk renew action in renewals
  | "bulk_email_members" // bulk email modal in renewals
  | "switch_branches" // can change the branch selector (scoped roles cannot)
  | "view_all_branches" // can see cross-branch data
  | "manage_leads" // create/move leads
  | "manage_bookings" // create / cancel bookings
  | "manage_visitors" // check-in / check-out
  | "view_floor_map";

/** What every role is allowed to do. */
const ROLE_PERMISSIONS: Record<UserRole, Set<Permission>> = {
  owner: new Set([
    "view_finance",
    "view_renewals",
    "bulk_renew",
    "bulk_email_members",
    "switch_branches",
    "view_all_branches",
    "manage_leads",
    "manage_bookings",
    "manage_visitors",
    "view_floor_map",
  ]),
  operations: new Set([
    "view_finance",
    "view_renewals",
    "bulk_renew",
    "bulk_email_members",
    "switch_branches",
    "view_all_branches",
    "manage_leads",
    "manage_bookings",
    "manage_visitors",
    "view_floor_map",
  ]),
  branch_manager: new Set([
    "view_finance",
    "view_renewals",
    "bulk_renew",
    "bulk_email_members",
    "manage_leads",
    "manage_bookings",
    "manage_visitors",
    "view_floor_map",
    // NO: switch_branches, view_all_branches — branch-locked
  ]),
  community: new Set([
    "manage_visitors",
    "view_floor_map",
    // NO finance, NO renewals, NO bulk actions, NO branch switching
  ]),
};

export function can(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].has(permission);
}
