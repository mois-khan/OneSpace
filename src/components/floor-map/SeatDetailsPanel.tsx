"use client";

import { useState, useMemo } from "react";
import { Seat, Lead } from "@/types";
import { useAllMembers, useLeads } from "@/lib/store";
import type { OnboardMemberPayload } from "@/lib/store";
import {
  X,
  User,
  Building2,
  CreditCard,
  MapPin,
  ArrowRight,
  AlertTriangle,
  UserPlus,
  Search,
  CheckCircle2,
  Phone,
  Mail,
  Briefcase,
} from "lucide-react";
import Link from "next/link";
import { cn, formatCurrency } from "@/lib/utils";

interface SeatDetailsPanelProps {
  seat: Seat | null;
  branchId: string;
  onClose: () => void;
  onAssignSeat?: (seatId: string, payload: OnboardMemberPayload) => void;
}

const statusConfig = {
  available: { label: "Available", color: "text-green-700", bg: "bg-green-100" },
  occupied: { label: "Occupied", color: "text-red-700", bg: "bg-red-100" },
  reserved: { label: "Reserved", color: "text-amber-700", bg: "bg-amber-100" },
  maintenance: { label: "Under Maintenance", color: "text-gray-700", bg: "bg-gray-100" },
};

const PLAN_PRICES: Record<string, number> = {
  flexi: 7999,
  day_pass: 499,
  dedicated: 12000,
  cabin: 22000,
};

type Tab = "lead" | "new";

export function SeatDetailsPanel({ seat, branchId, onClose, onAssignSeat }: SeatDetailsPanelProps) {
  const allMembers = useAllMembers();
  const allLeads = useLeads(branchId);

  // Available seat assignment state
  const [activeTab, setActiveTab] = useState<Tab>("lead");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [onboardedName, setOnboardedName] = useState("");

  // New member form state
  const [formName, setFormName] = useState("");
  const [formCompany, setFormCompany] = useState("");
  const [formEmail, setFormEmail] = useState("");
  const [formPhone, setFormPhone] = useState("");
  const [formPlan, setFormPlan] = useState<"flexi" | "dedicated" | "cabin">("dedicated");

  if (!seat) return null;

  const cfg = statusConfig[seat.status];
  const memberInfo = seat.memberId ? allMembers.find((m) => m.id === seat.memberId) : null;
  const isAtRisk = memberInfo?.status === "expiring";

  // Filter leads that are in the pipeline (not won/lost)
  const pipelineLeads = useMemo(() => {
    const stages = ["new", "toured", "proposal", "negotiating"];
    return allLeads.filter(
      (l) => stages.includes(l.stage) && l.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [allLeads, searchQuery]);

  const handleAssignLead = () => {
    if (!selectedLead || !onAssignSeat) return;
    const planType =
      selectedLead.planType.toLowerCase() === "cabin"
        ? "cabin"
        : selectedLead.planType.toLowerCase() === "flexi"
        ? "flexi"
        : "dedicated";
    const payload: OnboardMemberPayload = {
      name: selectedLead.name,
      company: selectedLead.company,
      email: selectedLead.email || `${selectedLead.name.split(" ")[0].toLowerCase()}@example.com`,
      phone: selectedLead.phone,
      planType: planType as "flexi" | "dedicated" | "cabin",
      monthlyFee: selectedLead.mrr || PLAN_PRICES[planType],
      branchId,
      seatId: seat.id,
      leadId: selectedLead.id,
    };
    onAssignSeat(seat.id, payload);
    setOnboardedName(selectedLead.name);
    setShowSuccess(true);
  };

  const handleOnboardNew = () => {
    if (!formName || !formEmail || !formPhone || !onAssignSeat) return;
    const payload: OnboardMemberPayload = {
      name: formName,
      company: formCompany || undefined,
      email: formEmail,
      phone: formPhone,
      planType: formPlan,
      monthlyFee: PLAN_PRICES[formPlan],
      branchId,
      seatId: seat.id,
    };
    onAssignSeat(seat.id, payload);
    setOnboardedName(formName);
    setShowSuccess(true);
  };

  const isFormValid = formName.trim() && formEmail.trim() && formPhone.trim();

  return (
    <div className="w-[320px] bg-white border-l border-cs-gray-200 h-full flex flex-col animate-in slide-in-from-right-5 duration-300 shadow-[-4px_0_16px_rgba(0,0,0,0.06)]">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-cs-gray-100">
        <div className="flex items-center gap-2">
          <MapPin className="w-4 h-4 text-cs-red" />
          <span className="font-semibold text-cs-black font-heading text-sm">{seat.code}</span>
        </div>
        <button onClick={onClose} className="p-1 hover:bg-cs-gray-50 rounded-md transition-colors">
          <X className="w-4 h-4 text-cs-gray-500" />
        </button>
      </div>

      {/* Status Badge */}
      <div className="px-4 pt-4">
        <span className={cn("text-xs font-semibold px-2.5 py-1 rounded-full", cfg.bg, cfg.color)}>
          {cfg.label}
        </span>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 space-y-5 overflow-y-auto">
        {/* ── OCCUPIED ── */}
        {seat.status === "occupied" && memberInfo && (
          <>
            <div className="bg-cs-gray-50 rounded-xl p-4 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-cs-red-bg flex items-center justify-center text-cs-red font-bold text-sm border border-cs-red/20">
                  {memberInfo.name.charAt(0)}
                </div>
                <div>
                  <p className="font-semibold text-cs-black text-sm">{memberInfo.name}</p>
                  <p className="text-xs text-cs-gray-500 capitalize">
                    {memberInfo.planType.replace("_", " ")} Plan
                  </p>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-cs-gray-600">
                  <Building2 className="w-3.5 h-3.5" />
                  {memberInfo.company || "Independent"}
                </div>
                <div className="flex items-center gap-2 text-xs text-cs-gray-600">
                  <CreditCard className="w-3.5 h-3.5" />
                  {formatCurrency(memberInfo.monthlyFee)}/mo
                </div>
              </div>
            </div>

            {isAtRisk && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex gap-3">
                <AlertTriangle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-red-700">Contract Ending in 5 Days</p>
                  <p className="text-xs text-red-600 mt-0.5">
                    High churn risk — no renewal initiated. 22 days since last visit.
                  </p>
                </div>
              </div>
            )}

            <Link
              href={`/members/${memberInfo.id}`}
              className="w-full flex items-center justify-center gap-2 bg-cs-black text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-cs-black/90 transition-colors"
            >
              <User className="w-4 h-4" />
              View Full Profile
              <ArrowRight className="w-3.5 h-3.5 ml-auto" />
            </Link>
          </>
        )}

        {/* ── AVAILABLE — ASSIGNMENT UI ── */}
        {seat.status === "available" && !showSuccess && (
          <>
            <div className="bg-green-50 rounded-xl p-3 text-center space-y-1">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center mx-auto">
                <MapPin className="w-5 h-5 text-green-600" />
              </div>
              <p className="text-sm font-semibold text-green-800">Ready for Assignment</p>
              <p className="text-[11px] text-green-600">
                Assign a lead or onboard a new member to this seat.
              </p>
            </div>

            {/* Tab Switcher */}
            <div className="flex bg-cs-gray-50 rounded-lg p-0.5 gap-0.5">
              <button
                onClick={() => setActiveTab("lead")}
                className={cn(
                  "flex-1 text-xs font-semibold py-2 rounded-md transition-all duration-200",
                  activeTab === "lead"
                    ? "bg-white text-cs-black shadow-sm"
                    : "text-cs-gray-500 hover:text-cs-gray-700",
                )}
              >
                Assign Lead
              </button>
              <button
                onClick={() => setActiveTab("new")}
                className={cn(
                  "flex-1 text-xs font-semibold py-2 rounded-md transition-all duration-200",
                  activeTab === "new"
                    ? "bg-white text-cs-black shadow-sm"
                    : "text-cs-gray-500 hover:text-cs-gray-700",
                )}
              >
                New Member
              </button>
            </div>

            {/* ── Tab 1: Assign Lead ── */}
            {activeTab === "lead" && (
              <div className="space-y-3 animate-in fade-in duration-200">
                {/* Search */}
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-cs-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search leads..."
                    className="w-full pl-9 pr-3 py-2 text-xs border border-cs-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cs-red/20 focus:border-cs-red transition-all"
                  />
                </div>

                {/* Lead List */}
                <div className="max-h-[200px] overflow-y-auto space-y-1.5 pr-1">
                  {pipelineLeads.length === 0 && (
                    <p className="text-xs text-cs-gray-400 text-center py-4">
                      No pipeline leads found for this branch.
                    </p>
                  )}
                  {pipelineLeads.map((lead) => (
                    <button
                      key={lead.id}
                      onClick={() => setSelectedLead(selectedLead?.id === lead.id ? null : lead)}
                      className={cn(
                        "w-full flex items-center gap-3 p-2.5 rounded-lg border transition-all text-left",
                        selectedLead?.id === lead.id
                          ? "border-cs-red bg-cs-red-bg/40 ring-1 ring-cs-red/30"
                          : "border-cs-gray-100 hover:border-cs-gray-200 hover:bg-cs-gray-50",
                      )}
                    >
                      <div
                        className={cn(
                          "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
                          selectedLead?.id === lead.id
                            ? "bg-cs-red text-white"
                            : "bg-cs-gray-100 text-cs-gray-600",
                        )}
                      >
                        {lead.name.charAt(0)}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold text-cs-black truncate">{lead.name}</p>
                        <p className="text-[10px] text-cs-gray-500 truncate">
                          {lead.company || lead.phone} · {lead.planType} ·{" "}
                          <span className="capitalize">{lead.stage}</span>
                        </p>
                      </div>
                      {lead.mrr && (
                        <span className="text-[10px] font-medium text-cs-gray-500 shrink-0">
                          ₹{(lead.mrr / 1000).toFixed(0)}k
                        </span>
                      )}
                    </button>
                  ))}
                </div>

                {/* Assign Button */}
                <button
                  onClick={handleAssignLead}
                  disabled={!selectedLead}
                  className={cn(
                    "w-full flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all",
                    selectedLead
                      ? "bg-cs-red text-white hover:bg-cs-red-dark shadow-sm"
                      : "bg-cs-gray-100 text-cs-gray-400 cursor-not-allowed",
                  )}
                >
                  <UserPlus className="w-4 h-4" />
                  {selectedLead
                    ? `Assign ${selectedLead.name.split(" ")[0]}`
                    : "Select a lead first"}
                  <ArrowRight className="w-3.5 h-3.5 ml-auto" />
                </button>
              </div>
            )}

            {/* ── Tab 2: New Member ── */}
            {activeTab === "new" && (
              <div className="space-y-3 animate-in fade-in duration-200">
                {/* Name */}
                <div>
                  <label className="block text-[10px] font-bold text-cs-gray-500 uppercase tracking-wider mb-1">
                    Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-3.5 h-3.5 text-cs-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={formName}
                      onChange={(e) => setFormName(e.target.value)}
                      placeholder="e.g. Priya Sharma"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-cs-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cs-red/20 focus:border-cs-red transition-all"
                    />
                  </div>
                </div>

                {/* Company */}
                <div>
                  <label className="block text-[10px] font-bold text-cs-gray-500 uppercase tracking-wider mb-1">
                    Company
                  </label>
                  <div className="relative">
                    <Briefcase className="w-3.5 h-3.5 text-cs-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={formCompany}
                      onChange={(e) => setFormCompany(e.target.value)}
                      placeholder="Optional"
                      className="w-full pl-9 pr-3 py-2 text-xs border border-cs-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cs-red/20 focus:border-cs-red transition-all"
                    />
                  </div>
                </div>

                {/* Email & Phone row */}
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-bold text-cs-gray-500 uppercase tracking-wider mb-1">
                      Email *
                    </label>
                    <div className="relative">
                      <Mail className="w-3 h-3 text-cs-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        value={formEmail}
                        onChange={(e) => setFormEmail(e.target.value)}
                        placeholder="email@co"
                        className="w-full pl-7 pr-2 py-2 text-[11px] border border-cs-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cs-red/20 focus:border-cs-red transition-all"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-cs-gray-500 uppercase tracking-wider mb-1">
                      Phone *
                    </label>
                    <div className="relative">
                      <Phone className="w-3 h-3 text-cs-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        value={formPhone}
                        onChange={(e) => setFormPhone(e.target.value)}
                        placeholder="+91 98765"
                        className="w-full pl-7 pr-2 py-2 text-[11px] border border-cs-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-cs-red/20 focus:border-cs-red transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Plan Type */}
                <div>
                  <label className="block text-[10px] font-bold text-cs-gray-500 uppercase tracking-wider mb-1.5">
                    Plan Type
                  </label>
                  <div className="flex gap-1.5">
                    {(["flexi", "dedicated", "cabin"] as const).map((plan) => (
                      <button
                        key={plan}
                        onClick={() => setFormPlan(plan)}
                        className={cn(
                          "flex-1 py-2 rounded-lg text-[11px] font-semibold capitalize transition-all border",
                          formPlan === plan
                            ? "bg-cs-red text-white border-cs-red shadow-sm"
                            : "bg-white text-cs-gray-600 border-cs-gray-200 hover:border-cs-gray-300",
                        )}
                      >
                        {plan}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10px] text-cs-gray-400 mt-1.5 text-right">
                    ₹{PLAN_PRICES[formPlan].toLocaleString("en-IN")}/mo
                  </p>
                </div>

                {/* Submit */}
                <button
                  onClick={handleOnboardNew}
                  disabled={!isFormValid}
                  className={cn(
                    "w-full flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium transition-all",
                    isFormValid
                      ? "bg-cs-red text-white hover:bg-cs-red-dark shadow-sm"
                      : "bg-cs-gray-100 text-cs-gray-400 cursor-not-allowed",
                  )}
                >
                  <UserPlus className="w-4 h-4" />
                  Onboard Member
                  <ArrowRight className="w-3.5 h-3.5 ml-auto" />
                </button>
              </div>
            )}
          </>
        )}

        {/* ── SUCCESS STATE ── */}
        {seat.status === "available" && showSuccess && (
          <div className="flex flex-col items-center justify-center py-6 space-y-4 animate-in zoom-in-95 fade-in duration-400">
            <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center">
              <CheckCircle2 className="w-8 h-8 text-green-500" />
            </div>
            <div className="text-center space-y-1">
              <p className="text-base font-bold text-cs-black">Member Onboarded!</p>
              <p className="text-xs text-cs-gray-500">
                <span className="font-semibold text-green-700">{onboardedName}</span> has been
                assigned to seat <span className="font-semibold">{seat.code}</span>.
              </p>
            </div>
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 w-full text-xs text-green-700 space-y-1">
              <p>✓ Member profile created</p>
              <p>✓ First invoice generated (pending)</p>
              <p>✓ Seat marked as occupied</p>
              {selectedLead && <p>✓ Lead converted to Won</p>}
            </div>
            <button
              onClick={onClose}
              className="w-full bg-cs-black text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-cs-black/90 transition-colors"
            >
              Done
            </button>
          </div>
        )}

        {/* ── RESERVED ── */}
        {seat.status === "reserved" && (
          <div className="bg-amber-50 rounded-xl p-4 text-center space-y-2">
            <p className="text-sm font-semibold text-amber-800">Reserved</p>
            <p className="text-xs text-amber-600">
              This seat/room is currently reserved for an upcoming booking.
            </p>
          </div>
        )}

        {/* ── MAINTENANCE ── */}
        {seat.status === "maintenance" && (
          <div className="bg-gray-50 rounded-xl p-4 text-center space-y-2">
            <p className="text-sm font-semibold text-gray-700">Under Maintenance</p>
            <p className="text-xs text-gray-500">
              This seat is temporarily unavailable due to maintenance work.
            </p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-cs-gray-100 text-xs text-cs-gray-400 text-center">
        Zone: {seat.zoneId.replace("z-", "").toUpperCase()} · Seat ID: {seat.id}
      </div>
    </div>
  );
}
