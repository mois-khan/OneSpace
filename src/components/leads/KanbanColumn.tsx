import React from "react";
import { Lead } from "@/types";
import { LeadCard } from "./LeadCard";
import { formatCurrency } from "@/lib/utils";

interface KanbanColumnProps {
  id: string;
  title: string;
  leads: Lead[];
  onConvert?: (lead: Lead) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onDrop: (e: React.DragEvent, stageId: string) => void;
  onDragOver: (e: React.DragEvent) => void;
}

export function KanbanColumn({ 
  id, 
  title, 
  leads, 
  onConvert, 
  onDragStart, 
  onDrop, 
  onDragOver 
}: KanbanColumnProps) {
  const isWon = id === "won";
  const totalValue = leads.reduce((sum, l) => sum + (l.mrr || 0), 0);

  return (
    <div 
      className="flex-shrink-0 w-[280px] flex flex-col h-full bg-cs-gray-50/50 rounded-xl border border-cs-gray-200 overflow-hidden"
      onDrop={(e) => onDrop(e, id)}
      onDragOver={onDragOver}
    >
      <div className={`p-4 border-b ${isWon ? 'bg-gradient-to-r from-yellow-50 to-amber-50/30 border-amber-200' : 'bg-cs-gray-100/50 border-cs-gray-200'}`}>
        <div className="flex items-center justify-between mb-1">
          <h3 className={`font-semibold ${isWon ? 'text-amber-700' : 'text-cs-black'}`}>
            {title}
          </h3>
          <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isWon ? 'bg-amber-200 text-amber-800' : 'bg-cs-gray-200 text-cs-gray-700'}`}>
            {leads.length}
          </span>
        </div>
        <p className="text-xs font-medium text-cs-gray-500">
          {formatCurrency(totalValue)} potential
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-3 min-h-[150px]">
        {leads.map((lead) => (
          <LeadCard 
            key={lead.id} 
            lead={lead} 
            onConvert={onConvert} 
            onDragStart={onDragStart} 
          />
        ))}
        {leads.length === 0 && (
          <div className="h-24 border-2 border-dashed border-cs-gray-200 rounded-xl flex items-center justify-center text-xs font-medium text-cs-gray-400">
            Drop leads here
          </div>
        )}
      </div>
    </div>
  );
}
