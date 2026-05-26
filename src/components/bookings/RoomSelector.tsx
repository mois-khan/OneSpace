import React from "react";
import { Room } from "@/types";
import { cn } from "@/lib/utils";

interface RoomSelectorProps {
  rooms: Room[];
  selectedRoomId: string;
  onSelectRoom: (roomId: string) => void;
  /** Set of room IDs currently in an active confirmed booking right now. */
  bookedNow: Set<string>;
}

export function RoomSelector({
  rooms,
  selectedRoomId,
  onSelectRoom,
  bookedNow,
}: RoomSelectorProps) {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2">
      {rooms.map((room) => {
        const isActive = selectedRoomId === room.id;
        const isOccupied = bookedNow.has(room.id);
        return (
          <button
            key={room.id}
            onClick={() => onSelectRoom(room.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all shrink-0",
              isActive
                ? "bg-cs-black text-white border-cs-black shadow-md"
                : "bg-white text-cs-gray-700 border-cs-gray-200 hover:border-cs-gray-300 hover:bg-cs-gray-50",
            )}
            title={isOccupied ? "Occupied right now" : "Free right now"}
          >
            {room.name}
            <span
              className={cn(
                "text-xs",
                isActive ? "text-white/60" : "text-cs-gray-500",
              )}
            >
              ({room.capacity})
            </span>
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
          </button>
        );
      })}
    </div>
  );
}
