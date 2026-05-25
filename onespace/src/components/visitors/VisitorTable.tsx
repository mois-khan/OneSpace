"use client";

import React, { useEffect, useState } from "react";
import { Visitor } from "@/types";
import { LogOut } from "lucide-react";

interface VisitorTableProps {
  visitors: Visitor[];
  onCheckOut: (id: string) => void;
}

export function VisitorTable({ visitors, onCheckOut }: VisitorTableProps) {
  const [now, setNow] = useState(new Date());

  // Update "now" every minute to keep durations live
  useEffect(() => {
    const interval = setInterval(() => {
      setNow(new Date());
    }, 60000);
    return () => clearInterval(interval);
  }, []);

  const getInitials = (name: string) => name.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();

  const formatDuration = (start: string, end?: string) => {
    try {
      const startTime = new Date(start).getTime();
      const endTime = end ? new Date(end).getTime() : now.getTime();
      const diffMs = endTime - startTime;
      
      const hours = Math.floor(diffMs / (1000 * 60 * 60));
      const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      
      if (hours > 0) return `${hours}h ${minutes}m`;
      return `${minutes}m`;
    } catch {
      return "—";
    }
  };

  const isOverstaying = (start: string) => {
    const hours = (now.getTime() - new Date(start).getTime()) / (1000 * 60 * 60);
    return hours > 8;
  };

  const sortedVisitors = [...visitors].sort((a, b) => new Date(b.checkInAt).getTime() - new Date(a.checkInAt).getTime());

  return (
    <div className="bg-white border border-cs-gray-200 rounded-xl overflow-hidden h-full flex flex-col">
      <div className="px-6 py-4 border-b border-cs-gray-200 flex justify-between items-center bg-cs-gray-50">
        <h3 className="font-semibold font-heading text-cs-black">Visitor Log</h3>
        <span className="text-xs font-medium bg-white border border-cs-gray-200 px-2 py-1 rounded-md text-cs-gray-500">
          {visitors.length} total
        </span>
      </div>
      
      <div className="flex-1 overflow-auto">
        <table className="w-full text-sm text-left whitespace-nowrap">
          <thead className="bg-white sticky top-0 z-10 text-xs uppercase text-cs-gray-500 border-b border-cs-gray-100 shadow-sm">
            <tr>
              <th className="px-4 py-3 font-semibold">Visitor</th>
              <th className="px-4 py-3 font-semibold">Phone</th>
              <th className="px-4 py-3 font-semibold">Purpose</th>
              <th className="px-4 py-3 font-semibold">Host</th>
              <th className="px-4 py-3 font-semibold">Check-in</th>
              <th className="px-4 py-3 font-semibold">Duration</th>
              <th className="px-4 py-3 font-semibold">Status</th>
              <th className="px-4 py-3 font-semibold text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cs-gray-100">
            {sortedVisitors.map((visitor) => {
              const inside = !visitor.checkOutAt;
              const overstay = inside && isOverstaying(visitor.checkInAt);
              
              return (
                <tr key={visitor.id} className="hover:bg-cs-gray-50/50 transition-colors group">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-cs-gray-100 flex items-center justify-center text-xs font-bold text-cs-gray-600 flex-shrink-0 border border-cs-gray-200">
                        {getInitials(visitor.name)}
                      </div>
                      <span className="font-medium text-cs-black">{visitor.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-cs-gray-600">{visitor.phone}</td>
                  <td className="px-4 py-3 text-cs-gray-600">{visitor.purpose}</td>
                  <td className="px-4 py-3">
                    <span className="bg-cs-gray-50 px-2 py-1 rounded-md border border-cs-gray-100 text-xs font-medium text-cs-gray-700">
                      {visitor.hostName || "N/A"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-cs-gray-600">
                    {new Date(visitor.checkInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-cs-gray-600">
                    {formatDuration(visitor.checkInAt, visitor.checkOutAt)}
                  </td>
                  <td className="px-4 py-3">
                    {inside ? (
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${overstay ? 'bg-amber-100 text-amber-700 border-amber-200' : 'bg-green-100 text-green-700 border-green-200'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${overstay ? 'bg-amber-500' : 'bg-green-500 animate-pulse'}`}></span>
                        {overstay ? "Overstaying" : "Inside"}
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-cs-gray-100 text-cs-gray-600 border border-cs-gray-200">
                        Left
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {inside ? (
                      <button 
                        onClick={() => onCheckOut(visitor.id)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-cs-gray-600 hover:text-cs-red hover:bg-red-50 border border-transparent hover:border-red-100 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <LogOut className="w-3.5 h-3.5" /> Check out
                      </button>
                    ) : (
                      <span className="text-cs-gray-400 text-xs">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
