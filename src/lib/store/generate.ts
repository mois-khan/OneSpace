import type {
  Branch,
  Member,
  Lead,
  Visitor,
  Booking,
  Room,
  Invoice,
  Notification,
  ActivityEvent,
} from "@/types";
import { generateFloorPlan } from "@/lib/data/floor-plan";
import { hashSeed, intBetween, makeRng, pick } from "./rng";

/** Branch catalogue — static. */
export const BRANCHES: Branch[] = [
  { id: "b1", name: "Hitech City", location: "Hitech City, Hyderabad", totalSeats: 120 },
  { id: "b2", name: "Gachibowli", location: "Gachibowli, Hyderabad", totalSeats: 150 },
  { id: "b3", name: "Raidurg", location: "Raidurg, Hyderabad", totalSeats: 100 },
  { id: "b4", name: "Kondapur", location: "Kondapur, Hyderabad", totalSeats: 80 },
  { id: "b5", name: "Shaikpet I", location: "Shaikpet, Hyderabad", totalSeats: 60 },
  { id: "b6", name: "Shaikpet II", location: "Shaikpet, Hyderabad", totalSeats: 90 },
];

const MEMBER_NAMES = [
  "Ravi Kumar", "Priya Mehta", "Arun Sharma", "Sneha Reddy", "Vikram Singh",
  "Deepika Nair", "Rahul Verma", "Anita Desai", "Suresh Patil", "Kavita Rao",
  "Manish Gupta", "Pooja Iyer", "Karthik Menon", "Swati Joshi", "Nikhil Das",
  "Meera Bhat", "Arjun Pandey", "Lakshmi Pillai", "Rohit Saxena", "Divya Kapoor",
  "Sanjay Kulkarni", "Namita Tiwari", "Gaurav Mishra", "Rekha Nayak", "Prasad Hegde",
  "Sunita Bhatt", "Vijay Chauhan", "Asha Mohan", "Rajesh Khanna", "Geeta Srinivasan",
  "Amit Jha", "Nisha Agarwal", "Tarun Malik", "Rashmi Shetty", "Harsh Vardhan",
  "Pallavi Deshpande", "Kunal Bose", "Smita Chandra", "Dinesh Rathore", "Aparna Nambiar",
];

const COMPANY_NAMES = [
  "TechNest Solutions", "NimbleCloud Pvt. Ltd.", "EdTech Solutions", "LegalEase Pvt Ltd",
  "MarketPro Agency", "DataForge Analytics", "GreenLeaf Tech", "PixelCraft Studios",
  "VentureBox Capital", "CodeBrew Labs", "SwiftPay Fintech", "NexGen AI",
  "CloudSync Solutions", "DevStream Inc.", "BrightPath Consulting", "UrbanGrid Design",
  "FreshWorks India", "Chargebee", "Razorpay", "Zoho Corp",
];

const DAY = 24 * 60 * 60 * 1000;

function startOfDay(t: number): number {
  const d = new Date(t);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

/** Generate the full set of members across all branches (deterministic). */
export function generateMembers(now: number): Member[] {
  const members: Member[] = [];
  let idx = 0;

  for (const branch of BRANCHES) {
    const fp = generateFloorPlan(branch.id);
    const branchRng = makeRng(hashSeed(branch.id));

    for (const seat of fp.seats) {
      if (seat.status !== "occupied" || !seat.memberId) continue;

      const memberIdx = idx++;
      const planRoll = branchRng();
      const planType: Member["planType"] =
        planRoll < 0.45 ? "flexi" : planRoll < 0.78 ? "dedicated" : "cabin";
      const monthlyFee =
        planType === "cabin" ? 22000 : planType === "dedicated" ? 12000 : 7999;

      const nameRoll = pick(branchRng, MEMBER_NAMES);
      const companyRoll = pick(branchRng, COMPANY_NAMES);
      const tenureMonths = intBetween(branchRng, 1, 24);
      const memberSinceMs = now - tenureMonths * 30 * DAY;
      const contractEndOffset = intBetween(branchRng, -10, 120);
      const contractEndMs = now + contractEndOffset * DAY;
      const daysSinceLastVisit = intBetween(branchRng, 0, 21);
      const avgVisitsPerMonth = intBetween(branchRng, 6, 22);

      // Risk model: higher if contract expiring soon OR low recent activity OR long-time member with low usage
      let risk = 0;
      if (contractEndOffset < 0) risk += 90;
      else if (contractEndOffset < 14) risk += 65;
      else if (contractEndOffset < 30) risk += 40;
      else if (contractEndOffset < 60) risk += 15;
      if (daysSinceLastVisit >= 14) risk += 35;
      else if (daysSinceLastVisit >= 7) risk += 15;
      if (avgVisitsPerMonth < 8) risk += 12;
      const variance = Math.floor(branchRng() * 12);
      const riskScore = Math.max(0, Math.min(100, risk + variance));

      const status: Member["status"] =
        contractEndOffset < 0
          ? "churned"
          : contractEndOffset < 14
          ? "expiring"
          : tenureMonths < 2
          ? "trial"
          : "active";

      const ticketCount = branchRng() < 0.08 ? 1 : 0;
      const memberId = seat.memberId;

      members.push({
        id: memberId,
        branchId: branch.id,
        name: `${nameRoll}${memberIdx >= MEMBER_NAMES.length ? " " + String.fromCharCode(65 + Math.floor(memberIdx / MEMBER_NAMES.length)) + "." : ""}`,
        company: companyRoll,
        email: `${nameRoll.split(" ")[0].toLowerCase()}.${memberIdx}@example.com`,
        phone: `+91 9876${String(543210 + memberIdx).slice(-6)}`,
        planType,
        monthlyFee,
        contractStart: new Date(memberSinceMs).toISOString(),
        contractEnd: new Date(contractEndMs).toISOString(),
        status,
        seatId: seat.id,
        tickets: ticketCount
          ? [{ id: `tk-${memberId}`, title: "Network issue", status: "open" }]
          : [],
        invoices: [],
        daysSinceLastVisit,
        avgVisitsPerMonth,
        memberSince: new Date(memberSinceMs).toLocaleDateString("en-US", { month: "short", year: "numeric" }),
        monthsAsMember: tenureMonths,
        riskScore,
      });
    }
  }

  return members;
}

/** Generate invoices derived from members (deterministic). */
export function generateInvoices(now: number, members: Member[]): Invoice[] {
  const invoices: Invoice[] = [];

  for (const member of members) {
    const rng = makeRng(hashSeed(member.id + ":inv"));
    const historyCount = intBetween(rng, 1, Math.min(member.monthsAsMember || 1, 6));

    for (let i = 0; i < historyCount; i++) {
      const issuedOffset = (i + 1) * 30;
      invoices.push({
        id: `inv-${member.id}-${i}`,
        memberId: member.id,
        branchId: member.branchId,
        amount: member.monthlyFee,
        status: "paid",
        issuedAt: new Date(now - issuedOffset * DAY).toISOString(),
        dueAt: new Date(now - (issuedOffset - 7) * DAY).toISOString(),
        paidAt: new Date(now - (issuedOffset - 3) * DAY).toISOString(),
      });
    }

    // Current cycle invoice — pending, paid, or overdue
    const cycleRoll = rng();
    const dueOffset = intBetween(rng, -25, 12); // negative = overdue
    const baseId = `inv-${member.id}-current`;
    if (cycleRoll < 0.08 || (member.riskScore || 0) > 70) {
      // overdue
      invoices.push({
        id: baseId,
        memberId: member.id,
        branchId: member.branchId,
        amount: member.monthlyFee,
        status: "overdue",
        issuedAt: new Date(now - 30 * DAY).toISOString(),
        dueAt: new Date(now + Math.min(dueOffset, -1) * DAY).toISOString(),
      });
    } else if (cycleRoll < 0.85) {
      invoices.push({
        id: baseId,
        memberId: member.id,
        branchId: member.branchId,
        amount: member.monthlyFee,
        status: "paid",
        issuedAt: new Date(now - 5 * DAY).toISOString(),
        dueAt: new Date(now + 2 * DAY).toISOString(),
        paidAt: new Date(now - 1 * DAY).toISOString(),
      });
    } else {
      invoices.push({
        id: baseId,
        memberId: member.id,
        branchId: member.branchId,
        amount: member.monthlyFee,
        status: "pending",
        issuedAt: new Date(now - 2 * DAY).toISOString(),
        dueAt: new Date(now + Math.max(dueOffset, 2) * DAY).toISOString(),
      });
    }
  }

  return invoices;
}

/** Static set of leads with timestamps derived from `now` for stability. */
export function generateLeads(now: number): Lead[] {
  const t = (daysAgo: number) => new Date(now - daysAgo * DAY).toISOString();
  return [
    // NEW
    { id: "l-001", branchId: "b1", name: "Sahil Gupta", company: "EdTech Solutions", phone: "+91 98765 10001", planType: "Cabin", source: "Website", stage: "new", mrr: 22000, assignedTo: "Arun", createdAt: t(1) },
    { id: "l-002", branchId: "b2", name: "Ritika Jain", company: "Freelance Design", phone: "+91 98765 10002", planType: "Flexi", source: "Google", stage: "new", mrr: 7999, assignedTo: "Neha", createdAt: t(2) },
    { id: "l-003", branchId: "b1", name: "Karan Mehta", company: "MarketPro Agency", phone: "+91 98765 10003", planType: "Dedicated", source: "Referral", stage: "new", mrr: 12000, assignedTo: "Arun", createdAt: t(3) },
    { id: "l-004", branchId: "b3", name: "Aditi Rao", company: "StartRight Inc", phone: "+91 98765 10004", planType: "Cabin", source: "WhatsApp", stage: "new", mrr: 25000, assignedTo: "Rahul", createdAt: t(1) },
    { id: "l-005", branchId: "b1", name: "Sameer Patil", company: "IndieDevs", phone: "+91 98765 10005", planType: "Dedicated", source: "WhatsApp", stage: "new", mrr: 12000, assignedTo: "Priya", createdAt: t(4) },
    { id: "l-006", branchId: "b2", name: "Natasha Singh", phone: "+91 98765 10006", planType: "Flexi", source: "Walk-in", stage: "new", mrr: 7999, assignedTo: "Neha", createdAt: t(5) },
    { id: "l-007", branchId: "b4", name: "Rishabh K", company: "CyberShield", phone: "+91 98765 10007", planType: "Cabin", source: "Referral", stage: "new", mrr: 35000, assignedTo: "Arun", createdAt: t(2) },
    { id: "l-008", branchId: "b1", name: "Tanya Desai", company: "Desai Legal", phone: "+91 98765 10008", planType: "Cabin", source: "WhatsApp", stage: "new", mrr: 18000, assignedTo: "Priya", createdAt: t(6) },
    { id: "l-009", branchId: "b5", name: "Aman Varma", phone: "+91 98765 10009", planType: "Dedicated", source: "WhatsApp", stage: "new", mrr: 12000, assignedTo: "Neha", createdAt: t(8) },
    // TOURED
    { id: "l-010", branchId: "b1", name: "Anjali Verma", company: "LegalEase Pvt Ltd", phone: "+91 98765 10010", planType: "Dedicated", source: "Walk-in", stage: "toured", mrr: 15000, assignedTo: "Arun", createdAt: t(2) },
    { id: "l-011", branchId: "b2", name: "Mohit Agarwal", company: "AppMakers", phone: "+91 98765 10011", planType: "Cabin", source: "Google", stage: "toured", mrr: 28000, assignedTo: "Rahul", createdAt: t(4) },
    { id: "l-012", branchId: "b3", name: "Sneha Nair", company: "CloudSync Solutions", phone: "+91 98765 10012", planType: "Cabin", source: "Referral", stage: "toured", mrr: 45000, assignedTo: "Neha", createdAt: t(5) },
    { id: "l-013", branchId: "b1", name: "Vikram Das", phone: "+91 98765 10013", planType: "Flexi", source: "WhatsApp", stage: "toured", mrr: 7999, assignedTo: "Priya", createdAt: t(3) },
    { id: "l-014", branchId: "b2", name: "Pooja Hegde", company: "DesignPro", phone: "+91 98765 10014", planType: "Dedicated", source: "WhatsApp", stage: "toured", mrr: 12000, assignedTo: "Arun", createdAt: t(8) },
    { id: "l-015", branchId: "b4", name: "Gaurav Singh", company: "VentureBox", phone: "+91 98765 10015", planType: "Cabin", source: "Referral", stage: "toured", mrr: 32000, assignedTo: "Rahul", createdAt: t(12) },
    // PROPOSAL
    { id: "l-016", branchId: "b1", name: "Deepak Choudhury", company: "DataForge Analytics", phone: "+91 98765 10016", planType: "Cabin", source: "WhatsApp", stage: "proposal", mrr: 55000, assignedTo: "Arun", createdAt: t(6) },
    { id: "l-017", branchId: "b2", name: "Swati Joshi", company: "GrowthHackers", phone: "+91 98765 10017", planType: "Dedicated", source: "Google", stage: "proposal", mrr: 24000, assignedTo: "Priya", createdAt: t(7) },
    { id: "l-018", branchId: "b3", name: "Arjun Pandey", company: "PixelCraft Studios", phone: "+91 98765 10018", planType: "Cabin", source: "Referral", stage: "proposal", mrr: 42000, assignedTo: "Neha", createdAt: t(10) },
    { id: "l-019", branchId: "b1", name: "Neha Sharma", phone: "+91 98765 10019", planType: "Flexi", source: "Walk-in", stage: "proposal", mrr: 7999, assignedTo: "Rahul", createdAt: t(5) },
    { id: "l-020", branchId: "b4", name: "Vijay Chauhan", company: "UrbanGrid Design", phone: "+91 98765 10020", planType: "Cabin", source: "WhatsApp", stage: "proposal", mrr: 22000, assignedTo: "Arun", createdAt: t(14) },
    // NEGOTIATING
    { id: "l-021", branchId: "b1", name: "Srinivas Rao", company: "CloudBase Tech", phone: "+91 98765 10021", planType: "Cabin", source: "Referral", stage: "negotiating", mrr: 25000, assignedTo: "Arun", createdAt: t(6) },
    { id: "l-022", branchId: "b2", name: "Deepika Nair", company: "SwiftPay Fintech", phone: "+91 98765 10022", planType: "Cabin", source: "WhatsApp", stage: "negotiating", mrr: 38000, assignedTo: "Priya", createdAt: t(9) },
    { id: "l-023", branchId: "b3", name: "Rohit Saxena", company: "FinServe", phone: "+91 98765 10023", planType: "Dedicated", source: "Google", stage: "negotiating", mrr: 12000, assignedTo: "Neha", createdAt: t(11) },
    { id: "l-024", branchId: "b1", name: "Fatima Khan", company: "Khan Associates", phone: "+91 98765 10024", planType: "Cabin", source: "Referral", stage: "negotiating", mrr: 28000, assignedTo: "Rahul", createdAt: t(15) },
    // WON
    { id: "l-025", branchId: "b1", name: "Priya Mehta", company: "NimbleCloud Pvt. Ltd.", phone: "+91 98765 10025", planType: "Dedicated", source: "WhatsApp", stage: "won", mrr: 12000, assignedTo: "Arun", createdAt: t(25) },
    { id: "l-026", branchId: "b2", name: "Manish Gupta", company: "Gupta Corp", phone: "+91 98765 10026", planType: "Cabin", source: "Google", stage: "won", mrr: 22000, assignedTo: "Neha", createdAt: t(20) },
    { id: "l-027", branchId: "b1", name: "Divya Kapoor", phone: "+91 98765 10027", planType: "Flexi", source: "Walk-in", stage: "won", mrr: 7999, assignedTo: "Priya", createdAt: t(18) },
    { id: "l-028", branchId: "b3", name: "Amit Jha", company: "DevStream Inc.", phone: "+91 98765 10028", planType: "Dedicated", source: "WhatsApp", stage: "won", mrr: 15000, assignedTo: "Rahul", createdAt: t(12) },
    { id: "l-029", branchId: "b4", name: "Sunita Bhatt", company: "Bhatt Consultants", phone: "+91 98765 10029", planType: "Cabin", source: "Referral", stage: "won", mrr: 30000, assignedTo: "Arun", createdAt: t(10) },
    { id: "l-030", branchId: "b1", name: "Rajesh Khanna", phone: "+91 98765 10030", planType: "Flexi", source: "WhatsApp", stage: "won", mrr: 7999, assignedTo: "Neha", createdAt: t(8) },
    { id: "l-031", branchId: "b2", name: "Asha Mohan", company: "NexGen AI", phone: "+91 98765 10031", planType: "Cabin", source: "Google", stage: "won", mrr: 45000, assignedTo: "Priya", createdAt: t(5) },
    // LOST
    { id: "l-032", branchId: "b1", name: "Kunal Bose", company: "Bose Builders", phone: "+91 98765 10032", planType: "Cabin", source: "WhatsApp", stage: "lost", mrr: 60000, assignedTo: "Arun", lossReason: "Too expensive", createdAt: t(30) },
    { id: "l-033", branchId: "b3", name: "Rashmi Shetty", company: "Design Labs", phone: "+91 98765 10033", planType: "Dedicated", source: "Google", stage: "lost", mrr: 24000, assignedTo: "Neha", lossReason: "Chose competitor", createdAt: t(15) },
    { id: "l-034", branchId: "b2", name: "Tarun Malik", phone: "+91 98765 10034", planType: "Flexi", source: "Walk-in", stage: "lost", mrr: 7999, assignedTo: "Rahul", lossReason: "No response", createdAt: t(40) },
  ];
}

/** Visitors anchored to today. */
export function generateVisitors(now: number): Visitor[] {
  const offset = (mins: number) => new Date(now - mins * 60 * 1000).toISOString();
  return [
    { id: "v-1", branchId: "b2", name: "Rakesh Sharma", phone: "+91 98765 43213", purpose: "Client meeting", hostName: "Priya Mehta", qrCode: "qr-1001", checkInAt: offset(134) },
    { id: "v-2", branchId: "b2", name: "Divya Nair", phone: "+91 87654 32109", purpose: "Interview", hostName: "Ravi Kumar", qrCode: "qr-1002", checkInAt: offset(89) },
    { id: "v-3", branchId: "b2", name: "Faisal Ahmed", phone: "+91 76543 21098", purpose: "Site visit", hostName: "(Walk-in)", qrCode: "qr-1003", checkInAt: offset(44) },
    { id: "v-4", branchId: "b2", name: "Sneha Reddy", phone: "+91 65432 10987", purpose: "Demo", hostName: "Vikram Rao", qrCode: "qr-1004", checkInAt: offset(240), checkOutAt: offset(120) },
    { id: "v-5", branchId: "b2", name: "Arvind Patil", phone: "+91 54321 09876", purpose: "Delivery", hostName: "Reception", qrCode: "qr-1005", checkInAt: offset(540) },
    { id: "v-6", branchId: "b1", name: "Suresh Banerjee", phone: "+91 90876 54321", purpose: "Client meeting", hostName: "Arun Sharma", qrCode: "qr-1006", checkInAt: offset(30) },
    { id: "v-7", branchId: "b3", name: "Maya Iyer", phone: "+91 87123 45678", purpose: "Interview", hostName: "Deepika Nair", qrCode: "qr-1007", checkInAt: offset(95) },
  ];
}

/** Rooms across branches. */
export function generateRooms(): Room[] {
  return [
    { id: "r-alpha", branchId: "b1", name: "Conference Alpha", capacity: 8, type: "conference" },
    { id: "r-beta", branchId: "b1", name: "Conference Beta", capacity: 4, type: "conference" },
    { id: "r-pb1", branchId: "b1", name: "Phone Booth 1", capacity: 1, type: "phone_booth" },
    { id: "r-pb2", branchId: "b1", name: "Phone Booth 2", capacity: 1, type: "phone_booth" },
    { id: "r-g-alpha", branchId: "b2", name: "Gachi Alpha", capacity: 10, type: "conference" },
    { id: "r-g-beta", branchId: "b2", name: "Gachi Beta", capacity: 6, type: "conference" },
    { id: "r-g-pb1", branchId: "b2", name: "Phone Booth 1", capacity: 1, type: "phone_booth" },
    { id: "r-g-pb2", branchId: "b2", name: "Phone Booth 2", capacity: 1, type: "phone_booth" },
    { id: "r-r-conf", branchId: "b3", name: "Raidurg Conference", capacity: 8, type: "conference" },
    { id: "r-k-conf", branchId: "b4", name: "Kondapur Meeting", capacity: 6, type: "conference" },
    { id: "r-s1-conf", branchId: "b5", name: "Shaikpet I Meeting", capacity: 6, type: "conference" },
    { id: "r-s2-conf", branchId: "b6", name: "Shaikpet II Conference", capacity: 8, type: "conference" },
  ];
}

/** Bookings anchored to today. */
export function generateBookings(now: number): Booking[] {
  const dayStart = startOfDay(now);
  const at = (hours: number, minutes: number = 0) => new Date(dayStart + hours * 3600_000 + minutes * 60_000).toISOString();
  return [
    { id: "bk-1", roomId: "r-alpha", guestName: "Priya Mehta", purpose: "Client Call", startTime: at(9), endTime: at(10), status: "confirmed" },
    { id: "bk-2", roomId: "r-alpha", guestName: "TechNest Solutions", purpose: "Board Meeting", startTime: at(11), endTime: at(13), status: "confirmed" },
    { id: "bk-3", roomId: "r-alpha", guestName: "NimbleCloud", purpose: "Team Sync", startTime: at(15), endTime: at(16, 30), status: "confirmed" },
    { id: "bk-4", roomId: "r-beta", guestName: "Arun Kumar", purpose: "1:1 Review", startTime: at(10, 30), endTime: at(11, 30), status: "confirmed" },
    { id: "bk-5", roomId: "r-pb1", guestName: "Sneha Nair", purpose: "Zoom Call", startTime: at(14), endTime: at(15), status: "confirmed" },
    { id: "bk-6", roomId: "r-g-alpha", guestName: "Deepak Choudhury", purpose: "Client Pitch", startTime: at(10), endTime: at(11), status: "confirmed" },
    { id: "bk-7", roomId: "r-g-beta", guestName: "Asha Mohan", purpose: "Vendor Sync", startTime: at(14), endTime: at(15, 30), status: "confirmed" },
  ];
}

/** 30-day occupancy series per branch. */
export function generateOccupancyTrend(now: number) {
  const dayStart = startOfDay(now);
  return Array.from({ length: 30 }).map((_, i) => {
    const date = new Date(dayStart - (29 - i) * DAY);
    const dayOfWeek = date.getDay();
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const daysAgo = 29 - i;
    const isChurnSpike = daysAgo >= 14 && daysAgo <= 18;

    const dayRng = makeRng(hashSeed("trend:" + date.toISOString().slice(0, 10)));
    const baseOf = (min: number, max: number) => Math.floor(min + dayRng() * (max - min + 1));

    let hitech = isWeekend ? baseOf(12, 25) : baseOf(78, 92);
    let gachi = isWeekend ? baseOf(10, 22) : baseOf(75, 90);
    let raidurg = isWeekend ? baseOf(15, 25) : baseOf(80, 92);
    let kondapur = isWeekend ? baseOf(10, 20) : baseOf(70, 85);
    let shaikpet1 = isWeekend ? baseOf(8, 18) : baseOf(65, 80);
    let shaikpet2 = isWeekend ? baseOf(8, 15) : baseOf(60, 75);

    if (isChurnSpike && !isWeekend) {
      hitech -= 35; gachi -= 30; raidurg -= 40;
      kondapur -= 30; shaikpet1 -= 25; shaikpet2 -= 20;
    }

    return {
      date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      iso: date.toISOString(),
      "CS Coworking - Hitech City": Math.max(0, hitech),
      "CS Coworking - Gachibowli": Math.max(0, gachi),
      "CS Coworking - Raidurg": Math.max(0, raidurg),
      "CS Coworking - Kondapur": Math.max(0, kondapur),
      "CS Coworking - Shaikpet I": Math.max(0, shaikpet1),
      "CS Coworking - Shaikpet II": Math.max(0, shaikpet2),
    };
  });
}

/** Derive an initial notification set from current entities. */
export function generateNotifications(
  now: number,
  members: Member[],
  invoices: Invoice[],
  visitors: Visitor[],
  leads: Lead[],
): Notification[] {
  const out: Notification[] = [];
  let id = 1;
  const push = (n: Omit<Notification, "id" | "read">) =>
    out.push({ id: `n-${id++}`, read: false, ...n });

  // Top 3 expiring contracts
  const expiring = [...members]
    .filter((m) => {
      const daysLeft = (new Date(m.contractEnd).getTime() - now) / DAY;
      return daysLeft > 0 && daysLeft <= 7;
    })
    .sort((a, b) => a.contractEnd.localeCompare(b.contractEnd))
    .slice(0, 3);
  for (const m of expiring) {
    const days = Math.max(1, Math.ceil((new Date(m.contractEnd).getTime() - now) / DAY));
    push({
      type: "renewal_due",
      severity: days <= 3 ? "critical" : "warning",
      message: `${m.name}'s contract expires in ${days} day${days === 1 ? "" : "s"} — no renewal yet`,
      branchId: m.branchId,
      link: `/renewals`,
      timestamp: now - intBetween(makeRng(hashSeed(m.id)), 30, 240) * 60 * 1000,
    });
  }

  // Top 2 overdue invoices by amount
  const overdue = [...invoices]
    .filter((i) => i.status === "overdue")
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 2);
  for (const inv of overdue) {
    const member = members.find((m) => m.id === inv.memberId);
    const daysOverdue = Math.max(1, Math.ceil((now - new Date(inv.dueAt).getTime()) / DAY));
    push({
      type: "invoice_overdue",
      severity: daysOverdue > 14 ? "critical" : "warning",
      message: `Invoice ₹${(inv.amount / 1000).toFixed(0)}k overdue ${daysOverdue} days — ${member?.company || member?.name || "unknown"}`,
      branchId: inv.branchId,
      link: member ? `/members/${member.id}` : undefined,
      timestamp: now - daysOverdue * 60 * 60 * 1000,
    });
  }

  // Visitors overstaying (>8h, still inside)
  const overstaying = visitors.filter((v) => {
    if (v.checkOutAt) return false;
    const hours = (now - new Date(v.checkInAt).getTime()) / (60 * 60 * 1000);
    return hours > 8;
  });
  for (const v of overstaying) {
    push({
      type: "visitor_overstay",
      severity: "warning",
      message: `Visitor ${v.name} still checked in after 8+ hours`,
      branchId: v.branchId,
      link: `/visitors`,
      timestamp: now - 10 * 60 * 1000,
    });
  }

  // Recent won leads (informational)
  const recentWon = leads
    .filter((l) => l.stage === "won" && now - new Date(l.createdAt).getTime() < 14 * DAY)
    .slice(0, 1);
  for (const l of recentWon) {
    push({
      type: "lead_won",
      severity: "info",
      message: `Lead won: ${l.name}${l.company ? ` (${l.company})` : ""} — ₹${((l.mrr || 0) / 1000).toFixed(0)}k MRR`,
      branchId: l.branchId,
      link: `/leads`,
      timestamp: new Date(l.createdAt).getTime(),
    });
  }

  // Branch-level: any branch with occupancy < 60 today (we approximate via floor plans)
  for (const branch of BRANCHES) {
    const fp = generateFloorPlan(branch.id);
    const total = fp.seats.length;
    const occupied = fp.seats.filter((s) => s.status === "occupied" || s.status === "reserved").length;
    const occ = total ? Math.round((occupied / total) * 100) : 0;
    if (occ < 55) {
      push({
        type: "occupancy_low",
        severity: occ < 45 ? "warning" : "info",
        message: `${branch.name} occupancy at ${occ}% — below the 60% threshold`,
        branchId: branch.id,
        link: `/floor-map?branch=${branch.id}`,
        timestamp: now - 6 * 60 * 60 * 1000,
      });
    }
  }

  // Sort newest first
  return out.sort((a, b) => b.timestamp - a.timestamp);
}

/** Derive an initial activity feed from current entities. */
export function generateActivity(
  now: number,
  members: Member[],
  visitors: Visitor[],
  leads: Lead[],
  bookings: Booking[],
  invoices: Invoice[],
): ActivityEvent[] {
  const out: ActivityEvent[] = [];
  let id = 1;
  const push = (e: Omit<ActivityEvent, "id">) =>
    out.push({ id: `a-${id++}`, ...e });

  for (const v of visitors) {
    push({
      timestamp: new Date(v.checkInAt).getTime(),
      type: "visitor_checkin",
      message: `${v.name} checked in for "${v.purpose}"`,
      link: `/visitors`,
      branchId: v.branchId,
    });
    if (v.checkOutAt) {
      push({
        timestamp: new Date(v.checkOutAt).getTime(),
        type: "visitor_checkout",
        message: `${v.name} checked out`,
        link: `/visitors`,
        branchId: v.branchId,
      });
    }
  }

  for (const l of leads.filter((x) => x.stage === "won").slice(0, 5)) {
    push({
      timestamp: new Date(l.createdAt).getTime(),
      type: "lead_moved",
      message: `Lead won: ${l.name}`,
      link: `/leads`,
      branchId: l.branchId,
    });
  }

  for (const b of bookings.slice(0, 6)) {
    push({
      timestamp: new Date(b.startTime).getTime(),
      type: "booking_created",
      message: `${b.guestName} booked ${b.purpose}`,
      link: `/bookings`,
    });
  }

  for (const inv of invoices.filter((i) => i.status === "paid" && i.paidAt).slice(0, 4)) {
    const member = members.find((m) => m.id === inv.memberId);
    push({
      timestamp: new Date(inv.paidAt!).getTime(),
      type: "invoice_paid",
      message: `Invoice paid: ${member?.name || "Member"} (${formatINRCompact(inv.amount)})`,
      link: member ? `/members/${member.id}` : undefined,
      branchId: inv.branchId,
    });
  }

  return out.sort((a, b) => b.timestamp - a.timestamp).slice(0, 40);
}

function formatINRCompact(v: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
    notation: "compact",
  }).format(v);
}

import type { CurrentUser } from "@/types";

/** Default current user. */
export const CURRENT_USER: CurrentUser = {
  name: "Avinash Kumar",
  email: "avinash.kumar@furdial.com",
  role: "operations",
  roleLabel: "Operations Lead",
  initials: "A",
  branchScope: "all",
};
