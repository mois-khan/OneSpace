"use client";

import React, { useState } from "react";
import { visitors as initialVisitors } from "@/lib/data/seed";
import { Visitor } from "@/types";
import { StatCards } from "@/components/visitors/StatCards";
import { VisitorTable } from "@/components/visitors/VisitorTable";
import { CheckInPanel } from "@/components/visitors/CheckInPanel";
import { FileText, Download } from "lucide-react";

export default function VisitorsPage() {
  const [visitorsList, setVisitorsList] = useState<Visitor[]>(initialVisitors);

  const handleCheckIn = (newVisitorData: { name: string; phone: string; purpose: string; hostName: string }) => {
    const newVisitor: Visitor = {
      id: `v-${Date.now()}`,
      branchId: "b2", // Default to Gachibowli for demo
      name: newVisitorData.name,
      phone: "+91 " + newVisitorData.phone,
      purpose: newVisitorData.purpose,
      hostName: newVisitorData.hostName,
      qrCode: `qr-${Date.now()}`,
      checkInAt: new Date().toISOString(),
    };

    setVisitorsList(prev => [newVisitor, ...prev]);
  };

  const handleCheckOut = (id: string) => {
    setVisitorsList(prev => prev.map(v => 
      v.id === id ? { ...v, checkOutAt: new Date().toISOString() } : v
    ));
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] animate-in fade-in duration-500 bg-cs-gray-50/30 overflow-auto p-6">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-heading text-cs-black">Front Desk</h1>
          <p className="text-sm text-cs-gray-500 mt-1">Manage today's visitors and walk-ins.</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="px-4 py-2 bg-white border border-cs-gray-200 rounded-lg text-sm font-medium text-cs-gray-700 hover:bg-cs-gray-50 transition-colors flex items-center gap-2 shadow-sm">
            <FileText className="w-4 h-4" /> Export Log
          </button>
          <button className="px-4 py-2 bg-white border border-cs-gray-200 rounded-lg text-sm font-medium text-cs-gray-700 hover:bg-cs-gray-50 transition-colors flex items-center gap-2 shadow-sm">
            <Download className="w-4 h-4" /> Download Badges
          </button>
        </div>
      </div>

      {/* Stat Cards */}
      <StatCards visitors={visitorsList} />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
        
        {/* Left: Visitor Table (65%) */}
        <div className="flex-1 lg:w-[65%] min-h-0 flex flex-col">
          <VisitorTable visitors={visitorsList} onCheckOut={handleCheckOut} />
        </div>

        {/* Right: Check-in Panel (35%) */}
        <div className="lg:w-[35%] w-full lg:min-w-[320px] lg:max-w-[400px] flex-shrink-0 min-h-0 flex flex-col">
          <CheckInPanel onCheckIn={handleCheckIn} />
        </div>
      </div>
      
    </div>
  );
}
