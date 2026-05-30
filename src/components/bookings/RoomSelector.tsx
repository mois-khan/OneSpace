import React from "react";
import { Room } from "@/types";
import { cn } from "@/lib/utils";
import { Users, DoorOpen, DoorClosed } from "lucide-react";

interface RoomSelectorProps {
  rooms: Room[];
  selectedRoomId: string;
  onSelectRoom: (roomId: string) => void;
  bookedNow: Set<string>;
}

export function RoomSelector({
  rooms,
  selectedRoomId,
  onSelectRoom,
  bookedNow,
}: RoomSelectorProps) {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-2">
        <h2 className="text-sm font-bold text-cs-black tracking-wide uppercase">Select a Room</h2>
        <span className="text-xs text-cs-gray-500 font-medium">({rooms.length} available)</span>
      </div>
      <div className="flex items-center gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">
        {rooms.map((room) => {
          const isActive = selectedRoomId === room.id;
          const isOccupied = bookedNow.has(room.id);
          
          return (
            <button
              key={room.id}
              onClick={() => onSelectRoom(room.id)}
              className={cn(
                "snap-start shrink-0 flex flex-col items-start text-left p-4 rounded-xl border transition-all min-w-[200px]",
                isActive
                  ? "bg-white border-cs-red shadow-[0_8px_20px_rgba(232,25,44,0.12)] ring-1 ring-cs-red"
                  : "bg-white border-cs-gray-200 shadow-sm hover:border-cs-gray-300 hover:shadow-md",
              )}
            >
              <div className="flex justify-between items-start w-full mb-3">
                <div className={cn(
                  "p-2 rounded-lg",
                  isActive ? "bg-cs-red/10 text-cs-red" : "bg-cs-gray-50 text-cs-gray-500"
                )}>
                  {isOccupied ? <DoorClosed className="w-5 h-5" /> : <DoorOpen className="w-5 h-5" />}
                </div>
                <div className="flex items-center gap-1.5 bg-cs-gray-50 border border-cs-gray-200 px-2 py-1 rounded text-[10px] font-semibold text-cs-gray-500">
                  <Users className="w-3 h-3" />
                  {room.capacity}
                </div>
              </div>
              
              <h3 className={cn(
                "font-bold text-base",
                isActive ? "text-cs-red" : "text-cs-black"
              )}>
                {room.name}
              </h3>
              
              <div className="flex items-center gap-1.5 mt-2">
                <span className="relative flex h-2 w-2">
                  {!isOccupied && (
                    <span className="absolute inline-flex h-full w-full rounded-full bg-status-green opacity-60 animate-ping" />
                  )}
                  <span
                    className={cn(
                      "relative inline-flex h-2 w-2 rounded-full",
                      isOccupied ? "bg-status-red" : "bg-status-green",
                    )}
                  />
                </span>
                <span className={cn(
                  "text-[11px] font-semibold uppercase tracking-wider",
                  isOccupied ? "text-status-red" : "text-status-green"
                )}>
                  {isOccupied ? "Occupied" : "Available"}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
