"use client";

import { useState, useMemo } from "react";
import { useAllMembers, useBranches, useAppActions, useNow } from "@/lib/store";
import type { Member } from "@/types";
import { RenewalKPIs } from "@/components/renewals/RenewalKPIs";
import { RiskTable } from "@/components/renewals/RiskTable";
import { RenewalModal } from "@/components/renewals/RenewalModal";
import { AIEmailModal } from "@/components/members/AIEmailModal";
import { toast } from "sonner";

const DAY = 24 * 60 * 60 * 1000;

export default function RenewalsPage() {
  const members = useAllMembers();
  const branches = useBranches();
  const now = useNow();
  const { renewMember } = useAppActions();
  const [filterMode, setFilterMode] = useState<"all" | "high" | "medium" | "expiring">("all");
  const [renewMemberState, setRenewMemberState] = useState<Member | null>(null);
  const [emailMember, setEmailMember] = useState<Member | null>(null);

  const getBranchName = (id: string) => branches.find((b) => b.id === id)?.name || "Unknown";

  const filteredMembers = useMemo(() => {
    const daysLeft = (endDate: string) =>
      Math.ceil((new Date(endDate).getTime() - now) / DAY);

    const list = members
      .filter((m) => (m.riskScore || 0) > 0 || daysLeft(m.contractEnd) <= 45)
      .sort((a, b) => (b.riskScore || 0) - (a.riskScore || 0));

    if (filterMode === "high") return list.filter((m) => (m.riskScore || 0) >= 70);
    if (filterMode === "medium")
      return list.filter((m) => (m.riskScore || 0) >= 40 && (m.riskScore || 0) < 70);
    if (filterMode === "expiring") return list.filter((m) => daysLeft(m.contractEnd) <= 30);
    return list;
  }, [members, filterMode, now]);

  const handleConfirmRenewal = (memberId: string) => {
    const member = members.find((m) => m.id === memberId);
    renewMember(memberId, 12);
    if (member) {
      toast.success(`${member.name} renewed for 12 months`);
    }
    setRenewMemberState(null);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] animate-in fade-in duration-500 bg-cs-gray-50/30 overflow-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-heading text-cs-black">Renewals & Risk</h1>
        <p className="text-sm text-cs-gray-500 mt-1">
          Identify at-risk revenue and take proactive action. Counts here match the dashboard exactly.
        </p>
      </div>

      <RenewalKPIs members={members} />

      <div className="flex-1 min-h-[400px] flex flex-col">
        <div className="flex items-center gap-2 mb-4 border-b border-cs-gray-200 pb-2">
          {[
            { id: "all" as const, label: "All At-Risk" },
            { id: "high" as const, label: "High Risk (70+)" },
            { id: "medium" as const, label: "Medium Risk (40-69)" },
            { id: "expiring" as const, label: "Expiring <30d" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilterMode(tab.id)}
              className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors relative ${
                filterMode === tab.id ? "text-cs-red" : "text-cs-gray-500 hover:text-cs-black"
              }`}
            >
              {tab.label}
              {filterMode === tab.id && (
                <div className="absolute bottom-[-2px] left-0 right-0 h-0.5 bg-cs-red rounded-t-sm" />
              )}
            </button>
          ))}
        </div>

        <RiskTable
          members={filteredMembers}
          getBranchName={getBranchName}
          onRenew={setRenewMemberState}
          onEmail={setEmailMember}
        />
      </div>

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
