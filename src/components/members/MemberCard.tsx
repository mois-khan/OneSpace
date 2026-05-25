import React from "react";
import Link from "next/link";
import { Member } from "@/types";
import { RiskBar } from "@/components/members/RiskBar";
import { formatCurrency } from "@/lib/utils";
import { MapPin, Briefcase, Calendar, CreditCard, MessageSquare } from "lucide-react";

interface MemberCardProps {
  member: Member;
  branchName: string;
}

export function MemberCard({ member, branchName }: MemberCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  const riskScore = member.riskScore || 0;
  let badgeColor = "bg-green-100 text-green-700 border-green-200";
  let badgeIcon = "✓";
  if (riskScore >= 70) {
    badgeColor = "bg-red-100 text-red-700 border-red-200";
    badgeIcon = "⚠";
  } else if (riskScore >= 40) {
    badgeColor = "bg-amber-100 text-amber-700 border-amber-200";
    badgeIcon = "!";
  }

  return (
    <div className="bg-white rounded-xl border border-cs-gray-200 overflow-hidden hover:shadow-md transition-shadow group relative flex flex-col">
      {/* Hover red border top */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-cs-red scale-x-0 origin-left group-hover:scale-x-100 transition-transform duration-300 ease-out" />

      <div className="p-5 flex-1">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-cs-red-bg flex items-center justify-center text-cs-red font-bold text-lg border border-cs-red/20 flex-shrink-0">
              {getInitials(member.name)}
            </div>
            <div>
              <h3 className="font-semibold text-cs-black">{member.name}</h3>
              <p className="text-sm text-cs-gray-500 flex items-center gap-1.5">
                <Briefcase className="w-3.5 h-3.5" />
                {member.company || "Independent"}
              </p>
            </div>
          </div>
          {riskScore > 0 && (
            <div className={`text-xs font-semibold px-2 py-1 rounded-full border ${badgeColor} flex items-center gap-1`}>
              {riskScore} {badgeIcon}
            </div>
          )}
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          <span className="text-[11px] font-medium px-2 py-1 bg-cs-gray-50 text-cs-gray-600 rounded-md border border-cs-gray-100 flex items-center gap-1">
            <MapPin className="w-3 h-3" />
            {branchName}
          </span>
          <span className="text-[11px] font-medium px-2 py-1 bg-cs-gray-50 text-cs-gray-600 rounded-md border border-cs-gray-100 capitalize">
            {member.planType.replace("_", " ")}
          </span>
        </div>

        {/* Metrics */}
        <div className="space-y-2 mb-5">
          <div className="flex items-center gap-2 text-xs text-cs-gray-600">
            <Calendar className="w-3.5 h-3.5" />
            <span className="truncate">Ends {new Date(member.contractEnd).toLocaleDateString("en-US", { month: "short", year: "numeric", day: "numeric" })}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-cs-gray-600">
            <CreditCard className="w-3.5 h-3.5" />
            <span>{formatCurrency(member.monthlyFee)}/mo</span>
          </div>
        </div>

        {/* Risk Bar */}
        <div className="mt-auto">
          <div className="flex justify-between text-[10px] text-cs-gray-500 mb-1.5">
            <span>Retention Health</span>
            <span className="font-medium">{riskScore >= 70 ? "High Risk" : riskScore >= 40 ? "Needs Attention" : "Healthy"}</span>
          </div>
          <RiskBar score={riskScore} />
        </div>
      </div>

      {/* Footer Actions */}
      <div className="border-t border-cs-gray-100 p-3 grid grid-cols-3 gap-2 bg-cs-gray-50/50">
        <Link href={`/members/${member.id}`} className="flex items-center justify-center py-1.5 text-xs font-medium text-cs-gray-700 hover:text-cs-black hover:bg-cs-gray-100 rounded-md transition-colors">
          View
        </Link>
        <button className="flex items-center justify-center py-1.5 text-xs font-medium text-cs-gray-700 hover:text-cs-black hover:bg-cs-gray-100 rounded-md transition-colors">
          Renew
        </button>
        <button className="flex items-center justify-center py-1.5 text-xs font-medium text-cs-gray-700 hover:text-cs-black hover:bg-cs-gray-100 rounded-md transition-colors">
          Message
        </button>
      </div>
    </div>
  );
}
