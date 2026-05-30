import React, { useMemo, useEffect, useState } from "react";
import { Booking } from "@/types";

interface DayCalendarProps {
  bookings: Booking[];
  selectedDate: Date;
  selectedBookingId?: string | null;
  onSlotClick: (time: Date) => void;
  onBookingClick: (booking: Booking) => void;
}

const START_HOUR = 7;
const END_HOUR = 22; // 10 PM
const HOUR_HEIGHT = 80; // 80px per hour
const TOTAL_HOURS = END_HOUR - START_HOUR;

const COLORS = [
  "bg-[#F3E8FF] border-[#D8B4FE] text-[#6B21A8] shadow-[#F3E8FF]",
  "bg-[#E0F2FE] border-[#7DD3FC] text-[#0369A1] shadow-[#E0F2FE]",
  "bg-[#CCFBF1] border-[#5EEAD4] text-[#0F766E] shadow-[#CCFBF1]",
  "bg-[#FFEDD5] border-[#FDBA74] text-[#C2410C] shadow-[#FFEDD5]",
  "bg-[#FFE4E6] border-[#FDA4AF] text-[#BE123C] shadow-[#FFE4E6]"
];

export function DayCalendar({ bookings, selectedDate, selectedBookingId, onSlotClick, onBookingClick }: DayCalendarProps) {
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000); // update every min
    return () => clearInterval(timer);
  }, []);

  const hours = useMemo(() => {
    const arr = [];
    for (let i = START_HOUR; i < END_HOUR; i++) {
      const isAM = i < 12;
      const displayHour = i > 12 ? i - 12 : i === 0 ? 12 : i;
      arr.push(`${displayHour} ${isAM ? 'AM' : 'PM'}`);
    }
    return arr;
  }, []);

  // Filter bookings for the selected date — and hide cancelled ones
  const todaysBookings = useMemo(() => {
    return bookings.filter(b => {
      if (b.status === "cancelled") return false;
      const bDate = new Date(b.startTime);
      return bDate.getDate() === selectedDate.getDate() &&
             bDate.getMonth() === selectedDate.getMonth() &&
             bDate.getFullYear() === selectedDate.getFullYear();
    });
  }, [bookings, selectedDate]);

  // Determine top and height for a block based on its start and end times
  const getBlockStyles = (start: string, end: string) => {
    const s = new Date(start);
    const e = new Date(end);
    
    const startMins = (s.getHours() * 60 + s.getMinutes()) - (START_HOUR * 60);
    const endMins = (e.getHours() * 60 + e.getMinutes()) - (START_HOUR * 60);
    
    const top = (startMins / 60) * HOUR_HEIGHT;
    const height = ((endMins - startMins) / 60) * HOUR_HEIGHT;
    
    return { top: `${top}px`, height: `${height}px` };
  };

  // Current time line calculation
  const isToday = currentTime.toDateString() === selectedDate.toDateString();
  const currentMins = (currentTime.getHours() * 60 + currentTime.getMinutes()) - (START_HOUR * 60);
  const nowTop = (currentMins / 60) * HOUR_HEIGHT;
  const showNowLine = isToday && currentMins >= 0 && currentMins <= TOTAL_HOURS * 60;

  const handleEmptyGridClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    
    // Calculate hour based on Y position
    const totalMinsFromStart = (y / HOUR_HEIGHT) * 60;
    // Snap to nearest 30 mins
    const snappedMins = Math.floor(totalMinsFromStart / 30) * 30;
    
    const targetTime = new Date(selectedDate);
    targetTime.setHours(START_HOUR, snappedMins, 0, 0);
    onSlotClick(targetTime);
  };

  return (
    <div className="flex bg-white rounded-2xl border border-cs-gray-200 relative shadow-sm overflow-hidden" style={{ height: `${TOTAL_HOURS * HOUR_HEIGHT}px` }}>
      {/* Time Column */}
      <div className="w-24 flex-shrink-0 border-r border-cs-gray-200 bg-cs-gray-50 flex flex-col relative z-10" style={{ height: `${TOTAL_HOURS * HOUR_HEIGHT}px` }}>
        {hours.map((hour) => (
          <div key={hour} className="text-right pr-4 text-xs font-bold text-cs-black relative" style={{ height: `${HOUR_HEIGHT}px` }}>
            <span className="absolute -top-2.5 right-4 bg-cs-gray-50 px-1 py-0.5 rounded text-[11px]">{hour}</span>
          </div>
        ))}
      </div>

      {/* Grid Column */}
      <div 
        className="flex-1 relative cursor-crosshair overflow-hidden group bg-[#FAFAFA]"
        style={{ height: `${TOTAL_HOURS * HOUR_HEIGHT}px` }}
        onClick={handleEmptyGridClick}
      >
        {/* Horizontal Lines */}
        {hours.map((_, i) => (
          <React.Fragment key={i}>
            <div className="absolute w-full border-t border-cs-gray-200 shadow-[0_1px_0_white]" style={{ top: `${i * HOUR_HEIGHT}px` }} />
            <div className="absolute w-full border-t border-cs-gray-200 border-dashed opacity-60" style={{ top: `${i * HOUR_HEIGHT + HOUR_HEIGHT/2}px` }} />
          </React.Fragment>
        ))}

        {/* Hover Highlight (CSS only for empty space hover isn't trivial with absolute elements, we use group-hover on the container but it highlights the whole column. For simplicity, we just use the cursor-crosshair) */}

        {/* Bookings */}
        {todaysBookings.map((booking, i) => {
          const { top, height } = getBlockStyles(booking.startTime, booking.endTime);
          const colorClass = COLORS[i % COLORS.length];
          const isSelected = selectedBookingId === booking.id;

          return (
            <div
              key={booking.id}
              onClick={(e) => {
                e.stopPropagation();
                onBookingClick(booking);
              }}
              className={`absolute left-3 right-3 rounded-lg border ${colorClass} p-3 overflow-hidden cursor-pointer z-20 transition-all shadow-sm ${
                isSelected
                  ? "ring-2 ring-cs-red ring-offset-2 scale-[1.01] z-30"
                  : "hover:shadow-md hover:scale-[1.01]"
              }`}
              style={{ top, height }}
              title={`${booking.purpose} — ${booking.guestName}`}
            >
              <div className="font-bold text-[13px] leading-tight truncate tracking-tight">{booking.purpose || "Booked"}</div>
              <div className="text-[10px] mt-0.5 opacity-80 font-medium truncate">{booking.guestName}</div>
              <div className="text-[10px] absolute bottom-1.5 left-2 opacity-70 tabular-nums" suppressHydrationWarning>
                {new Date(booking.startTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}–
                {new Date(booking.endTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
              </div>
            </div>
          );
        })}

        {/* Current Time Line */}
        {showNowLine && (
          <div 
            className="absolute left-0 w-full flex items-center z-30 pointer-events-none"
            style={{ top: `${nowTop}px` }}
          >
            <div className="w-2 h-2 rounded-full bg-cs-red -ml-1"></div>
            <div className="h-px bg-cs-red w-full shadow-[0_0_2px_rgba(230,57,70,0.5)]"></div>
          </div>
        )}
      </div>
    </div>
  );
}
