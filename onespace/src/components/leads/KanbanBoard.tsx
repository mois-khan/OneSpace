"use client";

import React, { useState } from "react";
import { Lead } from "@/types";
import { KanbanColumn } from "./KanbanColumn";
import { OnboardingWizard } from "@/components/members/OnboardingWizard";

interface KanbanBoardProps {
  initialLeads: Lead[];
}

const STAGES = [
  { id: "new", title: "New" },
  { id: "toured", title: "Toured" },
  { id: "proposal", title: "Proposal Sent" },
  { id: "negotiating", title: "Negotiating" },
  { id: "won", title: "Won" },
  { id: "lost", title: "Lost" }
];

export function KanbanBoard({ initialLeads }: KanbanBoardProps) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  
  // Onboarding Wizard state for converting Won leads
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [convertingLead, setConvertingLead] = useState<Lead | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedLeadId(id);
    e.dataTransfer.effectAllowed = "move";
    // For Firefox compatibility
    e.dataTransfer.setData("text/plain", id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = (e: React.DragEvent, stageId: string) => {
    e.preventDefault();
    if (!draggedLeadId) return;
    
    setLeads(prev => prev.map(lead => 
      lead.id === draggedLeadId 
        ? { ...lead, stage: stageId as Lead["stage"] } 
        : lead
    ));
    setDraggedLeadId(null);
  };

  const handleConvertClick = (lead: Lead) => {
    setConvertingLead(lead);
    setIsWizardOpen(true);
  };

  return (
    <>
      <div className="flex-1 overflow-x-auto min-h-0 pb-4">
        <div className="flex gap-4 h-full min-w-max px-6">
          {STAGES.map(stage => (
            <KanbanColumn 
              key={stage.id}
              id={stage.id}
              title={stage.title}
              leads={leads.filter(l => l.stage === stage.id)}
              onConvert={handleConvertClick}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            />
          ))}
        </div>
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
