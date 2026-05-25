export interface Branch {
  id: string;
  name: string;
  location: string;
  totalSeats: number;
}

export interface Member {
  id: string;
  branchId: string;
  name: string;
  email: string;
  phone: string;
  company?: string;
  planType: "day_pass" | "flexi" | "dedicated" | "cabin";
  monthlyFee: number;
  contractStart: string;
  contractEnd: string;
  status: "active" | "trial" | "expiring" | "churned";
  seatId?: string;
  riskScore?: number;
  tickets: Ticket[];
  invoices: Invoice[];
  memberSince?: string;
  monthsAsMember?: number;
  daysSinceLastVisit?: number;
  avgVisitsPerMonth?: number;
}

export interface Ticket {
  id: string;
  title: string;
  status: "open" | "in_progress" | "resolved" | "closed";
}

export interface Invoice {
  id: string;
  amount: number;
  status: "pending" | "paid" | "overdue" | "refunded";
}

export interface Seat {
  id: string;
  zoneId: string;
  code: string;
  x: number;
  y: number;
  width: number;
  height: number;
  shape: "circle" | "rect";
  status: "available" | "occupied" | "reserved" | "maintenance";
  memberId?: string;
}

export interface Lead {
  id: string;
  branchId: string;
  name: string;
  company?: string;
  email?: string;
  phone: string;
  planType: string;
  source: string;
  stage: "new" | "toured" | "proposal" | "negotiating" | "won" | "lost";
  mrr?: number;
  assignedTo?: string;
  lossReason?: string;
  createdAt: string;
}

export interface Visitor {
  id: string;
  branchId: string;
  name: string;
  phone: string;
  purpose: string;
  hostName?: string;
  qrCode: string;
  checkInAt: string;
  checkOutAt?: string;
}

export interface Booking {
  id: string;
  roomId: string;
  memberId?: string;
  guestName?: string;
  purpose?: string;
  startTime: string;
  endTime: string;
  status: "confirmed" | "completed" | "cancelled";
}

export interface Room {
  id: string;
  branchId: string;
  name: string;
  capacity: number;
  type: "conference" | "phone_booth";
}
