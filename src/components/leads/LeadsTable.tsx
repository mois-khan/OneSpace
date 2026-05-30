"use client";

import { useState } from "react";
import { Lead } from "@/types";
import { formatCurrency, cn } from "@/lib/utils";
import { Phone, MessageCircle, Mail, ArrowRight, User, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useNow } from "@/lib/store";

interface LeadsTableProps {
  leads: Lead[];
}

export function LeadsTable({ leads }: LeadsTableProps) {
  const now = useNow();
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: "asc" | "desc" }>({
    key: "createdAt",
    direction: "desc",
  });

  const sortedLeads = [...leads].sort((a, b) => {
    let aVal: any = a[sortConfig.key as keyof Lead];
    let bVal: any = b[sortConfig.key as keyof Lead];

    if (sortConfig.key === "lastActivity") {
      aVal = a.interactions?.[0]?.timestamp || a.createdAt;
      bVal = b.interactions?.[0]?.timestamp || b.createdAt;
    }

    if (aVal < bVal) return sortConfig.direction === "asc" ? -1 : 1;
    if (aVal > bVal) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const handleSort = (key: string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === "asc" ? "desc" : "asc",
    }));
  };

  const getSourceColor = (source: string) => {
    const s = source.toLowerCase();
    if (s.includes("whatsapp")) return "bg-status-green/10 text-status-green border-status-green/20";
    if (s.includes("website")) return "bg-status-blue/10 text-status-blue border-status-blue/20";
    if (s.includes("referral")) return "bg-status-amber/10 text-status-amber border-status-amber/20";
    if (s.includes("walk-in")) return "bg-purple-500/10 text-purple-600 border-purple-500/20";
    return "bg-cs-gray-100 text-cs-gray-700 border-cs-gray-200";
  };

  const getStageColor = (stage: string) => {
    switch (stage) {
      case "new": return "bg-status-blue text-white";
      case "toured": return "bg-status-amber text-white";
      case "proposal": return "bg-cs-red text-white";
      case "negotiating": return "bg-status-green text-white";
      case "won": return "bg-cs-black text-white";
      case "lost": return "bg-cs-gray-500 text-white";
      default: return "bg-cs-gray-200 text-cs-gray-700";
    }
  };

  return (
    <div className="bg-white border border-cs-gray-200 rounded-lg shadow-sm overflow-hidden flex flex-col min-h-0 h-full">
      <div className="overflow-auto flex-1 relative">
        <table className="w-full text-left text-[13px] whitespace-nowrap">
          <thead className="bg-cs-gray-50 border-b border-cs-gray-200 sticky top-0 z-10 text-cs-gray-500 font-medium">
            <tr>
              <th className="px-4 py-3 w-10 text-center">#</th>
              <th className="px-4 py-3">Lead</th>
              <th className="px-4 py-3">Source</th>
              <th className="px-4 py-3 cursor-pointer hover:text-cs-black transition-colors" onClick={() => handleSort("planType")}>
                Plan
              </th>
              <th className="px-4 py-3 cursor-pointer hover:text-cs-black transition-colors" onClick={() => handleSort("mrr")}>
                Budget
              </th>
              <th className="px-4 py-3 cursor-pointer hover:text-cs-black transition-colors" onClick={() => handleSort("lastActivity")}>
                Last Activity
              </th>
              <th className="px-4 py-3 cursor-pointer hover:text-cs-black transition-colors" onClick={() => handleSort("stage")}>
                Stage
              </th>
              <th className="px-4 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cs-gray-100">
            {sortedLeads.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center text-cs-gray-500">
                  No leads found.
                </td>
              </tr>
            ) : (
              sortedLeads.map((lead, idx) => {
                const isUncontacted = lead.stage === "new" && (!lead.interactions || lead.interactions.length === 0);
                const isOverdue = lead.followUpDate && new Date(lead.followUpDate).getTime() < now;

                return (
                  <tr key={lead.id} className={cn("hover:bg-cs-gray-50 transition-colors group", isUncontacted && "border-l-2 border-l-status-red")}>
                    <td className="px-4 py-3 text-center text-cs-gray-400">{idx + 1}</td>
                    <td className="px-4 py-3 min-w-[200px]">
                      <div className="font-semibold text-cs-black">{lead.name}</div>
                      {lead.company && <div className="text-xs text-cs-gray-500 truncate mt-0.5">{lead.company}</div>}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium border", getSourceColor(lead.source))}>
                        {lead.source}
                      </span>
                    </td>
                    <td className="px-4 py-3 font-medium text-cs-gray-700">{lead.planType}</td>
                    <td className="px-4 py-3 font-medium text-cs-black">{formatCurrency(lead.mrr || 0)}</td>
                    <td className="px-4 py-3">
                      {lead.interactions && lead.interactions.length > 0 ? (
                        <div className="text-cs-gray-700">{new Date(lead.interactions[0].timestamp).toLocaleDateString()}</div>
                      ) : (
                        <div className="text-status-red flex items-center gap-1 font-medium">
                          <AlertCircle className="w-3.5 h-3.5" /> No contact
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={cn("inline-flex px-2 py-1 rounded text-[11px] font-semibold uppercase tracking-wider", getStageColor(lead.stage))}>
                        {lead.stage}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <a href={`tel:${lead.phone}`} className="p-1.5 text-cs-gray-500 hover:text-cs-black hover:bg-cs-gray-100 rounded inline-flex" title="Call">
                          <Phone className="w-4 h-4" />
                        </a>
                        <a href={`https://wa.me/${lead.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="p-1.5 text-cs-gray-500 hover:text-status-green hover:bg-[#16A34A1A] rounded inline-flex" title="WhatsApp">
                          <MessageCircle className="w-4 h-4" />
                        </a>
                        <a href={`mailto:${lead.email || ""}`} className="p-1.5 text-cs-gray-500 hover:text-status-blue hover:bg-status-blue/10 rounded inline-flex" title="Email">
                          <Mail className="w-4 h-4" />
                        </a>
                        <Link href={`/leads/${lead.id}`} className="p-1.5 text-cs-gray-500 hover:text-cs-red hover:bg-[#E8192C1A] rounded ml-1 inline-flex" title="View Details">
                          <ArrowRight className="w-4 h-4" />
                        </Link>
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
