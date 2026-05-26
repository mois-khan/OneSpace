"use client";

/**
 * Backward-compat shim. The real implementation now lives in `@/lib/store`.
 * New code should import `useBranch` / `useAppActions` from there directly.
 */

import { useBranch, useAppActions } from "@/lib/store";

export { AppDataProvider as BranchProvider } from "@/lib/store";

export function useBranchContext() {
  const { selectedBranchId } = useBranch();
  const { setBranch } = useAppActions();
  return { selectedBranchId, setSelectedBranchId: setBranch };
}
