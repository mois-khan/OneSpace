"use client";

import React, { useMemo, useState } from "react";
import { Room, Booking } from "@/types";
import {
  X,
  Calendar as CalendarIcon,
  Clock,
  Users,
  ArrowRight,
  AlertTriangle,
} from "lucide-react";
import { useMembers, useCurrentUser, useNow } from "@/lib/store";
import { cn } from "@/lib/utils";

interface QuickBookPanelProps {
  room: Room | null;
  selectedTime: Date | null;
  existingBookings: Booking[];
  onBook: (booking: Omit<Booking, "id">) => void;
  onClose: () => void;
}

/** The parent passes a fresh `key` whenever `selectedTime` changes, so the
 *  component remounts and these initial values are recomputed cleanly —
 *  no setState-in-effect anti-pattern needed. */
function defaultTimes(selectedTime: Date | null, now: number) {
  if (selectedTime) {
    const d = new Date(selectedTime);
    const end = new Date(d);
    end.setHours(end.getHours() + 1);
    return {
      date: toDateInput(d),
      startTime: toTimeInput(d),
      endTime: toTimeInput(end),
    };
  }
  const n = new Date(now);
  const nextHour = new Date(n);
  nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0);
  const end = new Date(nextHour);
  end.setHours(end.getHours() + 1);
  return {
    date: toDateInput(n),
    startTime: toTimeInput(nextHour),
    endTime: toTimeInput(end),
  };
}

function toDateInput(d: Date) {
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function toTimeInput(d: Date) {
  const hh = String(d.getHours()).padStart(2, "0");
  const mm = String(d.getMinutes()).padStart(2, "0");
  return `${hh}:${mm}`;
}

export function QuickBookPanel({
  room,
  selectedTime,
  existingBookings,
  onBook,
  onClose,
}: QuickBookPanelProps) {
  const currentUser = useCurrentUser();
  const members = useMembers();
  const now = useNow();

  // Lazy initializers — set once when the component mounts; parent remounts
  // us via `key` to trigger a "reset".
  const defaults = useMemo(() => defaultTimes(selectedTime, now), [selectedTime, now]);
  const [date, setDate] = useState<string>(defaults.date);
  const [startTime, setStartTime] = useState<string>(defaults.startTime);
  const [endTime, setEndTime] = useState<string>(defaults.endTime);
  const [booker, setBooker] = useState<string>(currentUser.name);
  const [purpose, setPurpose] = useState<string>("");

  // Member autocomplete matches — pure derivation, no state
  const memberMatches = useMemo(() => {
    const q = booker.trim().toLowerCase();
    if (!q || q === currentUser.name.toLowerCase()) return [];
    return members
      .filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          (m.company || "").toLowerCase().includes(q),
      )
      .slice(0, 5);
  }, [booker, members, currentUser.name]);
  const [showMatches, setShowMatches] = useState(false);

  // Conflict detection — pure derivation, no state, no effect
  const conflict = useMemo<Booking | null>(() => {
    if (!room || !date || !startTime || !endTime) return null;
    const sTime = new Date(`${date}T${startTime}:00`);
    const eTime = new Date(`${date}T${endTime}:00`);
    if (isNaN(sTime.getTime()) || isNaN(eTime.getTime())) return null;
    if (sTime >= eTime) return null;
    return (
      existingBookings.find((b) => {
        if (b.roomId !== room.id) return false;
        if (b.status === "cancelled") return false;
        const bStart = new Date(b.startTime);
        const bEnd = new Date(b.endTime);
        return sTime < bEnd && eTime > bStart;
      }) || null
    );
  }, [date, startTime, endTime, room, existingBookings]);

  const invalidTimeRange = useMemo(() => {
    if (!date || !startTime || !endTime) return false;
    const sTime = new Date(`${date}T${startTime}:00`);
    const eTime = new Date(`${date}T${endTime}:00`);
    return sTime >= eTime;
  }, [date, startTime, endTime]);

  if (!room) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (conflict || invalidTimeRange) return;
    onBook({
      roomId: room.id,
      guestName: booker.trim() || currentUser.name,
      purpose: purpose.trim() || "Meeting",
      startTime: new Date(`${date}T${startTime}:00`).toISOString(),
      endTime: new Date(`${date}T${endTime}:00`).toISOString(),
      status: "confirmed",
    });
    onClose();
  };

  const pickMember = (name: string) => {
    setBooker(name);
    setShowMatches(false);
  };

  return (
    <div className="w-[320px] flex-shrink-0 bg-white border-l border-cs-gray-200 h-full flex flex-col shadow-[-4px_0_15px_rgba(0,0,0,0.02)]">
      <div className="px-5 py-4 border-b border-cs-gray-100 flex items-center justify-between bg-cs-gray-50/50">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-wider text-cs-red">New booking</div>
          <h2 className="text-[15px] font-semibold text-cs-black font-heading mt-0.5">{room.name}</h2>
          <p className="text-[11px] text-cs-gray-500">Capacity {room.capacity}</p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-cs-gray-500 hover:text-cs-black hover:bg-cs-gray-200 rounded-md transition-colors"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        <form id="book-form" onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold text-cs-gray-500 uppercase tracking-wider flex items-center gap-1.5">
              <CalendarIcon className="w-3 h-3" /> Date
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-cs-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-cs-red/20 focus:border-cs-red"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-cs-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3 h-3" /> Start
              </label>
              <input
                type="time"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 border border-cs-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-cs-red/20 focus:border-cs-red"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold text-cs-gray-500 uppercase tracking-wider flex items-center gap-1.5">
                <ArrowRight className="w-3 h-3" /> End
              </label>
              <input
                type="time"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 border border-cs-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-cs-red/20 focus:border-cs-red"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold text-cs-gray-500 uppercase tracking-wider flex items-center gap-1.5">
              <Users className="w-3 h-3" /> Booked by
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={booker}
                onChange={(e) => {
                  setBooker(e.target.value);
                  setShowMatches(true);
                }}
                onFocus={() => setShowMatches(true)}
                onBlur={() => setTimeout(() => setShowMatches(false), 150)}
                placeholder="Type a member's name or leave as-is"
                className="w-full px-3 py-2 border border-cs-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-cs-red/20 focus:border-cs-red"
              />
              {showMatches && memberMatches.length > 0 && (
                <div className="absolute z-10 left-0 right-0 mt-1 bg-white border border-cs-gray-200 rounded-lg shadow-md max-h-40 overflow-y-auto">
                  {memberMatches.map((m) => (
                    <button
                      type="button"
                      key={m.id}
                      onMouseDown={(e) => {
                        e.preventDefault();
                        pickMember(m.name);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-cs-gray-50 text-[12px]"
                    >
                      <span className="font-medium text-cs-black">{m.name}</span>
                      {m.company && <span className="text-cs-gray-500"> · {m.company}</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold text-cs-gray-500 uppercase tracking-wider">Purpose</label>
            <input
              type="text"
              placeholder="e.g. Client presentation"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full px-3 py-2 border border-cs-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-cs-red/20 focus:border-cs-red"
            />
          </div>
        </form>

        {conflict && (
          <div className="mt-4 p-3 bg-[#DC26260F] border border-[#DC26261A] rounded-lg animate-in slide-in-from-top-2 flex gap-2.5">
            <AlertTriangle className="w-4 h-4 text-status-red shrink-0 mt-0.5" />
            <div>
              <p className="text-[12px] font-semibold text-status-red">Time conflict</p>
              <p className="text-[11px] text-cs-gray-700 mt-0.5 leading-relaxed">
                {room.name} is booked{" "}
                <span className="font-medium">
                  {new Date(conflict.startTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}–{new Date(conflict.endTime).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                </span>{" "}
                by {conflict.guestName || "another guest"}. Pick a different time.
              </p>
            </div>
          </div>
        )}

        {!conflict && invalidTimeRange && (
          <div className="mt-4 p-3 bg-[#D970060F] border border-[#D970061A] rounded-lg flex gap-2.5">
            <AlertTriangle className="w-4 h-4 text-status-amber shrink-0 mt-0.5" />
            <p className="text-[11px] text-cs-gray-700">End time must be after start time.</p>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-cs-gray-100 bg-cs-gray-50">
        <button
          form="book-form"
          type="submit"
          disabled={!!conflict || invalidTimeRange}
          className={cn(
            "w-full py-2.5 rounded-lg text-[13px] font-semibold transition-colors shadow-sm",
            conflict || invalidTimeRange
              ? "bg-cs-gray-200 text-cs-gray-500 cursor-not-allowed"
              : "bg-cs-red text-white hover:bg-cs-red-dark",
          )}
        >
          Confirm booking
        </button>
      </div>
    </div>
  );
}
