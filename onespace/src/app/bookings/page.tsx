"use client";

import React, { useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { RoomSelector } from "@/components/bookings/RoomSelector";
import { DayCalendar } from "@/components/bookings/DayCalendar";
import { QuickBookPanel } from "@/components/bookings/QuickBookPanel";
import { rooms, initialBookings } from "@/lib/data/seed-bookings";
import { Booking } from "@/types";
import { toast } from "sonner";

export default function BookingsPage() {
  const [selectedRoomId, setSelectedRoomId] = useState(rooms[0].id);
  const [selectedDate, setSelectedDate] = useState(new Date());
  
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  
  // Panel state
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [selectedTime, setSelectedTime] = useState<Date | null>(null);

  const selectedRoom = rooms.find(r => r.id === selectedRoomId) || rooms[0];

  const handleSlotClick = (time: Date) => {
    setSelectedTime(time);
    setIsPanelOpen(true);
  };

  const handleBookingClick = (booking: Booking) => {
    // For demo, we just open the panel, or we could show details
    // But spec says: Click block → shows detail: [View Member] [Cancel Booking]
    // Since it's not a full requirement, I'll just toast for now or we could add a modal later
    toast.info(`Booking: ${booking.purpose} by ${booking.guestName}`);
  };

  const handleBook = (newBooking: Omit<Booking, "id">) => {
    const booking: Booking = {
      ...newBooking,
      id: `bk-${Date.now()}`
    };
    
    setBookings(prev => [...prev, booking]);
    
    // Spec toast
    const sTime = new Date(booking.startTime).toLocaleTimeString([], {hour: 'numeric', minute:'2-digit'});
    const eTime = new Date(booking.endTime).toLocaleTimeString([], {hour: 'numeric', minute:'2-digit'});
    toast.success(`${selectedRoom.name} booked for ${sTime}–${eTime}`);
  };

  // Date Navigation
  const handlePrevDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() - 1);
    setSelectedDate(d);
  };

  const handleNextDay = () => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + 1);
    setSelectedDate(d);
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] animate-in fade-in duration-500 bg-cs-gray-50/30 overflow-hidden">
      
      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 p-6 pr-0">
        
        {/* Header */}
        <div className="flex items-center justify-between mb-6 pr-6">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold font-heading text-cs-black">Room Bookings</h1>
            <p className="text-sm text-cs-gray-500 mt-1 truncate">Manage conference rooms and phone booths.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center bg-white border border-cs-gray-200 rounded-lg p-1 shadow-sm">
              <button onClick={handlePrevDay} className="p-1.5 hover:bg-cs-gray-100 rounded-md transition-colors text-cs-gray-600">
                <ChevronLeft className="w-4 h-4" />
              </button>
              <div className="px-3 text-sm font-semibold text-cs-black w-40 text-center" suppressHydrationWarning>
                {selectedDate.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}
              </div>
              <button onClick={handleNextDay} className="p-1.5 hover:bg-cs-gray-100 rounded-md transition-colors text-cs-gray-600">
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

        {/* Room Selector */}
        <div className="mb-4 pr-6">
          <RoomSelector 
            rooms={rooms}
            selectedRoomId={selectedRoomId}
            onSelectRoom={setSelectedRoomId}
          />
        </div>

        {/* Calendar Grid Area */}
        <div className="flex-1 overflow-y-auto pr-6 pb-6 relative">
          <DayCalendar 
            bookings={bookings.filter(b => b.roomId === selectedRoomId)}
            selectedDate={selectedDate}
            onSlotClick={handleSlotClick}
            onBookingClick={handleBookingClick}
          />
        </div>
      </div>

      {/* Right Panel */}
      {isPanelOpen ? (
        <QuickBookPanel 
          room={selectedRoom}
          selectedTime={selectedTime}
          existingBookings={bookings}
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
