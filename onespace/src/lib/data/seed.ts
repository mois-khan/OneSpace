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
    monthsAsMember: 16,
    riskScore: 88
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
    monthsAsMember: 14,
    riskScore: 12
  },
  {
    id: "m3", branchId: "b1", name: "Meghana Rao", company: "SwiftPay Fintech", email: "meghana@swiftpay.in",
    phone: "+91 9876543212", planType: "cabin", monthlyFee: 22000, contractStart: "2024-06-01",
    contractEnd: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), status: "expiring",
    tickets: [], invoices: [], daysSinceLastVisit: 18, avgVisitsPerMonth: 4, memberSince: "Jun 2024", monthsAsMember: 23, riskScore: 76
  },
  {
    id: "m4", branchId: "b4", name: "Aditya Singh", company: "UrbanGrid Design", email: "aditya@urbangrid.in",
    phone: "+91 9876543213", planType: "dedicated", monthlyFee: 15000, contractStart: "2025-06-01",
    contractEnd: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(), status: "expiring",
    tickets: [], invoices: [], daysSinceLastVisit: 5, avgVisitsPerMonth: 18, memberSince: "Jun 2025", monthsAsMember: 11, riskScore: 71
  },
  {
    id: "m5", branchId: "b2", name: "Pooja Iyer", company: "", email: "pooja@example.com",
    phone: "+91 9876543214", planType: "flexi", monthlyFee: 7999, contractStart: "2025-06-01",
    contractEnd: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString(), status: "active",
    tickets: [], invoices: [], daysSinceLastVisit: 12, avgVisitsPerMonth: 10, memberSince: "Jun 2025", monthsAsMember: 11, riskScore: 64
  },
  {
    id: "m6", branchId: "b5", name: "Sai Teja", company: "DataForge Analytics", email: "sai@dataforge.in",
    phone: "+91 9876543215", planType: "dedicated", monthlyFee: 12000, contractStart: "2025-06-01",
    contractEnd: new Date(Date.now() + 32 * 24 * 60 * 60 * 1000).toISOString(), status: "active",
    tickets: [], invoices: [], daysSinceLastVisit: 2, avgVisitsPerMonth: 20, memberSince: "Jun 2025", monthsAsMember: 11, riskScore: 58
  },
  {
    id: "m7", branchId: "b3", name: "Keerthi Nair", company: "FreshWorks India", email: "keerthi@freshworks.com",
    phone: "+91 9876543216", planType: "cabin", monthlyFee: 18000, contractStart: "2024-07-01",
    contractEnd: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000).toISOString(), status: "active",
    tickets: [], invoices: [], daysSinceLastVisit: 1, avgVisitsPerMonth: 22, memberSince: "Jul 2024", monthsAsMember: 22, riskScore: 51
  }
];

export const leads: Lead[] = [
  {
    id: "l1", branchId: "b2", name: "Sahil Gupta", company: "EdTech Solutions", 
    email: "sahil@edtech.in", phone: "+91 9876543212", planType: "Cabin", 
    source: "Website", stage: "new", mrr: 22000, assignedTo: "Arun", createdAt: "2026-05-20T10:00:00Z"
  },
  // 40% WhatsApp
  { id: "l2", branchId: "b1", name: "Kavya Reddy", phone: "+91 9876543220", planType: "Flexi", source: "WhatsApp", stage: "new", createdAt: "2026-05-22T10:00:00Z" },
  { id: "l3", branchId: "b2", name: "Rohit Sharma", phone: "+91 9876543221", planType: "Dedicated", source: "WhatsApp", stage: "toured", createdAt: "2026-05-18T10:00:00Z" },
  { id: "l4", branchId: "b3", name: "Aditi Rao", phone: "+91 9876543222", planType: "Cabin", source: "WhatsApp", stage: "negotiating", createdAt: "2026-05-15T10:00:00Z" },
  { id: "l5", branchId: "b4", name: "Vikas Patil", phone: "+91 9876543223", planType: "Day Pass", source: "WhatsApp", stage: "new", createdAt: "2026-05-24T10:00:00Z" },
  // 30% Walk-in
  { id: "l6", branchId: "b1", name: "Anjali Verma", company: "LegalEase Pvt Ltd", phone: "+91 9876543230", planType: "Dedicated", source: "Walk-in", stage: "toured", mrr: 15000, createdAt: "2026-05-23T10:00:00Z" },
  { id: "l7", branchId: "b2", name: "Siddharth Jain", phone: "+91 9876543231", planType: "Flexi", source: "Walk-in", stage: "won", createdAt: "2026-05-10T10:00:00Z" },
  { id: "l8", branchId: "b5", name: "Neha Gupta", phone: "+91 9876543232", planType: "Dedicated", source: "Walk-in", stage: "proposal", createdAt: "2026-05-20T10:00:00Z" },
  // 20% Google Ads
  { id: "l9", branchId: "b2", name: "Ritika Jain", company: "Freelance Design", phone: "+91 9876543240", planType: "Flexi", source: "Google Ads", stage: "new", mrr: 7999, createdAt: "2026-05-23T10:00:00Z" },
  { id: "l10", branchId: "b3", name: "Varun Desai", phone: "+91 9876543241", planType: "Cabin", source: "Google Ads", stage: "lost", lossReason: "Too expensive", createdAt: "2026-05-05T10:00:00Z" },
  // 10% Referral
  { id: "l11", branchId: "b2", name: "Karan Mehta", company: "MarketPro Agency", phone: "+91 9876543250", planType: "Dedicated", source: "Referral", stage: "new", mrr: 12000, createdAt: "2026-05-22T10:00:00Z" },
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
    checkInAt: new Date(Date.now() - 2 * 60 * 60 * 1000 - 14 * 60 * 1000).toISOString(), // 2h 14m ago
  },
  {
    id: "v2",
    branchId: "b2",
    name: "Divya Nair",
    phone: "+91 8765432109",
    purpose: "Interview",
    hostName: "Ravi Kumar",
    qrCode: "qr-1235",
    checkInAt: new Date(Date.now() - 1 * 60 * 60 * 1000 - 29 * 60 * 1000).toISOString(), // 1h 29m ago
  },
  {
    id: "v3",
    branchId: "b2",
    name: "Faisal Ahmed",
    phone: "+91 7654321098",
    purpose: "Site visit",
    hostName: "(Walk-in)",
    qrCode: "qr-1236",
    checkInAt: new Date(Date.now() - 44 * 60 * 1000).toISOString(), // 44m ago
  },
  {
    id: "v4",
    branchId: "b2",
    name: "Sneha Reddy",
    phone: "+91 6543210987",
    purpose: "Demo",
    hostName: "Vikram Rao",
    qrCode: "qr-1237",
    checkInAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    checkOutAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // Checked out 2h ago
  },
  {
    id: "v5",
    branchId: "b2",
    name: "Arvind Patil",
    phone: "+91 5432109876",
    purpose: "Delivery",
    hostName: "Reception",
    qrCode: "qr-1238",
    checkInAt: new Date(Date.now() - 9 * 60 * 60 * 1000).toISOString(), // Overstaying > 8h
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
