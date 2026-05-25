import React from "react";
import { Lead } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { MoreHorizontal, User, Clock, ArrowRight } from "lucide-react";

interface LeadCardProps {
  lead: Lead;
  onConvert?: (lead: Lead) => void;
  onDragStart?: (e: React.DragEvent, id: string) => void;
}

export function LeadCard({ lead, onConvert, onDragStart }: LeadCardProps) {
  const getDaysInStage = () => {
    // Assuming createdAt is when it entered the current stage for demo simplicity
    const created = new Date(lead.createdAt).getTime();
    const now = new Date().getTime();
    return Math.max(0, Math.floor((now - created) / (1000 * 60 * 60 * 24)));
  };

  const daysInStage = getDaysInStage();
  const isStale = daysInStage > 7;

  return (
    <div 
      className={`bg-white border rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing group ${lead.stage === "won" ? "border-green-200" : "border-cs-gray-200"}`}
      draggable={!!onDragStart}
      onDragStart={(e) => onDragStart && onDragStart(e, lead.id)}
    >
      <div className="flex justify-between items-start mb-2">
        <div>
          <h4 className="font-semibold text-cs-black leading-tight">{lead.name}</h4>
          {lead.company && <p className="text-xs text-cs-gray-500 mt-0.5">{lead.company}</p>}
        </div>
        <button className="text-cs-gray-400 hover:text-cs-black opacity-0 group-hover:opacity-100 transition-opacity">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5 mb-3">
        <span className="text-[10px] font-medium bg-cs-gray-100 text-cs-gray-600 px-2 py-0.5 rounded border border-cs-gray-200">
          {lead.planType}
        </span>
        <span className="text-[10px] font-medium bg-cs-gray-100 text-cs-gray-600 px-2 py-0.5 rounded border border-cs-gray-200">
          {lead.source}
        </span>
      </div>

      <div className="text-sm font-semibold text-cs-black mb-3">
        {formatCurrency(lead.mrr || 0)} <span className="text-xs font-normal text-cs-gray-500">/mo</span>
      </div>

      <div className="flex items-center justify-between text-xs pt-3 border-t border-cs-gray-100">
        <div className="flex items-center gap-1.5 text-cs-gray-500">
          <User className="w-3.5 h-3.5" />
          <span>{lead.assignedTo || "Unassigned"}</span>
        </div>
        <div className={`flex items-center gap-1.5 font-medium ${isStale ? "text-red-500" : "text-cs-gray-400"}`}>
          <Clock className="w-3.5 h-3.5" />
          <span>{daysInStage}d</span>
        </div>
      </div>

      {lead.lossReason && (
        <div className="mt-3 text-xs text-red-600 bg-red-50 p-1.5 rounded text-center border border-red-100 font-medium">
          {lead.lossReason}
        </div>
      )}

      {lead.stage === "won" && onConvert && (
        <button 
          onClick={() => onConvert(lead)}
          className="w-full mt-3 py-2 bg-cs-red text-white text-xs font-medium rounded-lg hover:bg-cs-red-dark transition-colors flex items-center justify-center gap-1.5 shadow-sm"
        >
          Convert to Member <ArrowRight className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
