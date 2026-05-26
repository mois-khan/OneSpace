"use client";

import { useEffect, useRef, useState } from "react";
import { Lead } from "@/types";
import { formatCurrency, cn } from "@/lib/utils";
import {
  MoreHorizontal,
  User,
  Clock,
  ArrowRight,
  AlertCircle,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { useNow, useAppActions } from "@/lib/store";
import { toast } from "sonner";

interface LeadCardProps {
  lead: Lead;
  onConvert?: (lead: Lead) => void;
  onDragStart?: (e: React.DragEvent, id: string) => void;
  /** Compact mode for the "recently closed" strip — strips action buttons and tightens layout. */
  compact?: boolean;
}

const DAY = 24 * 60 * 60 * 1000;

const STAGE_OPTIONS: Array<{ id: Lead["stage"]; label: string }> = [
  { id: "new", label: "New" },
  { id: "toured", label: "Toured" },
  { id: "proposal", label: "Proposal" },
  { id: "negotiating", label: "Negotiating" },
  { id: "won", label: "Won" },
  { id: "lost", label: "Lost" },
];

export function LeadCard({ lead, onConvert, onDragStart, compact = false }: LeadCardProps) {
  const now = useNow();
  const { moveLead } = useAppActions();
  const daysInStage = Math.max(0, Math.floor((now - new Date(lead.createdAt).getTime()) / DAY));
  const isStale = daysInStage > 7;
  const isVeryStale = daysInStage > 14;

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (!menuRef.current?.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [menuOpen]);

  const handleMove = (stage: Lead["stage"]) => {
    if (stage === lead.stage) {
      setMenuOpen(false);
      return;
    }
    moveLead(lead.id, stage);
    toast.success(`${lead.name} → ${STAGE_OPTIONS.find((s) => s.id === stage)?.label || stage}`);
    setMenuOpen(false);
  };

  const showQuickClose = !compact && (lead.stage === "negotiating" || lead.stage === "proposal");

  const borderClass = compact
    ? lead.stage === "won"
      ? "border-status-green/40"
      : "border-cs-gray-300/60"
    : isVeryStale
    ? "border-status-red/50 bg-[#DC26260A]"
    : isStale
    ? "border-status-amber/50"
    : lead.stage === "won"
    ? "border-status-green/40"
    : "border-cs-gray-200";

  return (
    <div
      className={cn(
        "relative bg-white border rounded-xl shadow-sm hover:shadow-md transition-shadow group",
        compact ? "p-3" : "p-4 cursor-grab active:cursor-grabbing",
        borderClass,
      )}
      draggable={!compact && !!onDragStart}
      onDragStart={(e) => onDragStart && onDragStart(e, lead.id)}
    >
      {!compact && isVeryStale && (
        <div className="mb-2 -mt-1 flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-status-red">
          <AlertCircle className="w-3 h-3" />
          Stale {daysInStage}d — at risk
        </div>
      )}

      <div className={cn("flex justify-between items-start", compact ? "mb-1.5" : "mb-2")}>
        <div className="min-w-0">
          <h4 className={cn("font-semibold text-cs-black leading-tight truncate", compact ? "text-[13px]" : "")}>
            {lead.name}
          </h4>
          {lead.company && (
            <p className={cn("text-cs-gray-500 mt-0.5 truncate", compact ? "text-[11px]" : "text-xs")}>
              {lead.company}
            </p>
          )}
        </div>
        {!compact && (
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen((o) => !o);
              }}
              onMouseDown={(e) => e.stopPropagation()}
              draggable={false}
              className="text-cs-gray-500 hover:text-cs-black opacity-0 group-hover:opacity-100 transition-opacity p-1 -m-1 rounded hover:bg-cs-gray-50"
              aria-label="Lead actions"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            {menuOpen && (
              <div
                className="absolute right-0 top-full mt-1 z-20 w-44 rounded-lg bg-white shadow-[0_12px_32px_-8px_rgba(17,24,39,0.18)] ring-1 ring-cs-gray-300/60 overflow-hidden"
                onMouseDown={(e) => e.stopPropagation()}
              >
                <div className="px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-cs-gray-500 bg-cs-gray-50/60 border-b border-cs-gray-100">
                  Move to
                </div>
                {STAGE_OPTIONS.filter((s) => s.id !== lead.stage).map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMove(s.id);
                    }}
                    className="w-full text-left px-3 py-1.5 text-[13px] text-cs-gray-700 hover:bg-cs-gray-50 hover:text-cs-black transition-colors flex items-center gap-2"
                  >
                    <span
                      className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        s.id === "won"
                          ? "bg-status-green"
                          : s.id === "lost"
                          ? "bg-status-gray"
                          : s.id === "new"
                          ? "bg-status-blue"
                          : s.id === "toured"
                          ? "bg-status-amber"
                          : s.id === "proposal"
                          ? "bg-cs-red"
                          : "bg-status-green",
                      )}
                    />
                    {s.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {!compact && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          <span className="text-[10px] font-medium bg-cs-gray-100 text-cs-gray-700 px-2 py-0.5 rounded border border-cs-gray-200">
            {lead.planType}
          </span>
          <span className="text-[10px] font-medium bg-cs-gray-100 text-cs-gray-700 px-2 py-0.5 rounded border border-cs-gray-200">
            {lead.source}
          </span>
        </div>
      )}

      <div
        className={cn(
          "font-semibold text-cs-black tabular-nums",
          compact ? "text-[13px]" : "text-sm mb-3",
        )}
      >
        {formatCurrency(lead.mrr || 0)}{" "}
        <span className={cn("font-normal text-cs-gray-500", compact ? "text-[10px]" : "text-xs")}>
          /mo
        </span>
      </div>

      {!compact && (
        <div className="flex items-center justify-between text-xs pt-3 border-t border-cs-gray-100">
          <div className="flex items-center gap-1.5 text-cs-gray-500">
            <User className="w-3.5 h-3.5" />
            <span>{lead.assignedTo || "Unassigned"}</span>
          </div>
          <div
            className={cn(
              "flex items-center gap-1.5 font-medium tabular-nums",
              isVeryStale
                ? "text-status-red"
                : isStale
                ? "text-status-amber"
                : "text-cs-gray-500",
            )}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>{daysInStage}d</span>
          </div>
        </div>
      )}

      {!compact && lead.lossReason && (
        <div className="mt-3 text-[11px] text-status-red bg-[#DC26260F] p-2 rounded text-center border border-[#DC26261A] font-medium">
          Lost: {lead.lossReason}
        </div>
      )}

      {/* Quick close on cards in late stages */}
      {showQuickClose && (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleMove("won");
            }}
            onMouseDown={(e) => e.stopPropagation()}
            className="flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[12px] font-medium bg-[#16A34A1A] text-status-green hover:bg-[#16A34A2A] transition-colors"
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            Mark Won
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleMove("lost");
            }}
            onMouseDown={(e) => e.stopPropagation()}
            className="flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[12px] font-medium bg-cs-gray-100 text-cs-gray-700 hover:bg-cs-gray-200 transition-colors"
          >
            <XCircle className="w-3.5 h-3.5" />
            Mark Lost
          </button>
        </div>
      )}

      {!compact && lead.stage === "won" && onConvert && (
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
