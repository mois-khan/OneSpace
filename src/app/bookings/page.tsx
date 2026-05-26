"use client";

import { useState, useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { RoomSelector } from "@/components/bookings/RoomSelector";
import { DayCalendar } from "@/components/bookings/DayCalendar";
import { QuickBookPanel } from "@/components/bookings/QuickBookPanel";
import { useRooms, useAllBookings, useAppActions, useNow } from "@/lib/store";
import type { Booking } from "@/types";
import { toast } from "sonner";

export default function BookingsPage() {
  const filteredRooms = useRooms();
  const allBookings = useAllBookings();
  const now = useNow();
  const { createBooking } = useAppActions();

  // Raw selection; the resolved id below falls back to the first valid room
  // so the selection is always valid even after the branch changes.
  const [selectedRoomIdRaw, setSelectedRoomId] = useState<string>("");
  const selectedRoomId = useMemo(() => {
    if (selectedRoomIdRaw && filteredRooms.some((r) => r.id === selectedRoomIdRaw)) {
      return selectedRoomIdRaw;
    }
    return filteredRooms[0]?.id || "";
  }, [selectedRoomIdRaw, filteredRooms]);

  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date(now));

  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);

  const selectedRoom = useMemo(
    () => filteredRooms.find((r) => r.id === selectedRoomId) || filteredRooms[0],
    [filteredRooms, selectedRoomId],
  );

  const roomBookings = useMemo(
    () => allBookings.filter((b) => b.roomId === selectedRoomId),
    [allBookings, selectedRoomId],
  );

  const handleSlotClick = (time: Date) => {
    setSelectedTime(time);
    setIsPanelOpen(true);
  };

  const handleBookingClick = (booking: Booking) => {
    toast.info(`${booking.purpose || "Booking"} — ${booking.guestName || "Guest"}`);
  };

  const handleBook = (newBooking: Omit<Booking, "id">) => {
    createBooking(newBooking);
    const sTime = new Date(newBooking.startTime).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    const eTime = new Date(newBooking.endTime).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
    toast.success(`${selectedRoom?.name || "Room"} booked for ${sTime}–${eTime}`);
  };

  const handlePrevDay = () => setSelectedDate((d) => new Date(d.getTime() - 86400000));
  const handleNextDay = () => setSelectedDate((d) => new Date(d.getTime() + 86400000));
  const handleToday = () => setSelectedDate(new Date(now));

  if (filteredRooms.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-3.5rem)] text-center px-6">
        <h2 className="text-lg font-semibold text-cs-black mb-1">No rooms in this branch</h2>
        <p className="text-sm text-cs-gray-500">Switch to &ldquo;All Branches&rdquo; or pick a branch with rooms.</p>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-3.5rem)] animate-in fade-in duration-500 bg-cs-gray-50/30 overflow-hidden">
      <div className="flex-1 flex flex-col min-w-0 p-6 pr-0">
        <div className="flex items-center justify-between mb-6 pr-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold font-heading text-cs-black">Room Bookings</h1>
            <p className="text-sm text-cs-gray-500 mt-1 truncate">
              Manage conference rooms and phone booths.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center bg-white border border-cs-gray-200 rounded-lg p-1 shadow-sm">
              <button
                onClick={handlePrevDay}
                className="p-1.5 hover:bg-cs-gray-100 rounded-md transition-colors text-cs-gray-700"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div
                className="px-3 text-sm font-semibold text-cs-black w-40 text-center"
                suppressHydrationWarning
              >
                {selectedDate.toLocaleDateString("en-US", {
                  weekday: "short",
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </div>
              <button
                onClick={handleNextDay}
                className="p-1.5 hover:bg-cs-gray-100 rounded-md transition-colors text-cs-gray-700"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
            <button
              onClick={handleToday}
              className="px-3 py-2 bg-white border border-cs-gray-200 text-cs-gray-700 text-sm font-medium rounded-lg hover:bg-cs-gray-50 shadow-sm transition-colors"
            >
              Today
            </button>
          </div>
        </div>

        <div className="mb-4 pr-6">
          <RoomSelector
            rooms={filteredRooms}
            selectedRoomId={selectedRoomId}
            onSelectRoom={setSelectedRoomId}
          />
        </div>

        <div className="flex-1 overflow-y-auto pr-6 pb-6 relative">
          <DayCalendar
            bookings={roomBookings}
            selectedDate={selectedDate}
            onSlotClick={handleSlotClick}
            onBookingClick={handleBookingClick}
          />
        </div>
      </div>

      {isPanelOpen ? (
        <QuickBookPanel
          room={selectedRoom}
          selectedTime={selectedTime}
          existingBookings={allBookings}
          onBook={handleBook}
          onClose={() => setIsPanelOpen(false)}
        />
      ) : (
        <div className="w-[60px] border-l border-cs-gray-200 bg-white flex flex-col items-center py-6 shadow-[-4px_0_15px_rgba(0,0,0,0.02)]">
          <button
            onClick={() => handleSlotClick(new Date())}
            className="w-10 h-10 bg-cs-red text-white rounded-full flex items-center justify-center shadow-sm hover:bg-cs-red-dark transition-transform hover:scale-105"
            title="New Booking"
          >
            <span className="text-2xl leading-none -mt-1">+</span>
          </button>
        </div>
      )}
    </div>
  );
}
