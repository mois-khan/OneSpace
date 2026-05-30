"use client";

import { useMemo, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import {
  Camera,
  Check,
  QrCode,
  Send,
  LogIn,
  ScanLine,
  Copy,
  RefreshCcw,
  Maximize2,
  Sparkles,
  X,
  UserCheck,
  CalendarCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMembers, useBranch, useAppActions } from "@/lib/store";
import { sendWhatsAppNotification } from "@/app/actions/whatsapp";
import { toast } from "sonner";

interface RegistrationDeskProps {
  onCheckIn: (visitor: { name: string; phone: string; purpose: string; hostName: string }) => void;
}

const PURPOSES = ["Client Meeting", "Interview", "Demo", "Delivery", "Personal", "Other"];

export function RegistrationDesk({ onCheckIn }: RegistrationDeskProps) {
  const { selectedBranchId, selectedBranch } = useBranch();
  const members = useMembers(selectedBranchId);
  const { addPreRegistration } = useAppActions();
  const [activeTab, setActiveTab] = useState<"manual" | "pre-register">("manual");
  const branchId = selectedBranchId === "all" ? "b2" : selectedBranchId;
  const branchName = selectedBranch?.name || "CS Coworking";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      
      {/* LEFT COLUMN: Forms Card (Col-span 2) */}
      <div className="lg:col-span-2 bg-white border border-cs-gray-200 rounded-2xl shadow-sm overflow-hidden">
        
        {/* Tab Header Selector */}
        <div className="border-b border-cs-gray-100 bg-cs-gray-50/50 p-4 flex justify-between items-center gap-4 flex-wrap">
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab("manual")}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-semibold tracking-wide uppercase flex items-center gap-1.5 transition-all border",
                activeTab === "manual"
                  ? "bg-cs-black border-cs-black text-white shadow-sm"
                  : "bg-white border-cs-gray-200 text-cs-gray-600 hover:text-cs-black"
              )}
            >
              <LogIn className="w-3.5 h-3.5" /> Manual Check-in
            </button>
            <button
              onClick={() => setActiveTab("pre-register")}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-semibold tracking-wide uppercase flex items-center gap-1.5 transition-all border",
                activeTab === "pre-register"
                  ? "bg-cs-black border-cs-black text-white shadow-sm"
                  : "bg-white border-cs-gray-200 text-cs-gray-600 hover:text-cs-black"
              )}
            >
              <QrCode className="w-3.5 h-3.5" /> Pre-Register Guest
            </button>
          </div>
          <div className="text-[11px] text-cs-gray-400 font-medium">
            Active Scope: <span className="text-cs-red font-semibold">{branchName}</span>
          </div>
        </div>

        {/* Tab Content Panel */}
        <div className="p-6">
          {activeTab === "manual" ? (
            <ManualCheckInForm members={members} onCheckIn={onCheckIn} />
          ) : (
            <PreRegisterForm
              members={members}
              branchId={branchId}
              branchName={branchName}
              onAdd={addPreRegistration}
            />
          )}
        </div>

      </div>

      {/* RIGHT COLUMN: Kiosk QR Kiosk Code (Col-span 1) */}
      <div className="lg:col-span-1">
        <KioskCard branchId={branchId} />
      </div>

    </div>
  );
}

/* ============================================================================
   SUB-COMPONENT: ManualCheckInForm
   ============================================================================ */
function ManualCheckInForm({
  members,
  onCheckIn,
}: {
  members: ReturnType<typeof useMembers>;
  onCheckIn: RegistrationDeskProps["onCheckIn"];
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [purpose, setPurpose] = useState(PURPOSES[0]);
  const [hostQuery, setHostQuery] = useState("");
  const [hostId, setHostId] = useState("");
  const [isPhotoTaken, setIsPhotoTaken] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [doneId, setDoneId] = useState<string | null>(null);

  const hostMatches = useMemo(() => {
    const q = hostQuery.trim().toLowerCase();
    if (!q) return [];
    return members
      .filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          (m.company || "").toLowerCase().includes(q)
      )
      .slice(0, 5);
  }, [hostQuery, members]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    setIsSubmitting(true);
    const member = members.find((m) => m.id === hostId);
    const hostName = member?.name || hostQuery || "Reception";

    setTimeout(() => {
      onCheckIn({ name, phone, purpose, hostName });
      const newId = `v-${Date.now()}`;
      setDoneId(newId);
      setIsSubmitting(false);
    }, 600);
  };

  const handleReset = () => {
    setName("");
    setPhone("");
    setPurpose(PURPOSES[0]);
    setHostQuery("");
    setHostId("");
    setIsPhotoTaken(false);
    setDoneId(null);
  };

  if (doneId) {
    return (
      <div className="flex flex-col items-center justify-center py-8 space-y-5 animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 bg-status-green/10 text-status-green rounded-full flex items-center justify-center border border-status-green/20">
          <UserCheck className="w-8 h-8" />
        </div>
        <div className="text-center max-w-sm">
          <h4 className="text-lg font-bold text-cs-black">Visitor Checked In Successfully</h4>
          <p className="text-sm text-cs-gray-500 mt-1">
            <strong>{name}</strong> is now registered and marked as arrived.
          </p>
        </div>

        <div className="p-3 bg-white border border-cs-gray-200 rounded-2xl shadow-sm">
          <QRCodeSVG value={`onespace://visitor/${doneId}`} size={140} fgColor="#0D1B2A" level="M" />
        </div>

        <div className="flex gap-2 w-full max-w-xs">
          <button
            type="button"
            onClick={() => {
              toast.success("Printed visitor pass badge!");
            }}
            className="flex-1 inline-flex items-center justify-center gap-2 border border-cs-gray-200 hover:bg-cs-gray-50 text-cs-black rounded-xl py-2.5 text-xs font-semibold transition-colors"
          >
            Print Badge
          </button>
          <button
            type="button"
            onClick={handleReset}
            className="flex-1 inline-flex items-center justify-center gap-2 bg-cs-red hover:bg-cs-red-dark text-white rounded-xl py-2.5 text-xs font-semibold transition-all shadow-sm"
          >
            Check In Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Name Field */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-cs-gray-500">Full Name *</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Rahul Verma"
            className="w-full px-4 py-2.5 border border-cs-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-cs-red focus:border-cs-red transition-all bg-white text-cs-black"
          />
        </div>

        {/* Phone Field */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-cs-gray-500">Mobile number *</label>
          <div className="flex">
            <span className="inline-flex items-center px-4 rounded-l-xl border border-r-0 border-cs-gray-200 bg-cs-gray-50 text-cs-gray-500 text-sm">
              +91
            </span>
            <input
              required
              type="tel"
              pattern="[6789][0-9]{9}"
              title="Enter a valid 10-digit phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="98765 43210"
              className="w-full px-4 py-2.5 border border-cs-gray-200 rounded-r-xl text-sm focus:outline-none focus:ring-1 focus:ring-cs-red focus:border-cs-red transition-all bg-white text-cs-black"
            />
          </div>
        </div>

        {/* Purpose Field */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-cs-gray-500">Purpose of Visit</label>
          <select
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            className="w-full px-4 py-2.5 border border-cs-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-cs-red focus:border-cs-red transition-all bg-white text-cs-black"
          >
            {PURPOSES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        {/* Host Search field */}
        <div className="space-y-1 relative">
          <label className="text-[10px] font-bold uppercase tracking-wider text-cs-gray-500">Host (Type to search)</label>
          <input
            value={hostQuery}
            onChange={(e) => {
              setHostQuery(e.target.value);
              setHostId("");
            }}
            placeholder="Type host name..."
            className="w-full px-4 py-2.5 border border-cs-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-cs-red focus:border-cs-red transition-all bg-white text-cs-black"
          />
          {hostQuery && !hostId && hostMatches.length > 0 && (
            <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-cs-gray-200 rounded-xl shadow-lg max-h-44 overflow-y-auto divide-y divide-cs-gray-50">
              {hostMatches.map((m) => (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => {
                    setHostId(m.id);
                    setHostQuery(m.name);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-cs-gray-50 text-xs text-cs-black flex flex-col"
                >
                  <span className="font-semibold">{m.name}</span>
                  {m.company && <span className="text-[10px] text-cs-gray-400">{m.company}</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Capture Photo simulated */}
      <div className="pt-2">
        <button
          type="button"
          onClick={() => setIsPhotoTaken(true)}
          className={cn(
            "w-full flex items-center justify-center gap-2 py-3 rounded-xl border-2 border-dashed text-xs font-semibold transition-all",
            isPhotoTaken
              ? "border-status-green/30 bg-status-green/5 text-status-green"
              : "border-cs-gray-200 bg-cs-gray-50/50 text-cs-gray-500 hover:border-cs-gray-300"
          )}
        >
          {isPhotoTaken ? (
            <>
              <Check className="w-4 h-4 text-status-green" /> Photo captured successfully
            </>
          ) : (
            <>
              <Camera className="w-4 h-4" /> Simulate camera photo capture
            </>
          )}
        </button>
      </div>

      <div className="pt-4 flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting || !name || !phone}
          className="bg-cs-black hover:bg-cs-gray-800 text-white rounded-xl px-6 py-3 text-xs font-bold transition-all shadow flex items-center gap-2 disabled:opacity-50"
        >
          {isSubmitting ? (
            "Processing Check-in..."
          ) : (
            <>
              <LogIn className="w-4 h-4" /> Check in Visitor
            </>
          )}
        </button>
      </div>
    </form>
  );
}

/* ============================================================================
   SUB-COMPONENT: PreRegisterForm
   ============================================================================ */
function PreRegisterForm({
  members,
  branchId,
  branchName,
  onAdd,
}: {
  members: ReturnType<typeof useMembers>;
  branchId: string;
  branchName: string;
  onAdd: ReturnType<typeof useAppActions>["addPreRegistration"];
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [purpose, setPurpose] = useState(PURPOSES[0]);
  const [hostQuery, setHostQuery] = useState("");
  const [hostId, setHostId] = useState("");
  const [time, setTime] = useState("");
  const [created, setCreated] = useState<{ name: string; code: string; phone: string; host: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const hostMatches = useMemo(() => {
    const q = hostQuery.trim().toLowerCase();
    if (!q) return [];
    return members.filter((m) => m.name.toLowerCase().includes(q)).slice(0, 5);
  }, [hostQuery, members]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    setIsSubmitting(true);
    const host = members.find((m) => m.id === hostId);
    const hostName = host?.name || hostQuery || "Reception";
    const scheduledFor = time
      ? new Date(time).toISOString()
      : new Date(Date.now() + 60 * 60 * 1000).toISOString();

    const localCode = `OS-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

    // 1. Add Pre-Registration in Store
    onAdd({
      branchId,
      visitorName: name,
      phone: "+91 " + phone.replace(/\s+/g, ""),
      purpose,
      hostName,
      scheduledFor,
      inviteCode: localCode,
    });

    const fullPhone = "+91 " + phone.replace(/\s+/g, "");
    
    // Simulate checkin page URL on client side
    const checkinUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/walkin?code=${localCode}`
        : `/walkin?code=${localCode}`;

    const waMessage = `Hi ${name.split(" ")[0]} — your visit to CS Coworking ${branchName} is confirmed. Tap to check in on arrival: ${checkinUrl}\nInvite code: ${localCode}`;

    try {
      // 2. Auto-dispatch server side WhatsApp message
      await sendWhatsAppNotification(fullPhone, waMessage);
      toast.success(`Invite generated and WhatsApp notification sent to ${name}`);
    } catch (err) {
      console.error("WhatsApp trigger failed", err);
      toast.error(`Invite code generated, but WhatsApp dispatch failed.`);
    }

    setCreated({ name, code: localCode, phone: fullPhone, host: hostName });
    setIsSubmitting(false);
  };

  const handleReset = () => {
    setName("");
    setPhone("");
    setPurpose(PURPOSES[0]);
    setHostQuery("");
    setHostId("");
    setTime("");
    setCreated(null);
  };

  if (created) {
    const checkinUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/walkin`
        : `/walkin`;
    const waMessage = `Hi ${created.name.split(" ")[0]} — your visit to CS Coworking ${branchName} is confirmed. Tap to check in on arrival: ${checkinUrl}\nInvite code: ${created.code}`;
    const waUrl = `https://wa.me/${created.phone.replace(/\D/g, "")}?text=${encodeURIComponent(waMessage)}`;

    return (
      <div className="space-y-5 animate-in zoom-in-95 duration-200 py-4 flex flex-col items-center">
        <div className="w-16 h-16 bg-cs-red-bg text-cs-red rounded-full flex items-center justify-center border border-cs-red/20">
          <CalendarCheck className="w-8 h-8" />
        </div>
        <div className="text-center max-w-sm">
          <h4 className="text-lg font-bold text-cs-black font-heading">Pre-Registration Confirmed</h4>
          <p className="text-sm text-cs-gray-500 mt-1">
            An invite code has been generated and mock WhatsApp dispatched.
          </p>
        </div>

        <div className="p-3 bg-white border border-cs-gray-200 rounded-2xl shadow-sm">
          <QRCodeSVG value={`${checkinUrl}?code=${created.code}`} size={140} fgColor="#0D1B2A" level="M" />
        </div>

        {/* Code details Box */}
        <div className="w-full max-w-sm bg-cs-gray-50 border border-cs-gray-100 rounded-xl p-4 space-y-2.5">
          <div className="flex justify-between items-center text-xs">
            <span className="text-cs-gray-500 font-semibold uppercase tracking-wider text-[10px]">Invite Code</span>
            <div className="flex items-center gap-1.5">
              <code className="text-sm font-bold text-cs-black bg-white px-2 py-0.5 border border-cs-gray-200 rounded font-mono tracking-wider">{created.code}</code>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(created.code);
                  toast.success("Code copied");
                }}
                className="p-1 rounded bg-white hover:bg-cs-gray-100 border border-cs-gray-200 text-cs-gray-500 hover:text-cs-black transition-colors"
                title="Copy Code"
              >
                <Copy className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-cs-gray-500 font-semibold uppercase tracking-wider text-[10px]">Visitor WhatsApp</span>
            <span className="font-semibold text-cs-black font-mono">{created.phone}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-2 w-full max-w-sm pt-2">
          <a
            href={waUrl}
            target="_blank"
            rel="noreferrer noopener"
            className="flex-1 inline-flex items-center justify-center gap-2 bg-[#25D366] text-white rounded-xl py-2.5 text-xs font-semibold hover:bg-[#1ec55a] transition-all shadow-sm text-center"
          >
            <Send className="w-3.5 h-3.5" /> Open wa.me chat
          </a>
          <button
            type="button"
            onClick={handleReset}
            className="flex-1 inline-flex items-center justify-center gap-2 border border-cs-gray-200 hover:bg-cs-gray-50 text-cs-black rounded-xl py-2.5 text-xs font-semibold transition-colors"
          >
            <RefreshCcw className="w-3.5 h-3.5" /> Pre-register Another
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="flex items-start gap-2.5 p-3 rounded-xl bg-cs-red-bg/40 border border-cs-red/15 mb-2">
        <Sparkles className="w-4 h-4 text-cs-red mt-0.5 shrink-0 animate-pulse" />
        <p className="text-[11px] text-cs-gray-700 leading-relaxed">
          Pre-registering a guest logs the visit, generates an invite code (e.g. <strong>OS-ABCD</strong>), and notifies them via WhatsApp. 
          Upon arrival, the guest scans the front-desk QR to check in on their mobile, avoiding manual data entry at the desk.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Name Field */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-cs-gray-500">Visitor Name *</label>
          <input
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Ananya Verma"
            className="w-full px-4 py-2.5 border border-cs-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-cs-red focus:border-cs-red transition-all bg-white text-cs-black"
          />
        </div>

        {/* WhatsApp Field */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-cs-gray-500">WhatsApp number *</label>
          <div className="flex">
            <span className="inline-flex items-center px-4 rounded-l-xl border border-r-0 border-cs-gray-200 bg-cs-gray-50 text-cs-gray-500 text-sm">
              +91
            </span>
            <input
              required
              type="tel"
              pattern="[6789][0-9]{9}"
              title="Enter a valid 10-digit phone number"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="98765 43210"
              className="w-full px-4 py-2.5 border border-cs-gray-200 rounded-r-xl text-sm focus:outline-none focus:ring-1 focus:ring-cs-red focus:border-cs-red transition-all bg-white text-cs-black"
            />
          </div>
        </div>

        {/* Purpose */}
        <div className="space-y-1">
          <label className="text-[10px] font-bold uppercase tracking-wider text-cs-gray-500">Purpose</label>
          <select
            value={purpose}
            onChange={(e) => setPurpose(e.target.value)}
            className="w-full px-4 py-2.5 border border-cs-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-cs-red focus:border-cs-red transition-all bg-white text-cs-black"
          >
            {PURPOSES.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>

        {/* Host Search */}
        <div className="space-y-1 relative">
          <label className="text-[10px] font-bold uppercase tracking-wider text-cs-gray-500">Host (Who is inviting?)</label>
          <input
            value={hostQuery}
            onChange={(e) => {
              setHostQuery(e.target.value);
              setHostId("");
            }}
            placeholder="Type member name..."
            className="w-full px-4 py-2.5 border border-cs-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-cs-red focus:border-cs-red transition-all bg-white text-cs-black"
          />
          {hostQuery && !hostId && hostMatches.length > 0 && (
            <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-cs-gray-200 rounded-xl shadow-lg max-h-36 overflow-y-auto divide-y divide-cs-gray-50">
              {hostMatches.map((m) => (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => {
                    setHostId(m.id);
                    setHostQuery(m.name);
                  }}
                  className="w-full text-left px-4 py-2 hover:bg-cs-gray-50 text-xs text-cs-black flex flex-col"
                >
                  <span className="font-semibold">{m.name}</span>
                  {m.company && <span className="text-[10px] text-cs-gray-400">{m.company}</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ETA Arrival */}
        <div className="space-y-1 md:col-span-2">
          <label className="text-[10px] font-bold uppercase tracking-wider text-cs-gray-500">Expected Arrival Date & Time (Optional)</label>
          <input
            type="datetime-local"
            value={time}
            onChange={(e) => setTime(e.target.value)}
            className="w-full px-4 py-2.5 border border-cs-gray-200 rounded-xl text-sm focus:outline-none focus:ring-1 focus:ring-cs-red focus:border-cs-red transition-all bg-white text-cs-black"
          />
        </div>
      </div>

      <div className="pt-4 flex justify-end">
        <button
          type="submit"
          disabled={isSubmitting || !name || !phone}
          className="bg-cs-black hover:bg-cs-gray-800 text-white rounded-xl px-6 py-3 text-xs font-bold transition-all shadow flex items-center gap-2 disabled:opacity-50"
        >
          {isSubmitting ? (
            "Generating Invite..."
          ) : (
            <>
              <QrCode className="w-4 h-4" /> Pre-register & Generate QR
            </>
          )}
        </button>
      </div>
    </form>
  );
}

/* ============================================================================
   SUB-COMPONENT: KioskCard
   ============================================================================ */
function KioskCard({ branchId }: { branchId: string }) {
  const [isFullscreen, setIsFullscreen] = useState(false);

  const kioskUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/walkin?branch=${branchId}`
      : `/walkin?branch=${branchId}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(kioskUrl);
    toast.success("Self check-in link copied!");
  };

  return (
    <div className="bg-cs-black text-white rounded-2xl overflow-hidden border border-white/5 shadow-md p-6 flex flex-col items-center text-center space-y-4">
      <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-cs-red">
        <ScanLine className="w-5 h-5" />
      </div>
      <div>
        <h4 className="text-[15px] font-bold text-white font-heading uppercase tracking-wide">Self Check-In Kiosk</h4>
        <p className="text-[11px] text-cs-gray-400 mt-1.5 leading-relaxed max-w-[240px]">
          Walk-in candidates scan this QR with their mobile to self check-in without manual front-desk entry.
        </p>
      </div>

      {/* QR Code Graphic Box */}
      <div className="p-4 bg-white rounded-2xl shadow-inner inline-block my-2 border border-white/10">
        <QRCodeSVG value={kioskUrl} size={150} fgColor="#0D1B2A" level="M" />
      </div>

      <div className="text-[9px] font-mono text-cs-gray-500 truncate max-w-full bg-white/5 px-2.5 py-1.5 rounded-lg w-full">
        {kioskUrl}
      </div>

      {/* Action Buttons */}
      <div className="w-full space-y-2 pt-2 text-xs">
        <button
          type="button"
          onClick={() => setIsFullscreen(true)}
          className="w-full inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/15 text-white border border-white/10 rounded-xl py-2.5 font-semibold transition-colors"
        >
          <Maximize2 className="w-3.5 h-3.5" /> Fullscreen Display
        </button>
        <button
          type="button"
          onClick={handleCopyLink}
          className="w-full inline-flex items-center justify-center gap-2 bg-transparent hover:bg-white/5 text-cs-gray-300 rounded-xl py-2 font-semibold transition-colors border border-transparent"
        >
          <Copy className="w-3.5 h-3.5" /> Copy Kiosk Link
        </button>
      </div>

      {/* Fullscreen Kiosk Mode overlay */}
      {isFullscreen && (
        <div className="fixed inset-0 z-[60] bg-cs-black flex flex-col items-center justify-center text-white p-6 animate-in fade-in duration-200">
          <button
            type="button"
            onClick={() => setIsFullscreen(false)}
            className="absolute top-5 right-5 p-2 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white/70 hover:text-white transition-colors"
            aria-label="Exit kiosk"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="text-[11px] uppercase tracking-[0.3em] text-cs-red font-black mb-3">CS OneSpace</div>
          <h2 className="text-3xl font-extrabold font-heading mb-2">Welcome to CS Coworking</h2>
          <p className="text-sm text-cs-gray-400 mb-8 max-w-xs text-center">
            Scan this QR code with your phone camera to check in.
          </p>

          <div className="p-6 bg-white rounded-3xl shadow-[0_10px_40px_rgba(232,25,44,0.15)] border border-white/10">
            <QRCodeSVG value={kioskUrl} size={300} fgColor="#0D1B2A" level="M" />
          </div>

          <div className="mt-8 text-[11px] font-mono text-cs-gray-500 truncate max-w-sm bg-white/5 px-4 py-2 rounded-xl">
            {kioskUrl}
          </div>
          <p className="text-[12px] text-cs-gray-400 mt-8 max-w-xs text-center leading-relaxed">
            You can verify your pre-registered invite code or enter your visitor details on your phone.
          </p>
        </div>
      )}
    </div>
  );
}
