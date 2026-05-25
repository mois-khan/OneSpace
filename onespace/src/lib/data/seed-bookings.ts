import { Room, Booking } from "@/types";

export const rooms: Room[] = [
  { id: "r-alpha", branchId: "b1", name: "Conference Alpha", capacity: 8, type: "conference" },
  { id: "r-beta", branchId: "b1", name: "Conference Beta", capacity: 4, type: "conference" },
  { id: "r-pb1", branchId: "b1", name: "Phone Booth 1", capacity: 1, type: "phone_booth" },
  { id: "r-pb2", branchId: "b1", name: "Phone Booth 2", capacity: 1, type: "phone_booth" },
];

const today = new Date();
today.setHours(0, 0, 0, 0);

const setTime = (hours: number, minutes: number = 0) => {
  const d = new Date(today);
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString();
};

export const initialBookings: Booking[] = [
  {
    id: "bk-1",
    roomId: "r-alpha",
    guestName: "Priya Mehta",
    purpose: "Client Call",
    startTime: setTime(9, 0),
    endTime: setTime(10, 0),
    status: "confirmed"
  },
  {
    id: "bk-2",
    roomId: "r-alpha",
    guestName: "TechNest Solutions",
    purpose: "Board Meeting",
    startTime: setTime(11, 0),
    endTime: setTime(13, 0),
    status: "confirmed"
  },
  {
    id: "bk-3",
    roomId: "r-alpha",
    guestName: "NimbleCloud",
    purpose: "Team Sync",
    startTime: setTime(15, 0),
    endTime: setTime(16, 30),
    status: "confirmed"
  },
  {
    id: "bk-4",
    roomId: "r-beta",
    guestName: "Arun Kumar",
    purpose: "1:1 Review",
    startTime: setTime(10, 30),
    endTime: setTime(11, 30),
    status: "confirmed"
  },
  {
    id: "bk-5",
    roomId: "r-pb1",
    guestName: "Sneha Nair",
    purpose: "Zoom Call",
    startTime: setTime(14, 0),
    endTime: setTime(15, 0),
    status: "confirmed"
  }
];
