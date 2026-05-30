"use client";

import { useState, useMemo, useCallback } from "react";
import {
  useAllMembers,
  useMembers,
  useBranches,
  useBranch,
  useAppActions,
  useNow,
} from "@/lib/store";
import type { Member } from "@/types";
import { RenewalHero } from "@/components/renewals/RenewalHero";
import { RiskTable } from "@/components/renewals/RiskTable";
import { RenewalModal } from "@/components/renewals/RenewalModal";
import { BulkEmailModal } from "@/components/renewals/BulkEmailModal";
import { SelectionToolbar } from "@/components/renewals/SelectionToolbar";
import { AIEmailModal } from "@/components/members/AIEmailModal";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const DAY = 24 * 60 * 60 * 1000;

type FilterMode = "all" | "critical" | "high" | "expiring" | "ghosting";

export default function RenewalsPage() {
  // Branch-scoped: respects the TopBar branch selector.
  const members = useMembers();
  // Unscoped: used only for cross-branch lookups (e.g., when an action targets a member by id).
  const allMembers = useAllMembers();
  const branches = useBranches();
  const { selectedBranch } = useBranch();
  const now = useNow();
  const { renewMember } = useAppActions();

  const [filterMode, setFilterMode] = useState<FilterMode>("all");
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [renewMemberState, setRenewMemberState] = useState<Member | null>(null);
  const [emailMember, setEmailMember] = useState<Member | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);

  const getBranchName = useCallback(
    (id: string) => branches.find((b) => b.id === id)?.name || "Unknown",
    [branches],
  );

  const atRiskUniverse = useMemo(() => {
    return members
      .filter((m) => {
        const daysLeft = (new Date(m.contractEnd).getTime() - now) / DAY;
        return (m.riskScore || 0) > 0 || daysLeft <= 45;
      })
      .sort((a, b) => (b.riskScore || 0) - (a.riskScore || 0));
  }, [members, now]);

  const filteredMembers = useMemo(() => {
    const daysLeft = (endDate: string) =>
      Math.ceil((new Date(endDate).getTime() - now) / DAY);

    if (filterMode === "critical")
      return atRiskUniverse.filter((m) => (m.riskScore || 0) >= 70);
    if (filterMode === "high")
      return atRiskUniverse.filter(
        (m) => (m.riskScore || 0) >= 40 && (m.riskScore || 0) < 70,
      );
    if (filterMode === "expiring")
      return atRiskUniverse.filter((m) => {
        const d = daysLeft(m.contractEnd);
        return d > 0 && d <= 30;
      });
    if (filterMode === "ghosting")
      return atRiskUniverse.filter((m) => (m.daysSinceLastVisit || 0) >= 14);
    return atRiskUniverse;
  }, [atRiskUniverse, filterMode, now]);

  const selectedMembers = useMemo(
    () => filteredMembers.filter((m) => selectedIds.has(m.id)),
    [filteredMembers, selectedIds],
  );

  const handleToggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const handleToggleSelectAll = useCallback(() => {
    setSelectedIds((prev) => {
      if (filteredMembers.every((m) => prev.has(m.id))) return new Set();
      return new Set(filteredMembers.map((m) => m.id));
    });
  }, [filteredMembers]);

  const handleClearSelection = () => setSelectedIds(new Set());

  const handleConfirmRenewal = (memberId: string) => {
    // Use the unscoped member lookup so the toast still works if the row
    // is dispatched from somewhere outside the current branch scope.
    const member = allMembers.find((m) => m.id === memberId);
    renewMember(memberId, 12);
    if (member) toast.success(`${member.name} renewed for 12 months`);
    setRenewMemberState(null);
  };

  const handleBulkRenew = () => {
    selectedMembers.forEach((m) => renewMember(m.id, 12));
    toast.success(
      `Renewed ${selectedMembers.length} member${selectedMembers.length === 1 ? "" : "s"} for 12 months`,
    );
    handleClearSelection();
  };

  const handleSuggestOffer = (member: Member) => {
    // For V1, "Suggest Offer" reuses the AI retention email modal but with a renewal-offer-flavoured prompt.
    // The modal already pulls personalized context from the member.
    setEmailMember(member);
    toast.info(`AI is drafting a personalized retention offer for ${member.name}…`);
  };

  const tabs: Array<{ id: FilterMode; label: string; count: number }> = [
    { id: "all", label: "All at-risk", count: atRiskUniverse.length },
    {
      id: "critical",
      label: "Critical (70+)",
      count: atRiskUniverse.filter((m) => (m.riskScore || 0) >= 70).length,
    },
    {
      id: "high",
      label: "High (40-69)",
      count: atRiskUniverse.filter(
        (m) => (m.riskScore || 0) >= 40 && (m.riskScore || 0) < 70,
      ).length,
    },
    {
      id: "expiring",
      label: "Expiring ≤30d",
      count: atRiskUniverse.filter((m) => {
        const d = (new Date(m.contractEnd).getTime() - now) / DAY;
        return d > 0 && d <= 30;
      }).length,
    },
    {
      id: "ghosting",
      label: "Ghosting ≥14d",
      count: atRiskUniverse.filter((m) => (m.daysSinceLastVisit || 0) >= 14).length,
    },
  ];

  return (
    <div className="max-w-[1440px] mx-auto animate-in fade-in duration-300">
      <div className="mb-5 flex items-baseline justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold font-heading text-cs-black">Renewals & Risk</h1>
          <p className="text-sm text-cs-gray-500 mt-1">
            Protect revenue. Spot churn before it happens. Act in one click.
          </p>
        </div>
        {selectedBranch && (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-cs-red-bg text-cs-red text-[12px] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-cs-red" />
            Scoped to {selectedBranch.name}
          </span>
        )}
      </div>

      <RenewalHero members={members} />

      <div>
        <div className="flex items-center gap-1.5 mb-4 flex-wrap">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setFilterMode(tab.id);
                handleClearSelection();
              }}
              className={cn(
                "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[13px] font-medium transition-colors border",
                filterMode === tab.id
                  ? "bg-cs-red text-white border-cs-red shadow-sm"
                  : "bg-white text-cs-gray-700 border-cs-gray-200 hover:border-cs-gray-300 hover:text-cs-black",
              )}
            >
              {tab.label}
              <span
                className={cn(
                  "tabular-nums text-[11px] font-semibold px-1.5 py-0.5 rounded",
                  filterMode === tab.id
                    ? "bg-white/20 text-white"
                    : "bg-cs-gray-100 text-cs-gray-700",
                )}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <RiskTable
          members={filteredMembers}
          getBranchName={getBranchName}
          selectedIds={selectedIds}
          onToggleSelect={handleToggleSelect}
          onToggleSelectAll={handleToggleSelectAll}
          onRenew={setRenewMemberState}
          onEmail={setEmailMember}
          onSuggestOffer={handleSuggestOffer}
        />
      </div>

      <SelectionToolbar
        selectedMembers={selectedMembers}
        onBulkEmail={() => setBulkOpen(true)}
        onBulkRenew={handleBulkRenew}
        onClear={handleClearSelection}
      />

      <BulkEmailModal
        key={bulkOpen ? `bulk-${selectedMembers.length}` : "closed"}
        open={bulkOpen}
        members={selectedMembers}
        onClose={() => setBulkOpen(false)}
        onSendComplete={() => {
          setBulkOpen(false);
          handleClearSelection();
        }}
      />

      <RenewalModal
        member={renewMemberState}
        isOpen={!!renewMemberState}
        onClose={() => setRenewMemberState(null)}
        onConfirm={handleConfirmRenewal}
      />

      {emailMember && (
        <AIEmailModal
          isOpen={!!emailMember}
          onClose={() => setEmailMember(null)}
          member={emailMember}
        />
      )}
    </div>
  );
}
