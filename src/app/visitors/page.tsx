"use client";

import { useState } from "react";
import { FileText, Download } from "lucide-react";
import { LiveArrivalsTicker } from "@/components/visitors/LiveArrivalsTicker";
import { VisitorKpiStrip } from "@/components/visitors/VisitorKpiStrip";
import { VisitorLog } from "@/components/visitors/VisitorLog";
import { VisitorDetailPanel } from "@/components/visitors/VisitorDetailPanel";
import { PreRegistrationQueue } from "@/components/visitors/PreRegistrationQueue";
import { CheckInPanel } from "@/components/visitors/CheckInPanel";
import { useBranch, useAppActions } from "@/lib/store";
import type { Visitor } from "@/types";
import { toast } from "sonner";

export default function VisitorsPage() {
  const { selectedBranchId, selectedBranch } = useBranch();
  const { checkInVisitor } = useAppActions();
  const [activeVisitor, setActiveVisitor] = useState<Visitor | null>(null);

  const handleCheckIn = (data: { name: string; phone: string; purpose: string; hostName: string }) => {
    checkInVisitor({
      branchId: selectedBranchId === "all" ? "b2" : selectedBranchId,
      name: data.name,
      phone: "+91 " + data.phone,
      purpose: data.purpose,
      hostName: data.hostName,
    });
    toast.success(`${data.name} checked in`);
  };

  return (
    <div className="max-w-[1440px] mx-auto animate-in fade-in duration-300">
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

      <LiveArrivalsTicker />
      <VisitorKpiStrip />
      <PreRegistrationQueue />

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-4">
        <VisitorLog onSelectVisitor={setActiveVisitor} />
        <div>
          <CheckInPanel onCheckIn={handleCheckIn} />
        </div>
      </div>

      <VisitorDetailPanel visitor={activeVisitor} onClose={() => setActiveVisitor(null)} />
    </div>
  );
}
