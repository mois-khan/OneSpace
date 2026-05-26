"use client";

import { useMemo } from "react";
import { Member } from "@/types";
import { formatCurrency, cn } from "@/lib/utils";
import {
  Sparkles,
  RefreshCcw,
  Mail,
  CheckSquare,
  Square,
  Calendar,
  TrendingDown,
  Ticket,
  Activity,
  type LucideIcon,
} from "lucide-react";
import Link from "next/link";
import { useNow } from "@/lib/store";

interface RiskTableProps {
  members: Member[];
  getBranchName: (id: string) => string;
  selectedIds: Set<string>;
  onToggleSelect: (id: string) => void;
  onToggleSelectAll: () => void;
  onRenew: (member: Member) => void;
  onEmail: (member: Member) => void;
  onSuggestOffer: (member: Member) => void;
}

const DAY = 24 * 60 * 60 * 1000;

interface RiskFactor {
  icon: LucideIcon;
  label: string;
  tone: "critical" | "warning" | "info";
}

export function RiskTable({
  members,
  getBranchName,
  selectedIds,
  onToggleSelect,
  onToggleSelectAll,
  onRenew,
  onEmail,
  onSuggestOffer,
}: RiskTableProps) {
  const now = useNow();

  const getDaysLeft = (endDate: string) =>
    Math.ceil((new Date(endDate).getTime() - now) / DAY);

  const getFactors = (member: Member): RiskFactor[] => {
    const out: RiskFactor[] = [];
    const days = getDaysLeft(member.contractEnd);
    if (days <= 0) {
      out.push({ icon: Calendar, label: "Contract expired", tone: "critical" });
    } else if (days <= 14) {
      out.push({ icon: Calendar, label: `Expires in ${days}d`, tone: "critical" });
    } else if (days <= 30) {
      out.push({ icon: Calendar, label: `Expires in ${days}d`, tone: "warning" });
    }
    if ((member.daysSinceLastVisit || 0) >= 14) {
      out.push({
        icon: TrendingDown,
        label: `No visit ${member.daysSinceLastVisit}d`,
        tone: "warning",
      });
    } else if ((member.daysSinceLastVisit || 0) >= 7) {
      out.push({
        icon: Activity,
        label: `Low usage ${member.daysSinceLastVisit}d`,
        tone: "info",
      });
    }
    if (member.tickets && member.tickets.length > 0) {
      out.push({
        icon: Ticket,
        label: `${member.tickets.length} open ticket${member.tickets.length === 1 ? "" : "s"}`,
        tone: "warning",
      });
    }
    if (out.length === 0) {
      out.push({ icon: Activity, label: "Usage declining", tone: "info" });
    }
    return out;
  };

  const allSelected = useMemo(
    () => members.length > 0 && members.every((m) => selectedIds.has(m.id)),
    [members, selectedIds],
  );

  return (
    <div className="bg-white border border-cs-gray-200 rounded-xl overflow-hidden shadow-[0_1px_2px_rgba(17,24,39,0.04)] flex flex-col">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-cs-gray-50/60 sticky top-0 z-10 text-[10px] uppercase text-cs-gray-500 tracking-wider border-b border-cs-gray-100">
            <tr>
              <th className="px-4 py-3 w-10">
                <button
                  onClick={onToggleSelectAll}
                  className="text-cs-gray-500 hover:text-cs-black transition-colors flex"
                  aria-label={allSelected ? "Deselect all" : "Select all"}
                >
                  {allSelected ? (
                    <CheckSquare className="w-4 h-4 text-cs-red" />
                  ) : (
                    <Square className="w-4 h-4" />
                  )}
                </button>
              </th>
              <th className="px-3 py-3 font-semibold">Member</th>
              <th className="px-3 py-3 font-semibold">Branch · Plan</th>
              <th className="px-3 py-3 font-semibold text-right">MRR</th>
              <th className="px-3 py-3 font-semibold">Contract end</th>
              <th className="px-3 py-3 font-semibold text-center">Risk</th>
              <th className="px-3 py-3 font-semibold">Why at risk</th>
              <th className="px-3 py-3 font-semibold text-right pr-4">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cs-gray-100">
            {members.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-cs-gray-500 text-[13px]">
                  No members match the current filter. Try widening the risk band.
                </td>
              </tr>
            ) : (
              members.map((member) => {
                const riskScore = member.riskScore || 0;
                const isSelected = selectedIds.has(member.id);
                const factors = getFactors(member);
                const daysLeft = getDaysLeft(member.contractEnd);

                const bandColor =
                  riskScore >= 70
                    ? { bg: "bg-[#DC26261A]", text: "text-status-red", dot: "bg-status-red" }
                    : riskScore >= 40
                    ? { bg: "bg-[#D970061A]", text: "text-status-amber", dot: "bg-status-amber" }
                    : { bg: "bg-[#16A34A1A]", text: "text-status-green", dot: "bg-status-green" };

                return (
                  <tr
                    key={member.id}
                    className={cn(
                      "transition-colors group",
                      isSelected ? "bg-cs-red-bg/40" : "hover:bg-cs-gray-50/60",
                    )}
                  >
                    <td className="px-4 py-3">
                      <button
                        onClick={() => onToggleSelect(member.id)}
                        className="text-cs-gray-500 hover:text-cs-black transition-colors flex"
                        aria-label={isSelected ? "Deselect" : "Select"}
                      >
                        {isSelected ? (
                          <CheckSquare className="w-4 h-4 text-cs-red" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </td>
                    <td className="px-3 py-3">
                      <Link
                        href={`/members/${member.id}`}
                        className="flex items-center gap-2.5 group/name"
                      >
                        <span className="w-7 h-7 rounded-full bg-cs-gray-100 flex items-center justify-center text-[11px] font-bold text-cs-gray-700 border border-cs-gray-200 shrink-0">
                          {member.name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .substring(0, 2)
                            .toUpperCase()}
                        </span>
                        <span className="min-w-0">
                          <div className="text-[13px] font-semibold text-cs-black group-hover/name:text-cs-red transition-colors truncate">
                            {member.name}
                          </div>
                          {member.company && (
                            <div className="text-[11px] text-cs-gray-500 truncate">
                              {member.company}
                            </div>
                          )}
                        </span>
                      </Link>
                    </td>
                    <td className="px-3 py-3">
                      <div className="text-[12px] font-medium text-cs-gray-700">
                        {getBranchName(member.branchId)}
                      </div>
                      <div className="text-[11px] text-cs-gray-500 capitalize">
                        {member.planType.replace("_", " ")}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-right tabular-nums font-medium text-cs-black">
                      {formatCurrency(member.monthlyFee)}
                    </td>
                    <td className="px-3 py-3">
                      <div
                        className={cn(
                          "text-[12px] font-medium tabular-nums",
                          daysLeft <= 7
                            ? "text-status-red"
                            : daysLeft <= 30
                            ? "text-status-amber"
                            : "text-cs-gray-700",
                        )}
                      >
                        {daysLeft <= 0 ? "Expired" : `${daysLeft}d left`}
                      </div>
                      <div className="text-[11px] text-cs-gray-500">
                        {new Date(member.contractEnd).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </div>
                    </td>
                    <td className="px-3 py-3 text-center">
                      <span
                        className={cn(
                          "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[12px] font-bold tabular-nums",
                          bandColor.bg,
                          bandColor.text,
                        )}
                      >
                        <span className={cn("w-1.5 h-1.5 rounded-full", bandColor.dot)} />
                        {riskScore}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex flex-wrap gap-1 max-w-[260px]">
                        {factors.slice(0, 3).map((f, i) => {
                          const Icon = f.icon;
                          return (
                            <span
                              key={i}
                              className={cn(
                                "inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium",
                                f.tone === "critical"
                                  ? "bg-[#DC26261A] text-status-red"
                                  : f.tone === "warning"
                                  ? "bg-[#D970061A] text-status-amber"
                                  : "bg-cs-gray-100 text-cs-gray-700",
                              )}
                            >
                              <Icon className="w-2.5 h-2.5" />
                              {f.label}
                            </span>
                          );
                        })}
                        {factors.length > 3 && (
                          <span className="text-[10px] text-cs-gray-500 px-1 py-0.5">
                            +{factors.length - 3}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-3 py-3 pr-4 text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => onSuggestOffer(member)}
                          title="AI Suggest Offer"
                          className="p-1.5 rounded-md text-cs-gray-500 hover:text-cs-red hover:bg-cs-red-bg/60 transition-colors"
                          aria-label="AI Suggest Offer"
                        >
                          <Sparkles className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onEmail(member)}
                          title="Draft retention email"
                          className="p-1.5 rounded-md text-cs-gray-500 hover:text-cs-black hover:bg-cs-gray-50 transition-colors"
                          aria-label="Email"
                        >
                          <Mail className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => onRenew(member)}
                          className="ml-1 inline-flex items-center gap-1.5 px-2.5 py-1 bg-cs-red text-white text-[12px] font-medium rounded-md hover:bg-cs-red-dark transition-colors shadow-sm"
                        >
                          <RefreshCcw className="w-3 h-3" />
                          Renew
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
