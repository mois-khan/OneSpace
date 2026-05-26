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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useMembers, useBranch, useAppActions } from "@/lib/store";
import { toast } from "sonner";

type Tab = "walk-in" | "pre-register" | "kiosk";

interface CheckInPanelProps {
  onCheckIn: (visitor: { name: string; phone: string; purpose: string; hostName: string }) => void;
}

const PURPOSES = ["Client Meeting", "Interview", "Demo", "Delivery", "Personal", "Other"];

export function CheckInPanel({ onCheckIn }: CheckInPanelProps) {
  const { selectedBranchId, selectedBranch } = useBranch();
  const members = useMembers(selectedBranchId);
  const { addPreRegistration } = useAppActions();
  const [tab, setTab] = useState<Tab>("walk-in");

  return (
    <div className="bg-white border border-cs-gray-200 rounded-xl overflow-hidden h-full flex flex-col shadow-[0_1px_2px_rgba(17,24,39,0.04)]">
      <div className="px-4 pt-3 pb-0 border-b border-cs-gray-100 bg-white">
        <div className="flex items-center gap-1 bg-cs-gray-50 rounded-lg p-1">
          <TabButton active={tab === "walk-in"} onClick={() => setTab("walk-in")} icon={LogIn} label="Walk-in" />
          <TabButton active={tab === "pre-register"} onClick={() => setTab("pre-register")} icon={QrCode} label="Pre-register" />
          <TabButton active={tab === "kiosk"} onClick={() => setTab("kiosk")} icon={ScanLine} label="Kiosk" />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {tab === "walk-in" && (
          <WalkInTab
            members={members}
            onCheckIn={onCheckIn}
          />
        )}
        {tab === "pre-register" && (
          <PreRegisterTab
            members={members}
            branchId={selectedBranchId === "all" ? "b2" : selectedBranchId}
            branchName={selectedBranch?.name || "Gachibowli"}
            onAdd={addPreRegistration}
          />
        )}
        {tab === "kiosk" && (
          <KioskTab branchId={selectedBranchId === "all" ? "b2" : selectedBranchId} />
        )}
      </div>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex-1 inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-md text-[12px] font-medium transition-colors",
        active ? "bg-white text-cs-black shadow-sm" : "text-cs-gray-500 hover:text-cs-black",
      )}
    >
      <Icon className="w-3.5 h-3.5" />
      {label}
    </button>
  );
}

/* ───────── Walk-in tab ───────── */

function WalkInTab({
  members,
  onCheckIn,
}: {
  members: ReturnType<typeof useMembers>;
  onCheckIn: CheckInPanelProps["onCheckIn"];
}) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [purpose, setPurpose] = useState(PURPOSES[0]);
  const [hostQuery, setHostQuery] = useState("");
  const [hostId, setHostId] = useState("");
  const [isPhotoTaken, setIsPhotoTaken] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [doneId, setDoneId] = useState<string | null>(null);

  const hostMatches = useMemo(() => {
    const q = hostQuery.trim().toLowerCase();
    if (!q) return [];
    return members
      .filter(
        (m) =>
          m.name.toLowerCase().includes(q) ||
          (m.company || "").toLowerCase().includes(q),
      )
      .slice(0, 5);
  }, [hostQuery, members]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;
    setIsCheckingIn(true);
    const member = members.find((m) => m.id === hostId);
    const hostName = member?.name || hostQuery || "Reception";
    setTimeout(() => {
      onCheckIn({ name, phone, purpose, hostName });
      const newId = `v-${Date.now()}`;
      setDoneId(newId);
      setIsCheckingIn(false);
    }, 500);
  };

  const reset = () => {
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
      <div className="flex flex-col items-center justify-center py-6 space-y-4 animate-in zoom-in-95 duration-300">
        <div className="w-14 h-14 bg-[#16A34A1A] text-status-green rounded-full flex items-center justify-center">
          <Check className="w-7 h-7" />
        </div>
        <div className="text-center">
          <h4 className="text-[15px] font-bold text-cs-black">Checked in</h4>
          <p className="text-[12px] text-cs-gray-500 mt-0.5">
            {name} has been added to the visitor log.
          </p>
        </div>
        <div className="p-2.5 bg-white border border-cs-gray-200 rounded-xl">
          <QRCodeSVG value={`onespace://visitor/${doneId}`} size={132} fgColor="#0D1B2A" level="M" />
        </div>
        <button
          type="button"
          onClick={() => toast.success("Badge shared via WhatsApp to host")}
          className="w-full inline-flex items-center justify-center gap-2 bg-[#25D366] text-white rounded-lg px-4 py-2 text-[13px] font-medium hover:bg-[#1ec55a] transition-colors"
        >
          <Send className="w-3.5 h-3.5" /> Share badge via WhatsApp
        </button>
        <button onClick={reset} className="text-[12px] text-cs-gray-500 hover:text-cs-black hover:underline">
          Check in another visitor
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3.5">
      <Field label="Full name *">
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Rahul Verma"
          className={inputClass}
        />
      </Field>
      <Field label="Mobile number *">
        <div className="flex">
          <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-cs-gray-200 bg-cs-gray-50 text-cs-gray-500 text-[13px]">
            +91
          </span>
          <input
            required
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="98765 43210"
            className={cn(inputClass, "rounded-l-none")}
          />
        </div>
      </Field>
      <Field label="Purpose">
        <select value={purpose} onChange={(e) => setPurpose(e.target.value)} className={cn(inputClass, "bg-white")}>
          {PURPOSES.map((p) => <option key={p}>{p}</option>)}
        </select>
      </Field>
      <Field label="Host (type to search)">
        <div className="relative">
          <input
            value={hostQuery}
            onChange={(e) => {
              setHostQuery(e.target.value);
              setHostId("");
            }}
            placeholder="Start typing a member's name…"
            className={inputClass}
          />
          {hostQuery && !hostId && hostMatches.length > 0 && (
            <div className="absolute z-10 left-0 right-0 mt-1 bg-white border border-cs-gray-200 rounded-lg shadow-md max-h-44 overflow-y-auto">
              {hostMatches.map((m) => (
                <button
                  type="button"
                  key={m.id}
                  onClick={() => {
                    setHostId(m.id);
                    setHostQuery(m.name);
                  }}
                  className="w-full text-left px-3 py-1.5 hover:bg-cs-gray-50 text-[12px]"
                >
                  <span className="font-medium text-cs-black">{m.name}</span>
                  {m.company && <span className="text-cs-gray-500"> · {m.company}</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      </Field>

      <button
        type="button"
        onClick={() => setIsPhotoTaken(true)}
        className={cn(
          "w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border-2 border-dashed text-[12px] font-medium transition-all",
          isPhotoTaken
            ? "border-[#16A34A55] bg-[#16A34A14] text-status-green"
            : "border-cs-gray-200 bg-cs-gray-50 text-cs-gray-500 hover:border-cs-gray-300",
        )}
      >
        {isPhotoTaken ? <><Check className="w-3.5 h-3.5" /> Photo captured</> : <><Camera className="w-3.5 h-3.5" /> Capture photo</>}
      </button>

      <button
        type="submit"
        disabled={isCheckingIn || !name || !phone}
        className="w-full flex items-center justify-center gap-2 py-2.5 bg-cs-red text-white rounded-lg text-[13px] font-medium hover:bg-cs-red-dark transition-colors disabled:opacity-50 shadow-sm"
      >
        {isCheckingIn ? "Processing…" : <><LogIn className="w-3.5 h-3.5" /> Check in</>}
      </button>
    </form>
  );
}

/* ───────── Pre-register tab ───────── */

function PreRegisterTab({
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

  const hostMatches = useMemo(() => {
    const q = hostQuery.trim().toLowerCase();
    if (!q) return [];
    return members.filter((m) => m.name.toLowerCase().includes(q)).slice(0, 5);
  }, [hostQuery, members]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;
    const host = members.find((m) => m.id === hostId);
    const hostName = host?.name || hostQuery || "Reception";
    const scheduledFor = time
      ? new Date(time).toISOString()
      : new Date(Date.now() + 60 * 60 * 1000).toISOString();

    // Generate the code locally so we can show the QR immediately; the store generates its own canonical code on dispatch.
    const localCode = `OS-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;

    onAdd({
      branchId,
      visitorName: name,
      phone: "+91 " + phone,
      purpose,
      hostName,
      scheduledFor,
    });

    setCreated({ name, code: localCode, phone: "+91 " + phone, host: hostName });
    toast.success(`Invite generated for ${name}`);
  };

  const reset = () => {
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
        ? `${window.location.origin}/checkin/${created.code}`
        : `/checkin/${created.code}`;
    const waMessage = `Hi ${created.name.split(" ")[0]} — your visit to CS Coworking ${branchName} is confirmed. Tap to check in on arrival: ${checkinUrl}\nInvite code: ${created.code}`;
    const waUrl = `https://wa.me/${created.phone.replace(/\D/g, "")}?text=${encodeURIComponent(waMessage)}`;

    return (
      <div className="space-y-4 animate-in zoom-in-95 duration-200">
        <div className="text-center">
          <div className="w-12 h-12 mx-auto bg-cs-red-bg text-cs-red rounded-full flex items-center justify-center mb-2">
            <QrCode className="w-6 h-6" />
          </div>
          <h4 className="text-[14px] font-semibold text-cs-black">Invite ready</h4>
          <p className="text-[11px] text-cs-gray-500 mt-0.5">
            Share this code or QR with {created.name} — they&apos;ll self check-in on arrival.
          </p>
        </div>

        <div className="p-2.5 bg-white border border-cs-gray-200 rounded-xl flex justify-center">
          <QRCodeSVG value={checkinUrl} size={148} fgColor="#0D1B2A" level="M" />
        </div>

        <div className="bg-cs-gray-50 border border-cs-gray-100 rounded-lg px-3 py-2 flex items-center justify-between gap-2">
          <span className="text-[11px] text-cs-gray-500 uppercase tracking-wider">Invite code</span>
          <div className="flex items-center gap-2">
            <code className="text-[13px] font-bold text-cs-black tabular-nums">{created.code}</code>
            <button
              type="button"
              onClick={() => {
                navigator.clipboard.writeText(created.code);
                toast.success("Code copied");
              }}
              className="p-1 rounded hover:bg-white text-cs-gray-500 hover:text-cs-black"
              aria-label="Copy"
            >
              <Copy className="w-3 h-3" />
            </button>
          </div>
        </div>

        <a
          href={waUrl}
          target="_blank"
          rel="noreferrer noopener"
          className="w-full inline-flex items-center justify-center gap-2 bg-[#25D366] text-white rounded-lg px-4 py-2.5 text-[13px] font-medium hover:bg-[#1ec55a] transition-colors"
        >
          <Send className="w-3.5 h-3.5" /> Share via WhatsApp
        </a>

        <button
          type="button"
          onClick={() => {
            navigator.clipboard.writeText(checkinUrl);
            toast.success("Link copied");
          }}
          className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg border border-cs-gray-200 bg-white text-cs-gray-700 hover:bg-cs-gray-50 text-[12px] font-medium transition-colors"
        >
          <Copy className="w-3 h-3" /> Copy check-in link
        </button>

        <button
          type="button"
          onClick={reset}
          className="w-full text-[12px] text-cs-gray-500 hover:text-cs-black hover:underline"
        >
          <RefreshCcw className="w-3 h-3 inline mr-1" />
          Pre-register another visitor
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3.5">
      <div className="flex items-start gap-2 p-2.5 rounded-lg bg-cs-red-bg/40 border border-cs-red/15">
        <Sparkles className="w-3.5 h-3.5 text-cs-red mt-0.5 shrink-0" />
        <p className="text-[11px] text-cs-gray-700 leading-relaxed">
          The visitor will get a personalised <strong>QR + WhatsApp link</strong>. On arrival they scan the desk QR or paste the code — zero typing for your front-desk staff.
        </p>
      </div>

      <Field label="Visitor name *">
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Ananya Verma"
          className={inputClass}
        />
      </Field>
      <Field label="WhatsApp number *">
        <div className="flex">
          <span className="inline-flex items-center px-3 rounded-l-lg border border-r-0 border-cs-gray-200 bg-cs-gray-50 text-cs-gray-500 text-[13px]">
            +91
          </span>
          <input
            required
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="98765 43210"
            className={cn(inputClass, "rounded-l-none")}
          />
        </div>
      </Field>
      <Field label="Purpose">
        <select value={purpose} onChange={(e) => setPurpose(e.target.value)} className={cn(inputClass, "bg-white")}>
          {PURPOSES.map((p) => <option key={p}>{p}</option>)}
        </select>
      </Field>
      <Field label="Host">
        <input
          value={hostQuery}
          onChange={(e) => {
            setHostQuery(e.target.value);
            setHostId("");
          }}
          placeholder="Type to search members…"
          className={inputClass}
        />
        {hostQuery && !hostId && hostMatches.length > 0 && (
          <div className="mt-1 bg-white border border-cs-gray-200 rounded-lg shadow-md max-h-36 overflow-y-auto">
            {hostMatches.map((m) => (
              <button
                type="button"
                key={m.id}
                onClick={() => {
                  setHostId(m.id);
                  setHostQuery(m.name);
                }}
                className="w-full text-left px-3 py-1.5 hover:bg-cs-gray-50 text-[12px]"
              >
                <span className="font-medium text-cs-black">{m.name}</span>
                {m.company && <span className="text-cs-gray-500"> · {m.company}</span>}
              </button>
            ))}
          </div>
        )}
      </Field>
      <Field label="Expected arrival (optional)">
        <input
          type="datetime-local"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className={inputClass}
        />
      </Field>

      <button
        type="submit"
        disabled={!name || !phone}
        className="w-full flex items-center justify-center gap-2 py-2.5 bg-cs-red text-white rounded-lg text-[13px] font-medium hover:bg-cs-red-dark transition-colors disabled:opacity-50 shadow-sm"
      >
        <QrCode className="w-3.5 h-3.5" />
        Generate invite QR
      </button>
    </form>
  );
}

/* ───────── Kiosk tab ───────── */

function KioskTab({ branchId }: { branchId: string }) {
  const [fullscreen, setFullscreen] = useState(false);
  const kioskUrl =
    typeof window !== "undefined"
      ? `${window.location.origin}/checkin?branch=${branchId}`
      : `/checkin?branch=${branchId}`;

  return (
    <div className="space-y-4">
      <div className="flex items-start gap-2 p-2.5 rounded-lg bg-[#2563EB14] border border-status-blue/20">
        <ScanLine className="w-3.5 h-3.5 text-status-blue mt-0.5 shrink-0" />
        <p className="text-[11px] text-cs-gray-700 leading-relaxed">
          Display this QR on a tablet at the front desk. Walk-in visitors scan it with their phone to self check-in — no manual form filling.
        </p>
      </div>

      <div className="p-3 bg-cs-black text-white rounded-xl flex flex-col items-center text-center">
        <div className="text-[10px] uppercase tracking-[0.2em] text-white/60 mb-2">Scan to check in</div>
        <div className="p-3 bg-white rounded-lg">
          <QRCodeSVG value={kioskUrl} size={180} fgColor="#0D1B2A" level="M" />
        </div>
        <div className="text-[10px] text-white/60 mt-2 truncate max-w-full">{kioskUrl}</div>
      </div>

      <button
        type="button"
        onClick={() => setFullscreen(true)}
        className="w-full inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-cs-gray-50 border border-cs-gray-200 text-cs-gray-700 hover:bg-white text-[12px] font-medium transition-colors"
      >
        <Maximize2 className="w-3.5 h-3.5" />
        Open in kiosk mode (fullscreen)
      </button>

      {fullscreen && <KioskFullscreen url={kioskUrl} onClose={() => setFullscreen(false)} />}
    </div>
  );
}

function KioskFullscreen({ url, onClose }: { url: string; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[60] bg-cs-black flex flex-col items-center justify-center text-white animate-in fade-in duration-200">
      <button
        type="button"
        onClick={onClose}
        className="absolute top-5 right-5 p-2 rounded-full hover:bg-white/10 text-white/70 hover:text-white"
        aria-label="Exit kiosk"
      >
        <X className="w-5 h-5" />
      </button>
      <div className="text-[12px] uppercase tracking-[0.3em] text-white/50 mb-3">CS Coworking</div>
      <h2 className="text-3xl font-bold font-heading mb-6">Welcome — scan to check in</h2>
      <div className="p-6 bg-white rounded-2xl shadow-2xl">
        <QRCodeSVG value={url} size={340} fgColor="#0D1B2A" level="M" />
      </div>
      <p className="text-[13px] text-white/60 mt-6 max-w-md text-center">
        Point your phone camera at the code. You&apos;ll be prompted to confirm your name, purpose, and host.
      </p>
    </div>
  );
}

/* ───────── helpers ───────── */

const inputClass =
  "w-full px-3 py-2 border border-cs-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-cs-red/20 focus:border-cs-red transition-all";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <label className="text-[10px] font-semibold uppercase tracking-wider text-cs-gray-500">{label}</label>
      {children}
    </div>
  );
}
