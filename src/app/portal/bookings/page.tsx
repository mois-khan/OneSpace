"use client";

import { useState } from "react";
import { usePortalMember, useRooms, useAllBookings, useAppActions } from "@/lib/store";
import { format } from "date-fns";
import { Calendar, Clock, CreditCard, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function PortalBookings() {
  const member = usePortalMember();
  // Filter rooms to only show conference rooms for this member's branch
  const allRooms = useRooms(member?.branchId);
  const rooms = allRooms.filter(r => r.type === "conference");
  const allBookings = useAllBookings();
  const { createBooking } = useAppActions();

  const [selectedRoom, setSelectedRoom] = useState(rooms[0]?.id || "");
  const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [startTime, setStartTime] = useState("10:00");
  const [endTime, setEndTime] = useState("11:00");

  if (!member) return null;

  // Bookings for this member
  const memberBookings = allBookings
    .filter((b) => b.bookedBy === member.name)
    .sort((a, b) => new Date(a.date + " " + a.startTime).getTime() - new Date(b.date + " " + b.startTime).getTime());
    
  const upcomingBookings = memberBookings.filter((b) => {
    return new Date(b.date + " " + b.startTime).getTime() >= Date.now();
  });
  
  const pastBookings = memberBookings.filter((b) => {
    return new Date(b.date + " " + b.startTime).getTime() < Date.now();
  });

  // Calculate if daily free credit is used
  // User gets 1 free hour per day. We check if they have already booked something on the selected date.
  const hasBookedOnSelectedDate = memberBookings.some(b => b.date === date);
  const hoursRequested = Math.max(1, parseInt(endTime) - parseInt(startTime));
  
  // If haven't booked on this date, 1st hour is free.
  const freeHours = hasBookedOnSelectedDate ? 0 : 1;
  const billableHours = Math.max(0, hoursRequested - freeHours);
  const HOURLY_RATE = 500; // Mock rate
  const totalCost = billableHours * HOURLY_RATE;

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check conflicts
    const conflict = allBookings.find(
      (b) => b.roomId === selectedRoom && b.date === date && 
      ((startTime >= b.startTime && startTime < b.endTime) || 
       (endTime > b.startTime && endTime <= b.endTime))
    );

    if (conflict) {
      toast.error("This room is already booked for the selected time.");
      return;
    }

    createBooking({
      roomId: selectedRoom,
      date,
      startTime: startTime + " AM", // naive format for mock
      endTime: endTime + " AM",
      bookedBy: member.name,
      purpose: "Member Booking",
    });

    toast.success("Room booked successfully!");
  };

  return (
    <div className="animate-in fade-in duration-300">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-heading text-cs-black">Book a Conference Room</h1>
        <p className="text-cs-gray-500 mt-2 text-lg">Use your daily 1-hour free credit or book additional hours.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Booking Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-cs-gray-200 p-6 shadow-sm sticky top-24">
            <h2 className="font-bold text-cs-black mb-6 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-cs-gray-500" /> New Booking
            </h2>

            <form onSubmit={handleBook} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-cs-gray-500 mb-2">Select Room</label>
                <select 
                  value={selectedRoom}
                  onChange={(e) => setSelectedRoom(e.target.value)}
                  className="w-full border border-cs-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-cs-red focus:border-cs-red bg-white"
                >
                  {rooms.map(r => (
                    <option key={r.id} value={r.id}>{r.name} (Capacity: {r.capacity || 8})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-cs-gray-500 mb-2">Date</label>
                <input 
                  type="date" 
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  min={format(new Date(), "yyyy-MM-dd")}
                  className="w-full border border-cs-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-cs-red focus:border-cs-red bg-white"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-cs-gray-500 mb-2">Start Time</label>
                  <select 
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full border border-cs-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-cs-red focus:border-cs-red bg-white"
                  >
                    {[9, 10, 11, 12, 13, 14, 15, 16, 17, 18].map(h => (
                      <option key={h} value={`${h < 10 ? '0'+h : h}:00`}>{h}:00</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-cs-gray-500 mb-2">End Time</label>
                  <select 
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full border border-cs-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-cs-red focus:border-cs-red bg-white"
                  >
                    {[10, 11, 12, 13, 14, 15, 16, 17, 18, 19].map(h => (
                      <option key={h} value={`${h < 10 ? '0'+h : h}:00`}>{h}:00</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="bg-cs-gray-50 rounded-xl p-4 border border-cs-gray-200 mt-6">
                <div className="flex justify-between text-sm mb-2">
                  <span className="text-cs-gray-500">Duration</span>
                  <span className="font-medium text-cs-black">{hoursRequested} Hour{hoursRequested > 1 ? 's' : ''}</span>
                </div>
                {!hasBookedOnSelectedDate && (
                  <div className="flex justify-between text-sm mb-2 text-green-600">
                    <span className="flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Daily Free Credit</span>
                    <span className="font-medium">-1 Hour</span>
                  </div>
                )}
                <div className="flex justify-between text-sm font-bold pt-2 border-t border-cs-gray-200 mt-2">
                  <span className="text-cs-black">Total Cost</span>
                  <span className="text-cs-black">₹{totalCost.toLocaleString()}</span>
                </div>
              </div>

              <button 
                type="submit"
                className="w-full py-3 bg-cs-black text-white rounded-xl font-bold hover:bg-cs-gray-700 transition-all shadow-sm"
              >
                Confirm Booking
              </button>
            </form>
          </div>
        </div>

        {/* My Bookings */}
        <div className="lg:col-span-2 space-y-8">
          <div>
            <h2 className="font-bold text-cs-black mb-4 flex items-center gap-2 text-lg">
              <Clock className="w-5 h-5 text-cs-gray-500" /> Upcoming Bookings
            </h2>
            {upcomingBookings.length === 0 ? (
              <div className="bg-white border border-cs-gray-200 rounded-2xl p-8 text-center text-cs-gray-500 shadow-sm">
                No upcoming bookings.
              </div>
            ) : (
              <div className="space-y-4">
                {upcomingBookings.map((b) => (
                  <div key={b.id} className="bg-white border border-cs-gray-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
                    <div>
                      <div className="font-bold text-cs-black text-lg">{allRooms.find(r => r.id === b.roomId)?.name || "Conference Room"}</div>
                      <div className="text-cs-gray-500 text-sm mt-1">{format(new Date(b.date), "EEEE, MMMM d, yyyy")}</div>
                      <div className="text-cs-gray-500 text-sm">{b.startTime} - {b.endTime}</div>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-1 rounded bg-green-100 text-green-700 text-xs font-semibold">
                      Confirmed
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 className="font-bold text-cs-black mb-4 flex items-center gap-2 text-lg">
               Past Bookings
            </h2>
            {pastBookings.length === 0 ? (
              <div className="bg-white border border-cs-gray-200 rounded-2xl p-8 text-center text-cs-gray-500 shadow-sm">
                No past bookings.
              </div>
            ) : (
              <div className="space-y-4 opacity-75">
                {pastBookings.map((b) => (
                  <div key={b.id} className="bg-white border border-cs-gray-200 rounded-2xl p-5 shadow-sm flex items-center justify-between">
                    <div>
                      <div className="font-bold text-cs-black text-lg">{allRooms.find(r => r.id === b.roomId)?.name || "Conference Room"}</div>
                      <div className="text-cs-gray-500 text-sm mt-1">{format(new Date(b.date), "EEEE, MMMM d, yyyy")}</div>
                      <div className="text-cs-gray-500 text-sm">{b.startTime} - {b.endTime}</div>
                    </div>
                    <span className="inline-flex items-center px-2.5 py-1 rounded bg-cs-gray-100 text-cs-gray-500 text-xs font-semibold">
                      Completed
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
