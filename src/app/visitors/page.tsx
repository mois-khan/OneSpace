"use client";

import { useState } from "react";
import { FileText, Download, List, UserPlus } from "lucide-react";
import { LiveArrivalsTicker } from "@/components/visitors/LiveArrivalsTicker";
import { VisitorKpiStrip } from "@/components/visitors/VisitorKpiStrip";
import { VisitorLog } from "@/components/visitors/VisitorLog";
import { VisitorDetailPanel } from "@/components/visitors/VisitorDetailPanel";
import { PreRegistrationQueue } from "@/components/visitors/PreRegistrationQueue";
import { RegistrationDesk } from "@/components/visitors/RegistrationDesk";
import { useBranch, useAppActions } from "@/lib/store";
import type { Visitor } from "@/types";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function VisitorsPage() {
  const { selectedBranchId, selectedBranch } = useBranch();
  const { checkInVisitor } = useAppActions();
  const [activeVisitor, setActiveVisitor] = useState<Visitor | null>(null);
  const [view, setView] = useState<"log" | "register">("log");

  const handleCheckIn = (data: { name: string; phone: string; purpose: string; hostName: string }) => {
    checkInVisitor({
      branchId: selectedBranchId === "all" ? "b2" : selectedBranchId,
      name: data.name,
      phone: "+91 " + data.phone.replace(/\s+/g, ""),
      purpose: data.purpose,
      hostName: data.hostName,
    });
    toast.success(`${data.name} checked in successfully`);
  };

  return (
    <div className="max-w-[1440px] mx-auto animate-in fade-in duration-300">
      
      {/* Header section */}
      <div className="mb-5 flex items-baseline justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold font-heading text-cs-black">Front Desk</h1>
          <p className="text-sm text-cs-gray-500 mt-1">
            Smart visitor management with QR pre-registration, kiosk self-check-in, and per-visitor history.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {selectedBranch && (
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-cs-red-bg text-cs-red text-[12px] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-cs-red" />
              Scoped to {selectedBranch.name}
            </span>
          )}
          <button
            type="button"
            onClick={() => toast.info("Export not yet built")}
            className="px-3 py-1.5 bg-white border border-cs-gray-200 rounded-lg text-[12px] font-medium text-cs-gray-700 hover:bg-cs-gray-50 transition-colors flex items-center gap-1.5"
          >
            <FileText className="w-3.5 h-3.5" /> Export
          </button>
          <button
            type="button"
            onClick={() => toast.info("Badge PDF coming in V2")}
            className="px-3 py-1.5 bg-white border border-cs-gray-200 rounded-lg text-[12px] font-medium text-cs-gray-700 hover:bg-cs-gray-50 transition-colors flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" /> Badges
          </button>
        </div>
      </div>

      {/* Tab Selector Sub-bar (matching Leads style) */}
      <div className="flex items-center justify-between bg-cs-gray-50 rounded-xl border border-cs-gray-200 px-4 py-2.5 mb-5 shadow-[0_1px_2px_rgba(17,24,39,0.02)]">
        <div className="flex items-center bg-white border border-cs-gray-200 rounded-lg p-1 shadow-sm">
          <button
            onClick={() => setView("log")}
            className={cn(
              "px-4 py-1.5 rounded-md text-[12px] font-bold transition-all flex items-center gap-1.5",
              view === "log"
                ? "bg-cs-gray-100 text-cs-black shadow-sm"
                : "text-cs-gray-500 hover:text-cs-black"
            )}
            title="Visitor Directory Log"
          >
            <List className="w-3.5 h-3.5" /> Visitor Directory
          </button>
          <button
            onClick={() => setView("register")}
            className={cn(
              "px-4 py-1.5 rounded-md text-[12px] font-bold transition-all flex items-center gap-1.5",
              view === "register"
                ? "bg-cs-gray-100 text-cs-black shadow-sm"
                : "text-cs-gray-500 hover:text-cs-black"
            )}
            title="Active Registration Desk"
          >
            <UserPlus className="w-3.5 h-3.5" /> Registration Desk
          </button>
        </div>
        <div className="text-[11px] text-cs-gray-500 font-semibold flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-status-green animate-pulse" />
          Kiosk Terminal Active
        </div>
      </div>

      {/* Main panel rendering based on tab view */}
      {view === "log" ? (
        <div className="space-y-4 animate-in fade-in duration-200">
          <LiveArrivalsTicker />
          <VisitorKpiStrip />
          <PreRegistrationQueue />
          <div className="w-full">
            <VisitorLog onSelectVisitor={setActiveVisitor} />
          </div>
        </div>
      ) : (
        <div className="w-full animate-in slide-in-from-bottom-2 duration-300">
          <RegistrationDesk onCheckIn={handleCheckIn} />
        </div>
      )}

      {/* Detail slide panel */}
      <VisitorDetailPanel visitor={activeVisitor} onClose={() => setActiveVisitor(null)} />
    </div>
  );
}
