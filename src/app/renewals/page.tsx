"use client";

import React, { useState, useMemo } from "react";
import { members, branches } from "@/lib/data/seed";
import { Member } from "@/types";
import { RenewalKPIs } from "@/components/renewals/RenewalKPIs";
import { RiskTable } from "@/components/renewals/RiskTable";
import { RenewalModal } from "@/components/renewals/RenewalModal";
import { AIEmailModal } from "@/components/members/AIEmailModal";

export default function RenewalsPage() {
  const [filterMode, setFilterMode] = useState<"all" | "high" | "medium" | "expiring">("all");
  const [membersList, setMembersList] = useState<Member[]>(members);
  
  // Modals state
  const [renewMember, setRenewMember] = useState<Member | null>(null);
  const [emailMember, setEmailMember] = useState<Member | null>(null);

  const getBranchName = (id: string) => branches.find((b) => b.id === id)?.name || "Unknown";

  const getDaysLeft = (endDate: string) => {
    const end = new Date(endDate).getTime();
    const now = new Date().getTime();
    return Math.ceil((end - now) / (1000 * 60 * 60 * 24));
  };

  const filteredMembers = useMemo(() => {
    let list = membersList.filter(m => (m.riskScore || 0) > 0 || getDaysLeft(m.contractEnd) <= 45);
    
    // Sort by risk score desc
    list = list.sort((a, b) => (b.riskScore || 0) - (a.riskScore || 0));

    if (filterMode === "high") return list.filter(m => (m.riskScore || 0) >= 70);
    if (filterMode === "medium") return list.filter(m => (m.riskScore || 0) >= 40 && (m.riskScore || 0) < 70);
    if (filterMode === "expiring") return list.filter(m => getDaysLeft(m.contractEnd) <= 30);
    return list;
  }, [membersList, filterMode]);

  const handleConfirmRenewal = (memberId: string) => {
    setMembersList(prev => prev.map(m => {
      if (m.id === memberId) {
        // Extend contract by 1 year and reset risk score
        const newEnd = new Date(m.contractEnd);
        newEnd.setFullYear(newEnd.getFullYear() + 1);
        return {
          ...m,
          contractEnd: newEnd.toISOString(),
          riskScore: 0,
          status: "active"
        };
      }
      return m;
    }));
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] animate-in fade-in duration-500 bg-cs-gray-50/30 overflow-auto p-6">
      
      <div className="mb-6">
        <h1 className="text-2xl font-bold font-heading text-cs-black">Renewals & Risk</h1>
        <p className="text-sm text-cs-gray-500 mt-1">Identify at-risk revenue and take proactive action.</p>
      </div>

      <RenewalKPIs members={membersList} />

      <div className="flex-1 min-h-[400px] flex flex-col">
        {/* Filter Tabs */}
        <div className="flex items-center gap-2 mb-4 border-b border-cs-gray-200 pb-2">
          {[
            { id: "all", label: "All At-Risk" },
            { id: "high", label: "High Risk (70+)" },
            { id: "medium", label: "Medium Risk (40-69)" },
            { id: "expiring", label: "Expiring <30d" }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setFilterMode(tab.id as any)}
              className={`px-4 py-2 text-sm font-semibold rounded-t-lg transition-colors relative ${
                filterMode === tab.id 
                  ? 'text-cs-red' 
                  : 'text-cs-gray-500 hover:text-cs-black'
              }`}
            >
              {tab.label}
              {filterMode === tab.id && (
                <div className="absolute bottom-[-2px] left-0 right-0 h-0.5 bg-cs-red rounded-t-sm" />
              )}
            </button>
          ))}
        </div>

        {/* Table */}
        <RiskTable 
          members={filteredMembers} 
          getBranchName={getBranchName}
          onRenew={setRenewMember}
          onEmail={setEmailMember}
        />
      </div>

      {/* Modals */}
      <RenewalModal 
        member={renewMember} 
        isOpen={!!renewMember} 
        onClose={() => setRenewMember(null)} 
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
