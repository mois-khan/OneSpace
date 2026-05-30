import { Seat, Zone, Floor, FloorPlan } from "@/types";

// Indian names for realistic member assignment
export const memberNames = [
  "Ravi Kumar", "Priya Mehta", "Arun Sharma", "Sneha Reddy", "Vikram Singh",
  "Deepika Nair", "Rahul Verma", "Anita Desai", "Suresh Patil", "Kavita Rao",
  "Manish Gupta", "Pooja Iyer", "Karthik Menon", "Swati Joshi", "Nikhil Das",
  "Meera Bhat", "Arjun Pandey", "Lakshmi Pillai", "Rohit Saxena", "Divya Kapoor",
  "Sanjay Kulkarni", "Namita Tiwari", "Gaurav Mishra", "Rekha Nayak", "Prasad Hegde",
  "Sunita Bhatt", "Vijay Chauhan", "Asha Mohan", "Rajesh Khanna", "Geeta Srinivasan",
  "Amit Jha", "Nisha Agarwal", "Tarun Malik", "Rashmi Shetty", "Harsh Vardhan",
  "Pallavi Deshpande", "Kunal Bose", "Smita Chandra", "Dinesh Rathore", "Aparna Nambiar",
];

export const companyNames = [
  "TechNest Solutions", "NimbleCloud Pvt. Ltd.", "EdTech Solutions", "LegalEase Pvt Ltd",
  "MarketPro Agency", "DataForge Analytics", "GreenLeaf Tech", "PixelCraft Studios",
  "VentureBox Capital", "CodeBrew Labs", "SwiftPay Fintech", "NexGen AI",
  "CloudSync Solutions", "DevStream Inc.", "BrightPath Consulting", "UrbanGrid Design",
  "FreshWorks India", "Chargebee", "Razorpay", "Zoho Corp",
];

// SVG icon paths for zone types (Lucide-style, 16x16 viewBox)
export const zoneIcons: Record<Zone["type"], string> = {
  reception: "M3 21V3h18v18H3zm9-12a3 3 0 100-6 3 3 0 000 6zm-7 9h14v-1c0-2.8-2.2-5-7-5s-7 2.2-7 5v1z", // users
  pantry: "M17 8h1a4 4 0 010 8h-1M3 8h14v9a4 4 0 01-4 4H7a4 4 0 01-4-4V8zM6 2v4M10 2v4M14 2v4", // coffee
  lounge: "M20 9V6a2 2 0 00-2-2H6a2 2 0 00-2 2v3M2 11v5a2 2 0 002 2h16a2 2 0 002-2v-5M4 18v2M20 18v2", // sofa
  conference: "M8 2v4M16 2v4M3 10h18M21 8v13a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h14a2 2 0 012 2z", // calendar
  phone_booth: "M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.13.81.36 1.6.65 2.35a2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.75.29 1.54.52 2.35.65a2 2 0 011.72 1.95z", // phone
  hot_desk: "M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z", // layout
  dedicated: "M20 7h-9M14 17H5M17 17a2 2 0 100-4 2 2 0 000 4zM7 7a2 2 0 100-4 2 2 0 000 4z", // sliders
  cabin: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9zM9 22V12h6v10", // home
  manager: "M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4-4v2M9 11a4 4 0 100-8 4 4 0 000 8zM22 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75", // user-cog
};

// Seeded pseudo-random for deterministic layouts
export function seededRandom(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

export function addSeatGrid(
  seats: Seat[],
  rand: () => number,
  seatIdx: { v: number },
  memberIdx: { v: number },
  zoneId: string,
  prefix: string,
  zoneX: number,
  zoneY: number,
  cols: number,
  rows: number,
  seatW: number,
  seatH: number,
  gapX: number,
  gapY: number,
  occupancyRate: number,
  paddingX: number = 15,
  paddingY: number = 28,
) {
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const id = `seat-${seatIdx.v++}`;
      const code = `${prefix}-${String(row * cols + col + 1).padStart(2, "0")}`;
      const x = zoneX + paddingX + col * (seatW + gapX);
      const y = zoneY + paddingY + row * (seatH + gapY);

      const r = rand();
      let status: Seat["status"];
      if (r < occupancyRate) {
        status = "occupied";
      } else if (r < occupancyRate + 0.04) {
        status = "maintenance";
      } else if (r < occupancyRate + 0.10) {
        status = "reserved";
      } else {
        status = "available";
      }

      seats.push({
        id,
        zoneId,
        code,
        x,
        y,
        width: seatW,
        height: seatH,
        shape: "rect",
        status,
        memberId: status === "occupied" ? `${zoneId.split('-')[0]}-mem-${memberIdx.v++}` : undefined,
      });
    }
  }
}

export function addRoomSeat(
  seats: Seat[],
  seatIdx: { v: number },
  memberIdx: { v: number },
  zoneId: string,
  code: string,
  x: number,
  y: number,
  w: number,
  h: number,
  status: Seat["status"],
) {
  seats.push({
    id: `seat-${seatIdx.v++}`,
    zoneId,
    code,
    x, y,
    width: w,
    height: h,
    shape: "rect",
    status,
    memberId: status === "occupied" ? `${zoneId.split('-')[0]}-mem-${memberIdx.v++}` : undefined,
  });
}

// ───────────────── BRANCH GENERATORS ─────────────────

function generateHitechCity(): FloorPlan {
  const rand = seededRandom(101);
  const seatIdx = { v: 0 };
  const memberIdx = { v: 0 };
  
  // Premium muted colors for a high-end feel
  // Floor 0: Ground
  const f0Zones: Zone[] = [
    { id: "h-rec", branchId: "b1", name: "Reception", type: "reception", x: 40, y: 40, width: 220, height: 120, color: "#F9FAFB", borderColor: "#E5E7EB", label: "Reception Area" },
    { id: "h-pantry", branchId: "b1", name: "Pantry", type: "pantry", x: 280, y: 40, width: 180, height: 120, color: "#FFFBEB", borderColor: "#FDE68A", label: "Pantry & Café" },
    { id: "h-lounge", branchId: "b1", name: "Lounge", type: "lounge", x: 480, y: 40, width: 240, height: 120, color: "#EFF6FF", borderColor: "#BFDBFE", label: "Collaboration Lounge" },
    { id: "h-hot", branchId: "b1", name: "Hot Desks", type: "hot_desk", x: 40, y: 180, width: 420, height: 260, color: "#F0FDF4", borderColor: "#BBF7D0", label: "Hot Desks (Flexi)" },
    { id: "h-pb1", branchId: "b1", name: "PB-1", type: "phone_booth", x: 480, y: 180, width: 80, height: 100, color: "#FDF4FF", borderColor: "#FBCFE8", label: "Phone Booth 1" },
    { id: "h-pb2", branchId: "b1", name: "PB-2", type: "phone_booth", x: 580, y: 180, width: 80, height: 100, color: "#FDF4FF", borderColor: "#FBCFE8", label: "Phone Booth 2" },
  ];
  const f0Seats: Seat[] = [];
  addSeatGrid(f0Seats, rand, seatIdx, memberIdx, "h-hot", "HD", 40, 180, 7, 4, 38, 30, 16, 20, 0.60);
  addRoomSeat(f0Seats, seatIdx, memberIdx, "h-pb1", "PB-01", 495, 205, 50, 50, "occupied");
  addRoomSeat(f0Seats, seatIdx, memberIdx, "h-pb2", "PB-02", 595, 205, 50, 50, "available");

  // Floor 1
  const f1Zones: Zone[] = [
    { id: "h-ded", branchId: "b1", name: "Dedicated", type: "dedicated", x: 40, y: 40, width: 380, height: 260, color: "#FFF7ED", borderColor: "#FED7AA", label: "Dedicated Desks" },
    { id: "h-cab1", branchId: "b1", name: "Cabin A", type: "cabin", x: 440, y: 40, width: 180, height: 120, color: "#F5F3FF", borderColor: "#DDD6FE", label: "Cabin A (6p)", capacity: 6 },
    { id: "h-cab2", branchId: "b1", name: "Cabin B", type: "cabin", x: 640, y: 40, width: 180, height: 120, color: "#F5F3FF", borderColor: "#DDD6FE", label: "Cabin B (8p)", capacity: 8 },
    { id: "h-mgr", branchId: "b1", name: "Manager", type: "manager", x: 440, y: 180, width: 140, height: 120, color: "#FEF2F2", borderColor: "#FECACA", label: "Manager Office" },
  ];
  const f1Seats: Seat[] = [];
  addSeatGrid(f1Seats, rand, seatIdx, memberIdx, "h-ded", "DD", 40, 40, 6, 4, 38, 30, 16, 20, 0.82);
  addSeatGrid(f1Seats, rand, seatIdx, memberIdx, "h-cab1", "CA", 440, 40, 3, 2, 38, 30, 12, 16, 0.90);
  addSeatGrid(f1Seats, rand, seatIdx, memberIdx, "h-cab2", "CB", 640, 40, 4, 2, 30, 30, 10, 16, 0.85);
  addRoomSeat(f1Seats, seatIdx, memberIdx, "h-mgr", "MGR", 465, 210, 90, 60, "occupied");

  // Floor 2
  const f2Zones: Zone[] = [
    { id: "h-cab3", branchId: "b1", name: "Cabin C", type: "cabin", x: 40, y: 40, width: 160, height: 120, color: "#F5F3FF", borderColor: "#DDD6FE", label: "Cabin C (4p)", capacity: 4 },
    { id: "h-cab4", branchId: "b1", name: "Cabin D", type: "cabin", x: 220, y: 40, width: 200, height: 120, color: "#F5F3FF", borderColor: "#DDD6FE", label: "Cabin D (10p)", capacity: 10 },
    { id: "h-conf1", branchId: "b1", name: "Conf Alpha", type: "conference", x: 440, y: 40, width: 180, height: 120, color: "#FFF1F2", borderColor: "#FECDD3", label: "Conf Alpha (12p)", capacity: 12 },
    { id: "h-conf2", branchId: "b1", name: "Conf Beta", type: "conference", x: 640, y: 40, width: 160, height: 120, color: "#FFF1F2", borderColor: "#FECDD3", label: "Conf Beta (6p)", capacity: 6 },
  ];
  const f2Seats: Seat[] = [];
  addSeatGrid(f2Seats, rand, seatIdx, memberIdx, "h-cab3", "CC", 40, 40, 2, 2, 44, 30, 18, 16, 1.0);
  addSeatGrid(f2Seats, rand, seatIdx, memberIdx, "h-cab4", "CD", 220, 40, 5, 2, 26, 30, 10, 16, 0.85);
  addRoomSeat(f2Seats, seatIdx, memberIdx, "h-conf1", "CONF-A", 460, 65, 140, 70, "reserved");
  addRoomSeat(f2Seats, seatIdx, memberIdx, "h-conf2", "CONF-B", 660, 65, 120, 70, "available");

  const floors: Floor[] = [
    { id: "h-f0", name: "Ground Floor", level: 0, zones: f0Zones, seats: f0Seats, canvasWidth: 1200, canvasHeight: 520 },
    { id: "h-f1", name: "1st Floor", level: 1, zones: f1Zones, seats: f1Seats, canvasWidth: 1200, canvasHeight: 460 },
    { id: "h-f2", name: "2nd Floor", level: 2, zones: f2Zones, seats: f2Seats, canvasWidth: 1200, canvasHeight: 380 },
  ];

  return {
    floors,
    zones: floors[0].zones,
    seats: floors[0].seats,
    canvasWidth: floors[0].canvasWidth,
    canvasHeight: floors[0].canvasHeight,
    branchName: "Hitech City",
    address: "Hitech City, Hyderabad"
  };
}

function generateGachibowli(): FloorPlan {
  const rand = seededRandom(202);
  const seatIdx = { v: 0 };
  const memberIdx = { v: 0 };

  const f0Zones: Zone[] = [
    { id: "g-rec", branchId: "b2", name: "Reception", type: "reception", x: 40, y: 40, width: 240, height: 120, color: "#F9FAFB", borderColor: "#E5E7EB", label: "Reception HQ" },
    { id: "g-pantry", branchId: "b2", name: "Pantry & Café", type: "pantry", x: 300, y: 40, width: 200, height: 120, color: "#FFFBEB", borderColor: "#FDE68A", label: "Pantry & Café" },
    { id: "g-lounge", branchId: "b2", name: "Collaboration Lounge", type: "lounge", x: 520, y: 40, width: 260, height: 120, color: "#EFF6FF", borderColor: "#BFDBFE", label: "Collaboration Lounge" },
    { id: "g-hot", branchId: "b2", name: "Hot Desks", type: "hot_desk", x: 40, y: 180, width: 340, height: 280, color: "#F0FDF4", borderColor: "#BBF7D0", label: "Hot Desks (Flexi)" },
    { id: "g-pb1", branchId: "b2", name: "Phone Booth 1", type: "phone_booth", x: 400, y: 180, width: 80, height: 80, color: "#FDF4FF", borderColor: "#FBCFE8", label: "PB-1" },
    { id: "g-pb2", branchId: "b2", name: "Phone Booth 2", type: "phone_booth", x: 500, y: 180, width: 80, height: 80, color: "#FDF4FF", borderColor: "#FBCFE8", label: "PB-2" },
  ];
  const f0Seats: Seat[] = [];
  addSeatGrid(f0Seats, rand, seatIdx, memberIdx, "g-hot", "HD", 40, 180, 5, 4, 44, 34, 16, 20, 0.55);
  addRoomSeat(f0Seats, seatIdx, memberIdx, "g-pb1", "PB-01", 415, 200, 50, 40, "occupied");
  addRoomSeat(f0Seats, seatIdx, memberIdx, "g-pb2", "PB-02", 515, 200, 50, 40, "available");

  // Pin Ravi Kumar + Priya Mehta
  const occ = f0Seats.filter(s => s.status === "occupied");
  if (occ.length >= 2) { occ[0].memberId = "m1"; occ[1].memberId = "m2"; }

  const f1Zones: Zone[] = [
    { id: "g-ded", branchId: "b2", name: "Dedicated Desks", type: "dedicated", x: 40, y: 40, width: 360, height: 280, color: "#FFF7ED", borderColor: "#FED7AA", label: "Dedicated Desks" },
    { id: "g-cab1", branchId: "b2", name: "Cabin A (4-seater)", type: "cabin", x: 420, y: 40, width: 160, height: 140, color: "#F5F3FF", borderColor: "#DDD6FE", label: "Cabin A (4p)", capacity: 4 },
    { id: "g-cab2", branchId: "b2", name: "Cabin B (6-seater)", type: "cabin", x: 600, y: 40, width: 180, height: 140, color: "#F5F3FF", borderColor: "#DDD6FE", label: "Cabin B (6p)", capacity: 6 },
    { id: "g-mgr", branchId: "b2", name: "Manager's Office", type: "manager", x: 420, y: 200, width: 180, height: 120, color: "#FEF2F2", borderColor: "#FECACA", label: "Manager's Office" },
  ];
  const f1Seats: Seat[] = [];
  addSeatGrid(f1Seats, rand, seatIdx, memberIdx, "g-ded", "DD", 40, 40, 6, 4, 38, 34, 16, 20, 0.78);
  addSeatGrid(f1Seats, rand, seatIdx, memberIdx, "g-cab1", "CA", 420, 40, 2, 2, 46, 34, 20, 20, 0.90);
  addSeatGrid(f1Seats, rand, seatIdx, memberIdx, "g-cab2", "CB", 600, 40, 3, 2, 38, 34, 14, 20, 0.85);
  addRoomSeat(f1Seats, seatIdx, memberIdx, "g-mgr", "MGR", 445, 230, 130, 60, "occupied");

  const f2Zones: Zone[] = [
    { id: "g-cab3", branchId: "b2", name: "Cabin C (8-seater)", type: "cabin", x: 40, y: 40, width: 220, height: 140, color: "#F5F3FF", borderColor: "#DDD6FE", label: "Cabin C (8p)", capacity: 8 },
    { id: "g-cab4", branchId: "b2", name: "Cabin D (4-seater)", type: "cabin", x: 280, y: 40, width: 160, height: 140, color: "#F5F3FF", borderColor: "#DDD6FE", label: "Cabin D (4p)", capacity: 4 },
    { id: "g-conf1", branchId: "b2", name: "Conf. Room Alpha", type: "conference", x: 460, y: 40, width: 200, height: 140, color: "#FFF1F2", borderColor: "#FECDD3", label: "Alpha (10p)", capacity: 10 },
    { id: "g-conf2", branchId: "b2", name: "Conf. Room Beta", type: "conference", x: 680, y: 40, width: 180, height: 140, color: "#FFF1F2", borderColor: "#FECDD3", label: "Beta (6p)", capacity: 6 },
  ];
  const f2Seats: Seat[] = [];
  addSeatGrid(f2Seats, rand, seatIdx, memberIdx, "g-cab3", "CC", 40, 40, 4, 2, 36, 34, 12, 20, 0.75);
  addSeatGrid(f2Seats, rand, seatIdx, memberIdx, "g-cab4", "CD", 280, 40, 2, 2, 46, 34, 20, 20, 1.0);
  addRoomSeat(f2Seats, seatIdx, memberIdx, "g-conf1", "CONF-A", 490, 75, 140, 70, "reserved");
  addRoomSeat(f2Seats, seatIdx, memberIdx, "g-conf2", "CONF-B", 705, 75, 130, 70, "available");

  const floors: Floor[] = [
    { id: "g-f0", name: "Ground Floor", level: 0, zones: f0Zones, seats: f0Seats, canvasWidth: 1200, canvasHeight: 520 },
    { id: "g-f1", name: "1st Floor", level: 1, zones: f1Zones, seats: f1Seats, canvasWidth: 1200, canvasHeight: 460 },
    { id: "g-f2", name: "2nd Floor", level: 2, zones: f2Zones, seats: f2Seats, canvasWidth: 1200, canvasHeight: 380 },
  ];

  return {
    floors,
    zones: floors[0].zones,
    seats: floors[0].seats,
    canvasWidth: floors[0].canvasWidth,
    canvasHeight: floors[0].canvasHeight,
    branchName: "Gachibowli",
    address: "Gachibowli, Hyderabad"
  };
}

function generateRaidurg(): FloorPlan {
  const rand = seededRandom(303);
  const seatIdx = { v: 0 };
  const memberIdx = { v: 10 };

  const f0Zones: Zone[] = [
    { id: "r-rec", branchId: "b3", name: "Reception", type: "reception", x: 20, y: 20, width: 160, height: 80, color: "#F8F6F4", borderColor: "#D6D0C9", label: "Reception" },
    { id: "r-pantry", branchId: "b3", name: "Pantry", type: "pantry", x: 200, y: 20, width: 120, height: 80, color: "#FFF8E7", borderColor: "#E8D5A8", label: "Pantry" },
    { id: "r-hot", branchId: "b3", name: "Hot Desks", type: "hot_desk", x: 20, y: 120, width: 240, height: 200, color: "#F0FDF4", borderColor: "#BBF7D0", label: "Hot Desks (Flexi)" },
    { id: "r-lounge", branchId: "b3", name: "Lounge", type: "lounge", x: 280, y: 120, width: 200, height: 100, color: "#EEF2FF", borderColor: "#C7D2FE", label: "Break Lounge" },
    { id: "r-pb1", branchId: "b3", name: "PB-1", type: "phone_booth", x: 340, y: 20, width: 60, height: 80, color: "#ECFDF5", borderColor: "#A7F3D0", label: "PB-1" },
  ];
  const f0Seats: Seat[] = [];
  addSeatGrid(f0Seats, rand, seatIdx, memberIdx, "r-hot", "HD", 20, 120, 4, 4, 38, 26, 14, 16, 0.65);
  addRoomSeat(f0Seats, seatIdx, memberIdx, "r-pb1", "PB-01", 350, 42, 40, 40, "occupied");

  const f1Zones: Zone[] = [
    { id: "r-ded", branchId: "b3", name: "Dedicated", type: "dedicated", x: 20, y: 20, width: 260, height: 200, color: "#FFF7ED", borderColor: "#FED7AA", label: "Dedicated Desks" },
    { id: "r-cab1", branchId: "b3", name: "Cabin A", type: "cabin", x: 300, y: 20, width: 140, height: 100, color: "#FAF5FF", borderColor: "#E9D5FF", label: "Cabin A (6p)", capacity: 6 },
    { id: "r-cab2", branchId: "b3", name: "Cabin B", type: "cabin", x: 460, y: 20, width: 140, height: 100, color: "#FAF5FF", borderColor: "#E9D5FF", label: "Cabin B (4p)", capacity: 4 },
    { id: "r-conf1", branchId: "b3", name: "Conference", type: "conference", x: 300, y: 140, width: 140, height: 80, color: "#FFF1F2", borderColor: "#FECDD3", label: "Conference Room (8p)", capacity: 8 },
    { id: "r-mgr", branchId: "b3", name: "Manager", type: "manager", x: 460, y: 140, width: 100, height: 80, color: "#FEF2F2", borderColor: "#FECACA", label: "Manager" },
  ];
  const f1Seats: Seat[] = [];
  addSeatGrid(f1Seats, rand, seatIdx, memberIdx, "r-ded", "DD", 20, 20, 5, 4, 34, 26, 12, 16, 0.85);
  addSeatGrid(f1Seats, rand, seatIdx, memberIdx, "r-cab1", "CA", 300, 20, 3, 2, 28, 26, 10, 14, 0.95);
  addSeatGrid(f1Seats, rand, seatIdx, memberIdx, "r-cab2", "CB", 460, 20, 2, 2, 38, 26, 14, 14, 0.80);
  addRoomSeat(f1Seats, seatIdx, memberIdx, "r-conf1", "CONF", 315, 160, 110, 40, "available");
  addRoomSeat(f1Seats, seatIdx, memberIdx, "r-mgr", "MGR", 475, 155, 70, 50, "occupied");

  const floors: Floor[] = [
    { id: "r-f0", name: "Ground Floor", level: 0, zones: f0Zones, seats: f0Seats, canvasWidth: 680, canvasHeight: 360 },
    { id: "r-f1", name: "1st Floor", level: 1, zones: f1Zones, seats: f1Seats, canvasWidth: 680, canvasHeight: 260 },
  ];

  return { floors, zones: floors[0].zones, seats: floors[0].seats, canvasWidth: floors[0].canvasWidth, canvasHeight: floors[0].canvasHeight, branchName: "Raidurg", address: "Raidurg, Hyderabad" };
}

function generateKondapur(): FloorPlan {
  const rand = seededRandom(404);
  const seatIdx = { v: 0 };
  const memberIdx = { v: 20 };

  const f0Zones: Zone[] = [
    { id: "k-rec", branchId: "b4", name: "Reception", type: "reception", x: 20, y: 20, width: 140, height: 70, color: "#F8F6F4", borderColor: "#D6D0C9", label: "Reception" },
    { id: "k-pantry", branchId: "b4", name: "Pantry", type: "pantry", x: 180, y: 20, width: 100, height: 70, color: "#FFF8E7", borderColor: "#E8D5A8", label: "Pantry" },
    { id: "k-hot", branchId: "b4", name: "Hot Desks", type: "hot_desk", x: 20, y: 110, width: 200, height: 160, color: "#F0FDF4", borderColor: "#BBF7D0", label: "Hot Desks" },
    { id: "k-lounge", branchId: "b4", name: "Lounge", type: "lounge", x: 240, y: 110, width: 140, height: 100, color: "#EEF2FF", borderColor: "#C7D2FE", label: "Lounge" },
  ];
  const f0Seats: Seat[] = [];
  addSeatGrid(f0Seats, rand, seatIdx, memberIdx, "k-hot", "HD", 20, 110, 4, 3, 32, 26, 12, 18, 0.50);

  const f1Zones: Zone[] = [
    { id: "k-ded", branchId: "b4", name: "Dedicated", type: "dedicated", x: 20, y: 20, width: 200, height: 160, color: "#FFF7ED", borderColor: "#FED7AA", label: "Dedicated Desks" },
    { id: "k-cab1", branchId: "b4", name: "Cabin A", type: "cabin", x: 240, y: 20, width: 120, height: 100, color: "#FAF5FF", borderColor: "#E9D5FF", label: "Cabin A (4p)", capacity: 4 },
    { id: "k-cab2", branchId: "b4", name: "Cabin B", type: "cabin", x: 380, y: 20, width: 120, height: 100, color: "#FAF5FF", borderColor: "#E9D5FF", label: "Cabin B (4p)", capacity: 4 },
    { id: "k-conf1", branchId: "b4", name: "Conference", type: "conference", x: 240, y: 140, width: 140, height: 70, color: "#FFF1F2", borderColor: "#FECDD3", label: "Meeting Room (6p)", capacity: 6 },
  ];
  const f1Seats: Seat[] = [];
  addSeatGrid(f1Seats, rand, seatIdx, memberIdx, "k-ded", "DD", 20, 20, 4, 3, 32, 26, 12, 18, 0.72);
  addSeatGrid(f1Seats, rand, seatIdx, memberIdx, "k-cab1", "CA", 240, 20, 2, 2, 34, 26, 10, 14, 1.0);
  addSeatGrid(f1Seats, rand, seatIdx, memberIdx, "k-cab2", "CB", 380, 20, 2, 2, 34, 26, 10, 14, 0.75);
  addRoomSeat(f1Seats, seatIdx, memberIdx, "k-conf1", "CONF", 255, 162, 110, 32, "reserved");

  const floors: Floor[] = [
    { id: "k-f0", name: "Ground Floor", level: 0, zones: f0Zones, seats: f0Seats, canvasWidth: 480, canvasHeight: 300 },
    { id: "k-f1", name: "1st Floor", level: 1, zones: f1Zones, seats: f1Seats, canvasWidth: 540, canvasHeight: 240 },
  ];

  return { floors, zones: floors[0].zones, seats: floors[0].seats, canvasWidth: floors[0].canvasWidth, canvasHeight: floors[0].canvasHeight, branchName: "Kondapur", address: "Kondapur, Hyderabad" };
}

function generateShaikpet1(): FloorPlan {
  const rand = seededRandom(505);
  const seatIdx = { v: 0 };
  const memberIdx = { v: 30 };

  const f0Zones: Zone[] = [
    { id: "s1-rec", branchId: "b5", name: "Reception", type: "reception", x: 20, y: 20, width: 120, height: 70, color: "#F8F6F4", borderColor: "#D6D0C9", label: "Reception" },
    { id: "s1-pantry", branchId: "b5", name: "Pantry", type: "pantry", x: 160, y: 20, width: 100, height: 70, color: "#FFF8E7", borderColor: "#E8D5A8", label: "Pantry" },
    { id: "s1-hot", branchId: "b5", name: "Hot Desks", type: "hot_desk", x: 20, y: 110, width: 180, height: 140, color: "#F0FDF4", borderColor: "#BBF7D0", label: "Hot Desks" },
    { id: "s1-lounge", branchId: "b5", name: "Lounge", type: "lounge", x: 220, y: 110, width: 140, height: 90, color: "#EEF2FF", borderColor: "#C7D2FE", label: "Break Area" },
  ];
  const f0Seats: Seat[] = [];
  addSeatGrid(f0Seats, rand, seatIdx, memberIdx, "s1-hot", "HD", 20, 110, 3, 3, 36, 24, 14, 14, 0.45);

  const f1Zones: Zone[] = [
    { id: "s1-ded", branchId: "b5", name: "Dedicated", type: "dedicated", x: 20, y: 20, width: 180, height: 140, color: "#FFF7ED", borderColor: "#FED7AA", label: "Dedicated Desks" },
    { id: "s1-cab1", branchId: "b5", name: "Cabin A", type: "cabin", x: 220, y: 20, width: 120, height: 90, color: "#FAF5FF", borderColor: "#E9D5FF", label: "Cabin A (4p)", capacity: 4 },
    { id: "s1-conf1", branchId: "b5", name: "Meeting", type: "conference", x: 220, y: 130, width: 120, height: 70, color: "#FFF1F2", borderColor: "#FECDD3", label: "Meeting Room", capacity: 6 },
  ];
  const f1Seats: Seat[] = [];
  addSeatGrid(f1Seats, rand, seatIdx, memberIdx, "s1-ded", "DD", 20, 20, 3, 3, 36, 24, 14, 14, 0.70);
  addSeatGrid(f1Seats, rand, seatIdx, memberIdx, "s1-cab1", "CA", 220, 20, 2, 2, 34, 22, 10, 14, 0.80);
  addRoomSeat(f1Seats, seatIdx, memberIdx, "s1-conf1", "CONF", 235, 152, 90, 32, "available");

  const floors: Floor[] = [
    { id: "s1-f0", name: "Ground Floor", level: 0, zones: f0Zones, seats: f0Seats, canvasWidth: 420, canvasHeight: 280 },
    { id: "s1-f1", name: "1st Floor", level: 1, zones: f1Zones, seats: f1Seats, canvasWidth: 420, canvasHeight: 230 },
  ];

  return { floors, zones: floors[0].zones, seats: floors[0].seats, canvasWidth: floors[0].canvasWidth, canvasHeight: floors[0].canvasHeight, branchName: "Shaikpet-I", address: "Shaikpet, Hyderabad" };
}

function generateShaikpet2(): FloorPlan {
  const rand = seededRandom(606);
  const seatIdx = { v: 0 };
  const memberIdx = { v: 35 };

  const f0Zones: Zone[] = [
    { id: "s2-rec", branchId: "b6", name: "Reception", type: "reception", x: 20, y: 20, width: 140, height: 80, color: "#F8F6F4", borderColor: "#D6D0C9", label: "Reception" },
    { id: "s2-pantry", branchId: "b6", name: "Pantry", type: "pantry", x: 180, y: 20, width: 120, height: 80, color: "#FFF8E7", borderColor: "#E8D5A8", label: "Pantry & Café" },
    { id: "s2-hot", branchId: "b6", name: "Hot Desks", type: "hot_desk", x: 20, y: 120, width: 220, height: 180, color: "#F0FDF4", borderColor: "#BBF7D0", label: "Hot Desks (Flexi)" },
    { id: "s2-lounge", branchId: "b6", name: "Lounge", type: "lounge", x: 260, y: 120, width: 160, height: 100, color: "#EEF2FF", borderColor: "#C7D2FE", label: "Lounge Area" },
  ];
  const f0Seats: Seat[] = [];
  addSeatGrid(f0Seats, rand, seatIdx, memberIdx, "s2-hot", "HD", 20, 120, 4, 3, 34, 28, 14, 18, 0.50);

  const f1Zones: Zone[] = [
    { id: "s2-ded", branchId: "b6", name: "Dedicated", type: "dedicated", x: 20, y: 20, width: 220, height: 180, color: "#FFF7ED", borderColor: "#FED7AA", label: "Dedicated Desks" },
    { id: "s2-cab1", branchId: "b6", name: "Cabin A", type: "cabin", x: 260, y: 20, width: 130, height: 100, color: "#FAF5FF", borderColor: "#E9D5FF", label: "Cabin A (4p)", capacity: 4 },
    { id: "s2-cab2", branchId: "b6", name: "Cabin B", type: "cabin", x: 410, y: 20, width: 130, height: 100, color: "#FAF5FF", borderColor: "#E9D5FF", label: "Cabin B (6p)", capacity: 6 },
    { id: "s2-conf1", branchId: "b6", name: "Conference", type: "conference", x: 260, y: 140, width: 140, height: 80, color: "#FFF1F2", borderColor: "#FECDD3", label: "Conference (8p)", capacity: 8 },
    { id: "s2-pb1", branchId: "b6", name: "PB-1", type: "phone_booth", x: 420, y: 140, width: 60, height: 80, color: "#ECFDF5", borderColor: "#A7F3D0", label: "PB-1" },
  ];
  const f1Seats: Seat[] = [];
  addSeatGrid(f1Seats, rand, seatIdx, memberIdx, "s2-ded", "DD", 20, 20, 4, 3, 34, 28, 14, 18, 0.68);
  addSeatGrid(f1Seats, rand, seatIdx, memberIdx, "s2-cab1", "CA", 260, 20, 2, 2, 36, 26, 12, 12, 0.90);
  addSeatGrid(f1Seats, rand, seatIdx, memberIdx, "s2-cab2", "CB", 410, 20, 3, 2, 26, 26, 10, 12, 0.70);
  addRoomSeat(f1Seats, seatIdx, memberIdx, "s2-conf1", "CONF", 275, 162, 110, 40, "reserved");
  addRoomSeat(f1Seats, seatIdx, memberIdx, "s2-pb1", "PB-01", 430, 160, 40, 40, "available");

  const floors: Floor[] = [
    { id: "s2-f0", name: "Ground Floor", level: 0, zones: f0Zones, seats: f0Seats, canvasWidth: 580, canvasHeight: 330 },
    { id: "s2-f1", name: "1st Floor", level: 1, zones: f1Zones, seats: f1Seats, canvasWidth: 580, canvasHeight: 250 },
  ];

  return { floors, zones: floors[0].zones, seats: floors[0].seats, canvasWidth: floors[0].canvasWidth, canvasHeight: floors[0].canvasHeight, branchName: "Shaikpet-II", address: "Shaikpet, Hyderabad" };
}

// ───────────────── PUBLIC API ─────────────────

const generators: Record<string, () => FloorPlan> = {
  b1: generateHitechCity,
  b2: generateGachibowli,
  b3: generateRaidurg,
  b4: generateKondapur,
  b5: generateShaikpet1,
  b6: generateShaikpet2,
};

export function generateFloorPlan(branchId: string): FloorPlan {
  const gen = generators[branchId];
  if (!gen) return generateGachibowli();
  return gen();
}

// Member lookup for floor map tooltips
export function getMemberDisplayInfo(memberId: string): { name: string; company: string; plan: string; mrr: number } {
  if (memberId === "m1") return { name: "Ravi Kumar", company: "TechNest Solutions", plan: "Dedicated", mrr: 12000 };
  if (memberId === "m2") return { name: "Priya Mehta", company: "NimbleCloud Pvt. Ltd.", plan: "Dedicated", mrr: 12000 };
  const idx = parseInt(memberId.replace("mem-", ""), 10);
  const plan = idx % 3 === 0 ? "Cabin" : idx % 2 === 0 ? "Dedicated" : "Flexi";
  return {
    name: memberNames[idx % memberNames.length],
    company: companyNames[idx % companyNames.length],
    plan,
    mrr: plan === "Cabin" ? 22000 : plan === "Dedicated" ? 12000 : 7999,
  };
}
