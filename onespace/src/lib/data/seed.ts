import { Branch, Member, Lead, Visitor, Booking, Seat } from "@/types";

export const branches: Branch[] = [
  { id: "b1", name: "Hitech City", location: "Hitech City, Hyderabad", totalSeats: 120 },
  { id: "b2", name: "Gachibowli", location: "Gachibowli, Hyderabad", totalSeats: 150 },
  { id: "b3", name: "Raidurg", location: "Raidurg, Hyderabad", totalSeats: 100 },
  { id: "b4", name: "Kondapur", location: "Kondapur, Hyderabad", totalSeats: 80 },
  { id: "b5", name: "Shaikpet-I", location: "Shaikpet, Hyderabad", totalSeats: 60 },
  { id: "b6", name: "Shaikpet-II", location: "Shaikpet, Hyderabad", totalSeats: 90 },
];

export const members: Member[] = [
  {
    id: "m1",
    branchId: "b2",
    name: "Ravi Kumar",
    company: "TechNest Solutions",
    email: "ravi@technest.in",
    phone: "+91 9876543210",
    planType: "dedicated",
    monthlyFee: 12000,
    contractStart: "2025-01-01",
    contractEnd: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days from now
    status: "expiring",
    seatId: "s1",
    tickets: [{ id: "t1", title: "AC not working", status: "open" }],
    invoices: [],
    daysSinceLastVisit: 22,
    avgVisitsPerMonth: 6,
    memberSince: "Jan 2025",
    monthsAsMember: 16
  },
  {
    id: "m2",
    branchId: "b2",
    name: "Priya Mehta",
    company: "NimbleCloud Pvt. Ltd.",
    email: "priya@nimblecloud.in",
    phone: "+91 9876543211",
    planType: "dedicated",
    monthlyFee: 12000,
    contractStart: "2025-03-01",
    contractEnd: "2026-08-31",
    status: "active",
    seatId: "s2",
    tickets: [],
    invoices: [],
    daysSinceLastVisit: 0,
    avgVisitsPerMonth: 15,
    memberSince: "Mar 2025",
    monthsAsMember: 14
  }
];

export const leads: Lead[] = [
  {
    id: "l1",
    branchId: "b2",
    name: "Sahil Gupta",
    company: "EdTech Solutions",
    email: "sahil@edtech.in",
    phone: "+91 9876543212",
    planType: "Cabin",
    source: "Website",
    stage: "new",
    mrr: 22000,
    assignedTo: "Arun",
    createdAt: "2026-05-20T10:00:00Z"
  }
];

export const visitors: Visitor[] = [
  {
    id: "v1",
    branchId: "b2",
    name: "Rakesh Sharma",
    phone: "+91 9876543213",
    purpose: "Client meeting",
    hostName: "Priya Mehta",
    qrCode: "qr-1234",
    checkInAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
  }
];

export const bookings: Booking[] = [
  {
    id: "bk1",
    seatId: "room-alpha",
    memberId: "m2",
    purpose: "Client Call",
    startTime: new Date(new Date().setHours(9, 0, 0, 0)).toISOString(),
    endTime: new Date(new Date().setHours(10, 0, 0, 0)).toISOString(),
    status: "completed"
  }
];

export const seats: Seat[] = [
  {
    id: "s1",
    zoneId: "z1",
    code: "DD-01",
    x: 100,
    y: 200,
    width: 28,
    height: 22,
    shape: "rect",
    status: "occupied",
    memberId: "m1"
  },
  {
    id: "s2",
    zoneId: "z1",
    code: "DD-03",
    x: 150,
    y: 200,
    width: 28,
    height: 22,
    shape: "rect",
    status: "occupied",
    memberId: "m2"
  },
  {
    id: "room-alpha",
    zoneId: "z2",
    code: "Conf Alpha",
    x: 400,
    y: 100,
    width: 120,
    height: 80,
    shape: "rect",
    status: "available"
  }
];
