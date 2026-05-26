"use client";

import React, { useMemo, useState } from "react";
import { Lead } from "@/types";
import { KanbanColumn } from "./KanbanColumn";
import { LeadCard } from "./LeadCard";
import { OnboardingWizard } from "@/components/members/OnboardingWizard";
import { useAppActions } from "@/lib/store";
import { formatCurrency, cn } from "@/lib/utils";
import { ChevronDown, ChevronUp, CheckCircle2, XCircle } from "lucide-react";

interface KanbanBoardProps {
  leads: Lead[];
}

const ACTIVE_STAGES: Array<{ id: Lead["stage"]; title: string; description: string }> = [
  { id: "new", title: "New", description: "Fresh leads — needs first contact" },
  { id: "toured", title: "Toured", description: "Visited the space" },
  { id: "proposal", title: "Proposal", description: "Quote shared, awaiting feedback" },
  { id: "negotiating", title: "Negotiating", description: "Closing-stage conversation" },
];

export function KanbanBoard({ leads }: KanbanBoardProps) {
  const { moveLead } = useAppActions();
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [showClosed, setShowClosed] = useState(false);

  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [, setConvertingLead] = useState<Lead | null>(null);

  const activeLeads = useMemo(
    () => leads.filter((l) => l.stage !== "won" && l.stage !== "lost"),
    [leads],
  );
  const wonLeads = useMemo(
    () =>
      leads
        .filter((l) => l.stage === "won")
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [leads],
  );
  const lostLeads = useMemo(
    () =>
      leads
        .filter((l) => l.stage === "lost")
        .sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [leads],
  );

  const wonValue = wonLeads.reduce((sum, l) => sum + (l.mrr || 0), 0);
  const lostValue = lostLeads.reduce((sum, l) => sum + (l.mrr || 0), 0);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedLeadId(id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    const id = draggedLeadId || e.dataTransfer.getData("text/plain");
    if (!id) return;
    const lead = leads.find((l) => l.id === id);
    if (!lead || lead.stage === stageId) {
      setDraggedLeadId(null);
      return;
    }
    moveLead(id, stageId as Lead["stage"]);
    setDraggedLeadId(null);
  };

  const handleConvertClick = (lead: Lead) => {
    setConvertingLead(lead);
    setIsWizardOpen(true);
  };

  return (
    <>
      {/* Active pipeline — 4 columns fit comfortably at 1280px+ */}
      <div className="flex-1 overflow-x-auto min-h-0 pb-2">
        <div className="flex gap-4 h-full min-w-max px-6">
          {ACTIVE_STAGES.map((stage) => (
            <KanbanColumn
              key={stage.id}
              id={stage.id}
              title={stage.title}
              description={stage.description}
              leads={activeLeads.filter((l) => l.stage === stage.id)}
              onConvert={handleConvertClick}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            />
          ))}
        </div>
      </div>

      {/* Recently closed — collapsible drawer */}
      <div className="mt-3 mx-6 mb-4 rounded-xl border border-cs-gray-200 bg-white">
        <button
          type="button"
          onClick={() => setShowClosed((s) => !s)}
          className="w-full flex items-center justify-between gap-4 px-4 py-2.5 text-left hover:bg-cs-gray-50/60 transition-colors rounded-xl"
        >
          <div className="flex items-center gap-4 min-w-0">
            <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-cs-gray-500">
              Recently closed
            </span>
            <ClosedTag
              icon={CheckCircle2}
              count={wonLeads.length}
              value={wonValue}
              tone="green"
              label="Won"
            />
            <ClosedTag
              icon={XCircle}
              count={lostLeads.length}
              value={lostValue}
              tone="gray"
              label="Lost"
            />
          </div>
          <span className="text-cs-gray-500">
            {showClosed ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </span>
        </button>

        {showClosed && (
          <div className="border-t border-cs-gray-100 px-4 py-3 space-y-4">
            <ClosedRow
              label="Won"
              icon={CheckCircle2}
              tone="green"
              leads={wonLeads}
              onConvert={handleConvertClick}
              showConvertCta
            />
            <ClosedRow
              label="Lost"
              icon={XCircle}
              tone="gray"
              leads={lostLeads}
            />
          </div>
        )}
      </div>

      <OnboardingWizard
        isOpen={isWizardOpen}
        onClose={() => {
          setIsWizardOpen(false);
          setConvertingLead(null);
        }}
      />
    </>
  );
}

function ClosedTag({
  icon: Icon,
  count,
  value,
  tone,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  count: number;
  value: number;
  tone: "green" | "gray";
  label: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium tabular-nums",
        tone === "green"
          ? "bg-[#16A34A1A] text-status-green"
          : "bg-cs-gray-100 text-cs-gray-700",
      )}
    >
      <Icon className="w-3 h-3" />
      <span className="font-semibold">{count}</span>
      <span className="opacity-80">{label}</span>
      {value > 0 && <span className="opacity-70">· {formatCurrency(value)}</span>}
    </span>
  );
}

function ClosedRow({
  label,
  icon: Icon,
  tone,
  leads,
  onConvert,
  showConvertCta,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  tone: "green" | "gray";
  leads: Lead[];
  onConvert?: (lead: Lead) => void;
  showConvertCta?: boolean;
}) {
  if (leads.length === 0) {
    return (
      <div className="flex items-center gap-2 text-[12px] text-cs-gray-500">
        <Icon
          className={cn(
            "w-3.5 h-3.5",
            tone === "green" ? "text-status-green" : "text-cs-gray-500",
          )}
        />
        <span className="font-medium">{label}</span>
        <span className="opacity-70">— no entries yet</span>
      </div>
    );
  }
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        <Icon
          className={cn(
            "w-3.5 h-3.5",
            tone === "green" ? "text-status-green" : "text-cs-gray-500",
          )}
        />
        <span className="text-[12px] font-semibold text-cs-black">{label}</span>
        <span className="text-[11px] text-cs-gray-500 tabular-nums">({leads.length})</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
        {leads.slice(0, 8).map((lead) => (
          <div key={lead.id} className="relative">
            <LeadCard lead={lead} compact />
            {showConvertCta && onConvert && (
              <button
                onClick={() => onConvert(lead)}
                className="absolute top-2 right-2 text-[10px] font-medium text-cs-red hover:text-cs-red-dark transition-colors"
              >
                Convert →
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
