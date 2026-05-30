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
  memberId: string;
  branchId: string;
  amount: number;
  status: "pending" | "paid" | "overdue" | "refunded";
  /** ISO timestamp when invoice was issued */
  issuedAt: string;
  /** ISO timestamp when invoice is due */
  dueAt: string;
  /** ISO timestamp when invoice was paid (if any) */
  paidAt?: string;
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

export interface LeadInteraction {
  id: string;
  type: "call" | "whatsapp" | "email" | "visit" | "stage_change" | "system" | "note";
  timestamp: string;
  author: string;
  notes: string;
  metadata?: any; 
}

export interface LeadNote {
  id: string;
  author: string;
  timestamp: string;
  text: string;
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
  followUpDate?: string;
  interactions: LeadInteraction[];
  notes: LeadNote[];
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
  /** ID of the pre-registration this visitor came from, if any. */
  preRegistrationId?: string;
}

/** A pre-registered visitor invitation — host sends this before the visitor arrives. */
export interface PreRegistration {
  id: string;
  branchId: string;
  visitorName: string;
  phone: string;
  purpose: string;
  hostName: string;
  /** Short alphanumeric code embedded in the invite QR (e.g., "OS-X7K4") */
  inviteCode: string;
  /** ISO string of when the visit is expected */
  scheduledFor: string;
  status: "pending" | "arrived" | "cancelled" | "expired";
  createdAt: string;
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

export type NotificationType =
  | "renewal_due"
  | "invoice_overdue"
  | "visitor_overstay"
  | "occupancy_low"
  | "lead_won"
  | "high_risk"
  | "booking_conflict"
  | "member_onboarded"
  | "ticket_open";

export type NotificationSeverity = "info" | "success" | "warning" | "critical";

export interface Notification {
  id: string;
  type: NotificationType;
  severity: NotificationSeverity;
  message: string;
  branchId?: string;
  /** Optional in-app link to navigate to */
  link?: string;
  /** ms since epoch */
  timestamp: number;
  read: boolean;
}

export interface ActivityEvent {
  id: string;
  /** ms since epoch */
  timestamp: number;
  type:
    | "visitor_checkin"
    | "visitor_checkout"
    | "lead_moved"
    | "lead_added"
    | "booking_created"
    | "booking_cancelled"
    | "member_renewed"
    | "invoice_paid"
    | "member_onboarded";
  message: string;
  /** Optional in-app link */
  link?: string;
  branchId?: string;
}

export type UserRole = "owner" | "operations" | "branch_manager" | "community";

export interface CurrentUser {
  name: string;
  email: string;
  role: UserRole;
  /** Human-readable role label for display */
  roleLabel: string;
  initials: string;
  /** When the role is branch-scoped, this is the branch the user is bound to.
   *  Otherwise, "all" — full access across branches.
   */
  branchScope: string;
}
