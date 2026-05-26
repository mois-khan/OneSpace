"use client";

import { useCurrentUser } from "@/lib/store";
import { can, type Permission } from "./permissions";

/** True if the active user's role has the given permission. */
export function useCan(permission: Permission): boolean {
  const user = useCurrentUser();
  return can(user.role, permission);
}

/** Convenience hook for components that need to read several permissions. */
export function usePermissions() {
  const user = useCurrentUser();
  return {
    role: user.role,
    branchScope: user.branchScope,
    isBranchLocked: user.branchScope !== "all",
    can: (p: Permission) => can(user.role, p),
  };
}
