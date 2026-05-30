"use client";

import { useState } from "react";
import {
  X,
  Calendar as CalendarIcon,
  Clock,
  Users,
  CheckCircle2,
  Trash2,
  Building2,
} from "lucide-react";
import { Booking, Room } from "@/types";
import { cn } from "@/lib/utils";

interface BookingDetailPanelProps {
  booking: Booking;
  room: Room | null;
  onCancel: (id: string) => void;
  onClose: () => void;
}

export function BookingDetailPanel({
  booking,
  room,
  onCancel,
  onClose,
}: BookingDetailPanelProps) {
  const [confirming, setConfirming] = useState(false);

  const start = new Date(booking.startTime);
  const end = new Date(booking.endTime);
  const durationMin = Math.max(0, Math.round((end.getTime() - start.getTime()) / 60_000));

  const status = booking.status;
  const statusCfg = {
    confirmed: { label: "Confirmed", color: "text-status-green", bg: "bg-[#16A34A1A]" },
    completed: { label: "Completed", color: "text-cs-gray-700", bg: "bg-cs-gray-100" },
    cancelled: { label: "Cancelled", color: "text-status-red", bg: "bg-[#DC26261A]" },
  }[status];

  const handleCancel = () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    onCancel(booking.id);
    onClose();
  };

  return (
    <div className="w-[320px] flex-shrink-0 bg-white border-l border-cs-gray-200 h-full flex flex-col shadow-[-4px_0_15px_rgba(0,0,0,0.02)]">
      <div className="px-5 py-4 border-b border-cs-gray-100 flex items-center justify-between bg-cs-gray-50/50">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-cs-gray-500">
            Booking details
          </div>
          <h2 className="text-[15px] font-semibold text-cs-black font-heading mt-0.5">
            {booking.purpose || "Meeting"}
          </h2>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-cs-gray-500 hover:text-cs-black hover:bg-cs-gray-200 rounded-md transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5 space-y-4">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-semibold",
            statusCfg.bg,
            statusCfg.color,
          )}
        >
          <span className="w-1.5 h-1.5 rounded-full bg-current" />
          {statusCfg.label}
        </span>

        <div className="space-y-3 pt-2">
          <Field
            icon={Building2}
            label="Room"
            value={room ? `${room.name} · cap ${room.capacity}` : booking.roomId}
          />
          <Field
            icon={Users}
            label="Booked by"
            value={booking.guestName || "Anonymous"}
          />
          <Field
            icon={CalendarIcon}
            label="Date"
            value={start.toLocaleDateString("en-US", {
              weekday: "short",
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          />
          <Field
            icon={Clock}
            label="Time"
            value={`${start.toLocaleTimeString([], {
              hour: "numeric",
              minute: "2-digit",
            })} – ${end.toLocaleTimeString([], {
              hour: "numeric",
              minute: "2-digit",
            })}`}
            sub={
              durationMin >= 60
                ? `${Math.floor(durationMin / 60)}h ${durationMin % 60}m`
                : `${durationMin}m`
            }
          />
        </div>

        {status === "confirmed" && (
          <div className="pt-6 space-y-2">
            {confirming ? (
              <div className="space-y-2 p-3 bg-white border border-cs-gray-200 rounded-lg shadow-sm">
                <div className="flex items-start gap-2 text-[12px] text-cs-gray-700">
                  <Trash2 className="w-3.5 h-3.5 text-status-red shrink-0 mt-0.5" />
                  <span>Cancel this booking? The room becomes free for others.</span>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirming(false)}
                    className="flex-1 py-2 rounded-lg text-[12px] font-medium bg-white border border-cs-gray-200 text-cs-gray-700 hover:bg-cs-gray-50"
                  >
                    Keep
                  </button>
                  <button
                    type="button"
                    onClick={handleCancel}
                    className="flex-1 py-2 rounded-lg text-[12px] font-semibold bg-status-red text-white hover:bg-[#B91C1C] transition-colors"
                  >
                    Yes, cancel
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={handleCancel}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 rounded-lg text-[13px] font-medium bg-white border border-cs-gray-200 text-cs-gray-700 hover:bg-[#DC26260F] hover:text-status-red hover:border-status-red/30 transition-colors shadow-sm"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Cancel booking
              </button>
            )}
          </div>
        )}

        {status === "completed" && (
          <div className="mt-4 p-3 border border-cs-gray-100 bg-cs-gray-50 rounded-lg flex items-center gap-2 text-[12px] text-cs-gray-500 shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5 text-status-green" />
            Booking has already ended.
          </div>
        )}
      </div>
    </div>
  );
}

function Field({
  icon: Icon,
  label,
  value,
  sub,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
  sub?: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="w-7 h-7 rounded-md bg-cs-gray-50 border border-cs-gray-100 flex items-center justify-center shrink-0">
        <Icon className="w-3.5 h-3.5 text-cs-gray-500" />
      </span>
      <div className="min-w-0">
        <div className="text-[10px] uppercase tracking-wider text-cs-gray-500 font-semibold">
          {label}
        </div>
        <div className="text-[13px] text-cs-black font-medium mt-0.5 truncate">{value}</div>
        {sub && <div className="text-[11px] text-cs-gray-500 mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}
