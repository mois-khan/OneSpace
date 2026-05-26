"use client";

import { StatCards } from "@/components/visitors/StatCards";
import { VisitorTable } from "@/components/visitors/VisitorTable";
import { CheckInPanel } from "@/components/visitors/CheckInPanel";
import { FileText, Download } from "lucide-react";
import { useVisitors, useBranch, useAppActions } from "@/lib/store";
import { toast } from "sonner";

export default function VisitorsPage() {
  const visitors = useVisitors();
  const { selectedBranchId } = useBranch();
  const { checkInVisitor, checkOutVisitor } = useAppActions();

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

  const handleCheckOut = (id: string) => {
    const v = visitors.find((x) => x.id === id);
    checkOutVisitor(id);
    if (v) toast.success(`${v.name} checked out`);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] animate-in fade-in duration-500 bg-cs-gray-50/30 overflow-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold font-heading text-cs-black">Front Desk</h1>
          <p className="text-sm text-cs-gray-500 mt-1">
            {visitors.length} visitor{visitors.length === 1 ? "" : "s"} in scope today. Check-ins flow to the dashboard live.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => toast.info("Export not yet built")}
            className="px-4 py-2 bg-white border border-cs-gray-200 rounded-lg text-sm font-medium text-cs-gray-700 hover:bg-cs-gray-50 transition-colors flex items-center gap-2 shadow-sm"
          >
            <FileText className="w-4 h-4" /> Export Log
          </button>
          <button
            onClick={() => toast.info("Badge PDF not yet built")}
            className="px-4 py-2 bg-white border border-cs-gray-200 rounded-lg text-sm font-medium text-cs-gray-700 hover:bg-cs-gray-50 transition-colors flex items-center gap-2 shadow-sm"
          >
            <Download className="w-4 h-4" /> Download Badges
          </button>
        </div>
      </div>

      <StatCards visitors={visitors} />

      <div className="flex-1 flex flex-col lg:flex-row gap-6 min-h-0">
        <div className="flex-1 lg:w-[65%] min-h-0 flex flex-col">
          <VisitorTable visitors={visitors} onCheckOut={handleCheckOut} />
        </div>

        <div className="lg:w-[35%] w-full lg:min-w-[320px] lg:max-w-[400px] flex-shrink-0 min-h-0 flex flex-col">
          <CheckInPanel onCheckIn={handleCheckIn} />
        </div>
      </div>
    </div>
  );
}
