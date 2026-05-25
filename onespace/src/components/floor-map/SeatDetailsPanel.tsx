"use client";

import { Seat } from "@/types";
import { getMemberDisplayInfo } from "@/lib/data/floor-plan";
import { X, User, Building2, CreditCard, MapPin, ArrowRight, AlertTriangle, Wrench, CalendarClock } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";

interface SeatDetailsPanelProps {
  seat: Seat | null;
  onClose: () => void;
}

const statusConfig = {
  available: { label: "Available", color: "text-green-700", bg: "bg-green-100" },
  occupied: { label: "Occupied", color: "text-red-700", bg: "bg-red-100" },
  reserved: { label: "Reserved", color: "text-amber-700", bg: "bg-amber-100" },
  maintenance: { label: "Under Maintenance", color: "text-gray-700", bg: "bg-gray-100" },
};

export function SeatDetailsPanel({ seat, onClose }: SeatDetailsPanelProps) {
  if (!seat) return null;

  const cfg = statusConfig[seat.status];
  const memberInfo = seat.memberId ? getMemberDisplayInfo(seat.memberId) : null;

  // Check if this is a special member (Ravi Kumar - expiring contract)
  const isAtRisk = seat.memberId === "m1";

  return (
    <div className="w-[320px] bg-white border-l border-cs-gray-200 h-full flex flex-col animate-in slide-in-from-right-5 duration-300 shadow-[-4px_0_16px_rgba(0,0,0,0.06)]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-cs-gray-100">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-cs-red" />
          <span className="font-semibold text-cs-black font-heading text-sm">{seat.code}</span>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-cs-gray-50 rounded-md transition-colors">
          <X className="w-4 h-4 text-cs-gray-500" />
        </button>
      </div>

      {/* Status Badge */}
      <div className="px-4 pt-4">
        <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full", cfg.bg, cfg.color)}>
          {cfg.label}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 space-y-5 overflow-y-auto">
        {seat.status === "occupied" && memberInfo && (
          <>
            {/* Member Card */}
            <div className="bg-cs-gray-50 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-cs-red-bg flex items-center justify-center text-cs-red font-bold text-sm border border-cs-red/20">
                  {memberInfo.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-cs-black text-sm">{memberInfo.name}</p>
                  <p className="text-xs text-cs-gray-500">{memberInfo.plan} Plan</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-cs-gray-600">
                  <Building2 className="w-3.5 h-3.5" />
                  {memberInfo.company}
                </div>
                <div className="flex items-center gap-2 text-xs text-cs-gray-600">
                  <CreditCard className="w-3.5 h-3.5" />
                  {formatCurrency(memberInfo.mrr)}/mo
                </div>
              </div>
            </div>

            {/* Risk Alert for Ravi Kumar */}
            {isAtRisk && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex gap-3">
                <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-red-700">Contract Ending in 5 Days</p>
                  <p className="text-xs text-red-600 mt-0.5">High churn risk — no renewal initiated. 22 days since last visit.</p>
                </div>
              </div>
            )}

            {/* CTA */}
            <button className="w-full flex items-center justify-center gap-2 bg-cs-black text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-cs-black/90 transition-colors">
              <User className="w-4 h-4" />
              View Full Profile
              <ArrowRight className="w-3.5 h-3.5 ml-auto" />
            </button>
          </>
        )}

        {seat.status === "available" && (
          <>
            <div className="bg-green-50 rounded-xl p-4 text-center space-y-2">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <MapPin className="w-6 h-6 text-green-600" />
              </div>
              <p className="text-sm font-semibold text-green-800">Ready for Assignment</p>
              <p className="text-xs text-green-600">This seat is available and can be assigned to a new member or lead.</p>
            </div>

            <button className="w-full flex items-center justify-center gap-2 bg-cs-red text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-cs-red-dark transition-colors">
              Assign to Lead
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </>
        )}

        {seat.status === "reserved" && (
          <div className="bg-amber-50 rounded-xl p-4 text-center space-y-2">
            <p className="text-sm font-semibold text-amber-800">Reserved</p>
            <p className="text-xs text-amber-600">This seat/room is currently reserved for an upcoming booking.</p>
          </div>
        )}

        {seat.status === "maintenance" && (
          <div className="bg-gray-50 rounded-xl p-4 text-center space-y-2">
            <p className="text-sm font-semibold text-gray-700">Under Maintenance</p>
            <p className="text-xs text-gray-500">This seat is temporarily unavailable due to maintenance work.</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-cs-gray-100 text-xs text-cs-gray-400 text-center">
        Zone: {seat.zoneId.replace("z-", "").toUpperCase()} • Seat ID: {seat.id}
      </div>
    </div>
  );
}
