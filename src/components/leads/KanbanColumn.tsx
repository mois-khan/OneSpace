"use client";

import React from "react";
import { Lead } from "@/types";
import { LeadCard } from "./LeadCard";
import { formatCurrency, cn } from "@/lib/utils";

interface KanbanColumnProps {
  id: string;
  title: string;
  description?: string;
  leads: Lead[];
  onConvert?: (lead: Lead) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDrop: (e: React.DragEvent, stageId: string) => void;
  onDragOver: (e: React.DragEvent) => void;
}

const STAGE_ACCENT: Record<string, string> = {
  new: "bg-status-blue",
  toured: "bg-status-amber",
  proposal: "bg-cs-red",
  negotiating: "bg-status-green",
};

export function KanbanColumn({
  id,
  title,
  description,
  leads,
  onConvert,
  onDragStart,
  onDrop,
  onDragOver,
}: KanbanColumnProps) {
  const totalValue = leads.reduce((sum, l) => sum + (l.mrr || 0), 0);
  const accent = STAGE_ACCENT[id] || "bg-cs-gray-500";

  return (
    <div
      className="flex-shrink-0 w-[300px] flex flex-col h-full bg-cs-gray-50/40 rounded-xl border border-cs-gray-200 overflow-hidden"
      onDrop={(e) => onDrop(e, id)}
      onDragOver={onDragOver}
    >
      <div className="p-3.5 border-b border-cs-gray-200 bg-white">
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-2 min-w-0">
            <span className={cn("w-1.5 h-1.5 rounded-full", accent)} />
            <h3 className="font-semibold text-cs-black text-[14px] truncate">{title}</h3>
            <span className="text-[11px] font-semibold tabular-nums px-1.5 py-0.5 rounded-md bg-cs-gray-100 text-cs-gray-700">
              {leads.length}
            </span>
          </div>
        </div>
        <p className="text-[11px] text-cs-gray-500 flex items-baseline justify-between">
          <span>{description || "Drag cards to move"}</span>
          {totalValue > 0 && (
            <span className="font-semibold text-cs-black tabular-nums">
              {formatCurrency(totalValue)}
            </span>
          )}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-2.5 space-y-2.5 min-h-[150px]">
        {leads.map((lead) => (
          <LeadCard
            key={lead.id}
            lead={lead}
            onConvert={onConvert}
            onDragStart={onDragStart}
          />
        ))}
        {leads.length === 0 && (
          <div className="h-20 border-2 border-dashed border-cs-gray-200 rounded-xl flex items-center justify-center text-xs font-medium text-cs-gray-500">
            Drop a lead here
          </div>
        )}
      </div>
    </div>
  );
}
