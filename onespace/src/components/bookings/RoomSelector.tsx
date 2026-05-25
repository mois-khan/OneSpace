import React from "react";
import { Room } from "@/types";

interface RoomSelectorProps {
  rooms: Room[];
  selectedRoomId: string;
  onSelectRoom: (roomId: string) => void;
}

export function RoomSelector({ rooms, selectedRoomId, onSelectRoom }: RoomSelectorProps) {
  // Mock logic: randomly decide if a room is currently occupied right now,
  // or we could base it on actual bookings. For simplicity, just say available.
  const isAvailable = (roomId: string) => true;

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2">
      {rooms.map(room => (
        <button
          key={room.id}
          onClick={() => onSelectRoom(room.id)}
          className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium transition-all ${
            selectedRoomId === room.id 
              ? 'bg-cs-black text-white border-cs-black shadow-md' 
              : 'bg-white text-cs-gray-600 border-cs-gray-200 hover:border-cs-gray-300 hover:bg-cs-gray-50'
          }`}
        >
          {room.name}
          <span className={`text-xs ${selectedRoomId === room.id ? 'text-cs-gray-300' : 'text-cs-gray-400'}`}>
            ({room.capacity})
          </span>
          <span className={`w-2 h-2 rounded-full ${isAvailable(room.id) ? 'bg-green-500' : 'bg-red-500'}`}></span>
        </button>
      ))}
    </div>
  );
}
