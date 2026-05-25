"use client";

import React, { useState } from "react";
import { Member } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Sparkles, CalendarCheck, MoreHorizontal, CheckSquare, Square } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

interface RiskTableProps {
  members: Member[];
  getBranchName: (id: string) => string;
  onRenew: (member: Member) => void;
  onEmail: (member: Member) => void;
}

export function RiskTable({ members, getBranchName, onRenew, onEmail }: RiskTableProps) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelectAll = () => {
    if (selectedIds.size === members.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(members.map(m => m.id)));
    }
  };

  const toggleSelect = (id: string) => {
    const newSet = new Set(selectedIds);
    if (newSet.has(id)) newSet.delete(id);
    else newSet.add(id);
    setSelectedIds(newSet);
  };

  const handleBulkReminders = () => {
    toast.success(`Reminders sent to ${selectedIds.size} members via WhatsApp.`);
    setSelectedIds(new Set());
  };

  const getDaysLeft = (endDate: string) => {
    const end = new Date(endDate).getTime();
    const now = new Date().getTime();
    const days = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    return days;
  };

  // Generate mock factors based on risk score
  const getFactors = (member: Member) => {
    const factors = [];
    if ((member.daysSinceLastVisit || 0) > 14) factors.push("Visits declining");
    if (member.tickets && member.tickets.length > 0) factors.push(`${member.tickets.length} open tickets`);
    const daysLeft = getDaysLeft(member.contractEnd);
    if (daysLeft < 30) factors.push(`Contract soon (${daysLeft}d)`);
    
    if (factors.length === 0) factors.push("Low usage");
    return factors;
  };

  return (
    <div className="bg-white border border-cs-gray-200 rounded-xl overflow-hidden shadow-sm flex flex-col h-full">
      
      {/* Table Toolbar */}
      <div className="px-6 py-4 border-b border-cs-gray-200 bg-cs-gray-50 flex items-center justify-between min-h-[64px]">
        {selectedIds.size > 0 ? (
          <div className="flex items-center gap-4 animate-in fade-in duration-200">
            <span className="text-sm font-semibold text-cs-black">
              {selectedIds.size} member{selectedIds.size > 1 ? 's' : ''} selected
            </span>
            <button 
              onClick={handleBulkReminders}
              className="px-3 py-1.5 bg-cs-black text-white text-sm font-medium rounded-md hover:bg-cs-gray-800 transition-colors shadow-sm"
            >
              Send reminders to {selectedIds.size} selected
            </button>
            <button 
              onClick={() => setSelectedIds(new Set())}
              className="text-sm text-cs-gray-500 hover:text-cs-black font-medium"
            >
              Cancel
            </button>
          </div>
        ) : (
          <h3 className="font-semibold text-cs-black font-heading">At-Risk Members</h3>
        )}
      </div>

      <div className="overflow-x-auto flex-1">
        <table className="w-full text-sm text-left">
          <thead className="bg-white sticky top-0 z-10 text-xs uppercase text-cs-gray-500 border-b border-cs-gray-200">
            <tr>
              <th className="px-6 py-4 w-12">
                <button onClick={toggleSelectAll} className="text-cs-gray-400 hover:text-cs-black">
                  {selectedIds.size === members.length && members.length > 0 ? (
                    <CheckSquare className="w-5 h-5 text-cs-red" />
                  ) : (
                    <Square className="w-5 h-5" />
                  )}
                </button>
              </th>
              <th className="px-6 py-4 font-semibold">Member</th>
              <th className="px-6 py-4 font-semibold">Branch & Plan</th>
              <th className="px-6 py-4 font-semibold">MRR</th>
              <th className="px-6 py-4 font-semibold">Contract End</th>
              <th className="px-6 py-4 font-semibold text-center">Risk</th>
              <th className="px-6 py-4 font-semibold">Factors</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cs-gray-100">
            {members.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-cs-gray-500">
                  No at-risk members found for the current filters.
                </td>
              </tr>
            ) : members.map(member => {
              const riskScore = member.riskScore || 0;
              let badgeColor = "bg-green-100 text-green-700 border-green-200";
              let dotColor = "bg-green-500";
              if (riskScore >= 70) {
                badgeColor = "bg-red-100 text-red-700 border-red-200";
                dotColor = "bg-red-500";
              }
              else if (riskScore >= 40) {
                badgeColor = "bg-amber-100 text-amber-700 border-amber-200";
                dotColor = "bg-amber-500";
              }

              const isSelected = selectedIds.has(member.id);
              const factors = getFactors(member);

              return (
                <tr key={member.id} className={`transition-colors group ${isSelected ? 'bg-red-50/50' : 'hover:bg-cs-gray-50/50'}`}>
                  <td className="px-6 py-4">
                    <button onClick={() => toggleSelect(member.id)} className="text-cs-gray-400 hover:text-cs-black">
                      {isSelected ? (
                        <CheckSquare className="w-5 h-5 text-cs-red" />
                      ) : (
                        <Square className="w-5 h-5" />
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-cs-gray-100 flex items-center justify-center text-xs font-bold text-cs-gray-600 border border-cs-gray-200 flex-shrink-0">
                        {member.name.split(" ").map(n => n[0]).join("").substring(0,2).toUpperCase()}
                      </div>
                      <p className="font-semibold text-cs-black hover:text-cs-red cursor-pointer">
                        <Link href={`/members/${member.id}`}>{member.name}</Link>
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-cs-gray-700">{getBranchName(member.branchId)}</p>
                    <p className="text-xs text-cs-gray-500 capitalize">{member.planType.replace("_", " ")}</p>
                  </td>
                  <td className="px-6 py-4 font-medium text-cs-black">
                    {formatCurrency(member.monthlyFee)}
                  </td>
                  <td className="px-6 py-4">
                    <p className="font-medium text-cs-gray-700">{getDaysLeft(member.contractEnd)}d</p>
                    <p className="text-xs text-cs-gray-500">{new Date(member.contractEnd).toLocaleDateString("en-US", { month: "short", day: "numeric" })}</p>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold border ${badgeColor} min-w-[50px] justify-center`}>
                      {riskScore} <span className={`w-1.5 h-1.5 rounded-full ${dotColor}`}></span>
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {factors.slice(0, 2).map((factor, i) => (
                        <span key={i} className="text-[10px] font-medium bg-cs-gray-100 text-cs-gray-600 px-2 py-0.5 rounded border border-cs-gray-200">
                          {factor}
                        </span>
                      ))}
                      {factors.length > 2 && (
                        <span className="text-[10px] font-medium bg-cs-gray-50 text-cs-gray-500 px-1.5 py-0.5 rounded border border-cs-gray-200">
                          +{factors.length - 2}
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button 
                        onClick={() => onRenew(member)}
                        className="px-3 py-1.5 bg-cs-red text-white text-xs font-semibold rounded-md hover:bg-cs-red-dark transition-colors shadow-sm"
                      >
                        Renew
                      </button>
                      <button 
                        onClick={() => onEmail(member)}
                        className="px-3 py-1.5 bg-white border border-cs-gray-200 text-cs-gray-700 text-xs font-semibold rounded-md hover:bg-cs-gray-50 transition-colors shadow-sm flex items-center gap-1.5"
                      >
                        <Sparkles className="w-3 h-3 text-cs-red" /> Email
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
