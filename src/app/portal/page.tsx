"use client";

import { usePortalMember, useInvoices, useAllBookings, useRooms } from "@/lib/store";
import { CreditCard, Calendar, DoorOpen } from "lucide-react";
import Link from "next/link";
import { format } from "date-fns";

export default function PortalDashboard() {
  const member = usePortalMember();
  const invoices = useInvoices();
  const allBookings = useAllBookings();
  const rooms = useRooms(); // un-filtered to find room names

  if (!member) return null;

  // Filter invoices for this member
  const memberInvoices = invoices.filter((inv) => inv.memberId === member.id);
  const pendingInvoices = memberInvoices.filter((inv) => inv.status !== "paid");
  
  // Filter bookings for this member
  const memberBookings = allBookings
    .filter((b) => b.bookedBy === member.name)
    .sort((a, b) => new Date(a.date + " " + a.startTime).getTime() - new Date(b.date + " " + b.startTime).getTime());
    
  const upcomingBookings = memberBookings.filter((b) => {
    const bookingDate = new Date(b.date + " " + b.startTime);
    return bookingDate.getTime() >= Date.now(); // naive check, using real Date.now() for portal
  });
  
  const nextBooking = upcomingBookings[0];

  return (
    <div className="animate-in fade-in duration-300">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-heading text-cs-black">Welcome back, {member.name.split(" ")[0]}!</h1>
        <p className="text-cs-gray-500 mt-2 text-lg">Here is an overview of your workspace.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {/* Workspace Card */}
        <div className="bg-white rounded-2xl border border-cs-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
              <DoorOpen className="w-5 h-5" />
            </div>
            <h2 className="font-bold text-cs-black text-lg">Your Workspace</h2>
          </div>
          <div className="space-y-3">
            <div>
              <div className="text-xs text-cs-gray-400 font-semibold uppercase tracking-wider mb-1">Assigned Unit</div>
              <div className="font-medium text-cs-black">{member.seatId || "Hot Desk / Roaming"}</div>
            </div>
            <div>
              <div className="text-xs text-cs-gray-400 font-semibold uppercase tracking-wider mb-1">Plan</div>
              <div className="font-medium text-cs-black">{member.planType}</div>
            </div>
            <div>
              <div className="text-xs text-cs-gray-400 font-semibold uppercase tracking-wider mb-1">Branch</div>
              <div className="font-medium text-cs-black">{member.branchId}</div>
            </div>
          </div>
        </div>

        {/* Next Booking Card */}
        <div className="bg-white rounded-2xl border border-cs-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <h2 className="font-bold text-cs-black text-lg">Next Booking</h2>
          </div>
          
          {nextBooking ? (
            <div className="space-y-3">
              <div>
                <div className="text-xs text-cs-gray-400 font-semibold uppercase tracking-wider mb-1">Room</div>
                <div className="font-medium text-cs-black">
                  {rooms.find(r => r.id === nextBooking.roomId)?.name || "Conference Room"}
                </div>
              </div>
              <div>
                <div className="text-xs text-cs-gray-400 font-semibold uppercase tracking-wider mb-1">Date & Time</div>
                <div className="font-medium text-cs-black">
                  {format(new Date(nextBooking.date), "MMM d, yyyy")} <br/>
                  <span className="text-cs-gray-500 text-sm">{nextBooking.startTime} - {nextBooking.endTime}</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col h-[130px] justify-center items-center text-center">
              <p className="text-cs-gray-500 text-sm mb-3">No upcoming bookings.</p>
              <Link href="/portal/bookings" className="text-cs-red font-medium text-sm hover:underline">
                Book a room
              </Link>
            </div>
          )}
        </div>

        {/* Billing Card */}
        <div className="bg-white rounded-2xl border border-cs-gray-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-orange-50 text-orange-600 flex items-center justify-center">
              <CreditCard className="w-5 h-5" />
            </div>
            <h2 className="font-bold text-cs-black text-lg">Billing Status</h2>
          </div>
          
          {pendingInvoices.length > 0 ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center bg-red-50 text-cs-red px-3 py-2 rounded-lg text-sm font-medium">
                <span>{pendingInvoices.length} Pending Invoice{pendingInvoices.length > 1 ? "s" : ""}</span>
                <span>₹{pendingInvoices.reduce((acc, inv) => acc + inv.amount, 0).toLocaleString()}</span>
              </div>
              <Link href="/portal/billing" className="block text-center w-full py-2 bg-white border border-cs-gray-200 rounded-lg text-sm font-medium text-cs-black hover:bg-cs-gray-50 transition-colors">
                View Invoices
              </Link>
            </div>
          ) : (
            <div className="flex flex-col h-[130px] justify-center items-center text-center">
              <div className="w-12 h-12 rounded-full bg-green-50 flex items-center justify-center text-green-600 mb-3">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <p className="text-cs-gray-500 text-sm">All caught up! No pending invoices.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
