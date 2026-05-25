import React, { useState, useEffect } from "react";
import { Room, Booking } from "@/types";
import { X, Calendar as CalendarIcon, Clock, Users, ArrowRight } from "lucide-react";

interface QuickBookPanelProps {
  room: Room | null;
  selectedTime: Date | null;
  existingBookings: Booking[];
  onBook: (booking: Omit<Booking, "id">) => void;
  onClose: () => void;
}

export function QuickBookPanel({ room, selectedTime, existingBookings, onBook, onClose }: QuickBookPanelProps) {
  const [date, setDate] = useState<string>("");
  const [startTime, setStartTime] = useState<string>("");
  const [endTime, setEndTime] = useState<string>("");
  const [booker, setBooker] = useState<string>("");
  const [purpose, setPurpose] = useState<string>("");
  const [conflict, setConflict] = useState<Booking | null>(null);

  // Initialize form when selectedTime changes
  useEffect(() => {
    if (selectedTime) {
      const d = new Date(selectedTime);
      setDate(d.toISOString().split("T")[0]);
      setStartTime(d.toTimeString().slice(0, 5));
      
      const endD = new Date(d);
      endD.setHours(endD.getHours() + 1); // Auto 1 hour
      setEndTime(endD.toTimeString().slice(0, 5));
    } else {
      // Default to today and next hour
      const now = new Date();
      setDate(now.toISOString().split("T")[0]);
      
      const nextHour = new Date(now);
      nextHour.setHours(nextHour.getHours() + 1, 0, 0, 0);
      setStartTime(nextHour.toTimeString().slice(0, 5));
      
      const endHour = new Date(nextHour);
      endHour.setHours(endHour.getHours() + 1);
      setEndTime(endHour.toTimeString().slice(0, 5));
    }
  }, [selectedTime]);

  // Check for conflicts
  useEffect(() => {
    if (!room || !date || !startTime || !endTime) {
      setConflict(null);
      return;
    }

    const sTime = new Date(`${date}T${startTime}:00`);
    const eTime = new Date(`${date}T${endTime}:00`);

    const overlap = existingBookings.find(b => {
      if (b.roomId !== room.id) return false;
      const bStart = new Date(b.startTime);
      const bEnd = new Date(b.endTime);
      return sTime < bEnd && eTime > bStart;
    });

    setConflict(overlap || null);
  }, [date, startTime, endTime, room, existingBookings]);

  if (!room) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (conflict) return;

    onBook({
      roomId: room.id,
      guestName: booker || "Anonymous",
      purpose: purpose || "Meeting",
      startTime: new Date(`${date}T${startTime}:00`).toISOString(),
      endTime: new Date(`${date}T${endTime}:00`).toISOString(),
      status: "confirmed"
    });

    setBooker("");
    setPurpose("");
    onClose();
  };

  return (
    <div className="w-[300px] flex-shrink-0 bg-white border-l border-cs-gray-200 h-full flex flex-col shadow-[-4px_0_15px_rgba(0,0,0,0.02)]">
      <div className="p-5 border-b border-cs-gray-100 flex items-center justify-between bg-cs-gray-50/50">
        <div>
          <h2 className="font-semibold text-cs-black">Quick Book</h2>
          <p className="text-xs text-cs-gray-500 mt-0.5">{room.name}</p>
        </div>
        <button onClick={onClose} className="p-1.5 text-cs-gray-400 hover:text-cs-black hover:bg-cs-gray-200 rounded-md transition-colors">
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-5">
        <form id="book-form" onSubmit={handleSubmit} className="space-y-4">
          
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-cs-gray-500 uppercase flex items-center gap-1.5">
              <CalendarIcon className="w-3.5 h-3.5" /> Date
            </label>
            <input 
              type="date" 
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-cs-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-cs-red"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-cs-gray-500 uppercase flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" /> Start
              </label>
              <input 
                type="time" 
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-3 py-2 border border-cs-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-cs-red"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-cs-gray-500 uppercase flex items-center gap-1.5">
                <ArrowRight className="w-3.5 h-3.5" /> End
              </label>
              <input 
                type="time" 
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-3 py-2 border border-cs-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-cs-red"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-cs-gray-500 uppercase flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5" /> Booked By
            </label>
            <input 
              type="text" 
              required
              placeholder="Search member or visitor..."
              value={booker}
              onChange={(e) => setBooker(e.target.value)}
              className="w-full px-3 py-2 border border-cs-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-cs-red"
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-cs-gray-500 uppercase">Purpose</label>
            <input 
              type="text" 
              placeholder="e.g. Client presentation"
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              className="w-full px-3 py-2 border border-cs-gray-200 rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-cs-red"
            />
          </div>
        </form>

        {conflict && (
          <div className="mt-5 p-3 bg-red-50 border border-red-200 rounded-lg animate-in slide-in-from-top-2">
            <p className="text-xs text-red-800 font-medium flex items-start gap-1.5">
              <span className="text-red-500 text-[10px] mt-0.5">🔴</span> 
              Booked {new Date(conflict.startTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}–{new Date(conflict.endTime).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})} by {conflict.guestName} — choose another time.
            </p>
            <p className="text-xs text-red-600 mt-2 hover:underline cursor-pointer">
              Beta room is free — switch?
            </p>
          </div>
        )}
      </div>

      <div className="p-5 border-t border-cs-gray-100 bg-cs-gray-50">
        <button 
          form="book-form"
          type="submit"
          disabled={!!conflict}
          className="w-full py-2.5 bg-cs-red text-white text-sm font-semibold rounded-lg hover:bg-cs-red-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          Confirm Booking
        </button>
      </div>
    </div>
  );
}
