"use client";

import React, { useState } from "react";
import { Plus, Search, Filter } from "lucide-react";
import { KanbanBoard } from "@/components/leads/KanbanBoard";
import { initialLeads } from "@/lib/data/seed-leads";

export default function LeadsPage() {
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);

  // Stats calculation
  const newCount = initialLeads.filter(l => l.stage === "new").length;
  const touredCount = initialLeads.filter(l => l.stage === "toured").length;
  const proposalCount = initialLeads.filter(l => l.stage === "proposal").length;
  const negotiatingCount = initialLeads.filter(l => l.stage === "negotiating").length;
  const wonCount = initialLeads.filter(l => l.stage === "won").length;
  const lostCount = initialLeads.filter(l => l.stage === "lost").length;

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] animate-in fade-in duration-500 bg-cs-gray-50/30 overflow-hidden">
      
      {/* Header */}
      <div className="bg-white border-b border-cs-gray-200 p-6 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold font-heading text-cs-black">Leads Pipeline</h1>
            <p className="text-sm text-cs-gray-500 mt-1">Manage enquiries and convert them to members.</p>
          </div>
          <button 
            onClick={() => setIsAddFormOpen(!isAddFormOpen)}
            className="bg-cs-red text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-cs-red-dark transition-colors flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Lead
          </button>
        </div>

        {/* Stats Bar */}
        <div className="flex items-center justify-between bg-cs-gray-50 rounded-lg border border-cs-gray-200 p-3">
          <div className="flex items-center gap-6 text-sm font-medium">
            <span className="text-cs-black">New: <span className="text-cs-red ml-1">{newCount}</span></span>
            <span className="text-cs-gray-300">|</span>
            <span className="text-cs-black">Toured: <span className="text-cs-red ml-1">{touredCount}</span></span>
            <span className="text-cs-gray-300">|</span>
            <span className="text-cs-black">Proposal: <span className="text-cs-red ml-1">{proposalCount}</span></span>
            <span className="text-cs-gray-300">|</span>
            <span className="text-cs-black">Negotiating: <span className="text-cs-red ml-1">{negotiatingCount}</span></span>
            <span className="text-cs-gray-300">|</span>
            <span className="text-cs-black">Won (May): <span className="text-green-600 ml-1">{wonCount}</span></span>
            <span className="text-cs-gray-300">|</span>
            <span className="text-cs-black">Lost: <span className="text-cs-gray-500 ml-1">{lostCount}</span></span>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-cs-gray-400" />
              <input 
                type="text" 
                placeholder="Search leads..." 
                className="pl-8 pr-3 py-1.5 border border-cs-gray-200 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-cs-red"
              />
            </div>
            <button className="p-1.5 border border-cs-gray-200 rounded-md text-cs-gray-500 hover:bg-white transition-colors bg-cs-gray-100">
              <Filter className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Add Lead Quick Form - Slides down */}
        {isAddFormOpen && (
          <div className="mt-4 p-4 border border-cs-gray-200 rounded-lg bg-white shadow-sm animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-3">
              <input type="text" placeholder="Name *" className="flex-1 px-3 py-2 border border-cs-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-cs-red" />
              <input type="text" placeholder="Company" className="flex-1 px-3 py-2 border border-cs-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-cs-red" />
              <input type="tel" placeholder="Phone *" className="flex-1 px-3 py-2 border border-cs-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-cs-red" />
              
              <select className="px-3 py-2 border border-cs-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-cs-red bg-white">
                <option value="">Plan Interest ▾</option>
                <option value="flexi">Flexi Desk</option>
                <option value="dedicated">Dedicated Desk</option>
                <option value="cabin">Private Cabin</option>
              </select>

              <select className="px-3 py-2 border border-cs-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-cs-red bg-white">
                <option value="">Source ▾</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="referral">Referral</option>
                <option value="google">Google</option>
                <option value="walkin">Walk-in</option>
              </select>

              <button 
                onClick={() => setIsAddFormOpen(false)}
                className="px-4 py-2 bg-cs-black text-white text-sm font-medium rounded-md hover:bg-cs-gray-800 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Kanban Board Area */}
      <div className="flex-1 pt-6 overflow-hidden flex flex-col min-h-0">
        <KanbanBoard initialLeads={initialLeads} />
      </div>

    </div>
  );
}
