"use client";

import { AnimatePresence, motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import {
  X,
  Phone,
  User as UserIcon,
  Briefcase,
  Clock,
  LogOut,
  Send,
  History,
  QrCode,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useVisitHistory, useNow, useAppActions } from "@/lib/store";
import type { Visitor } from "@/types";
import { toast } from "sonner";

const HOUR = 60 * 60 * 1000;

interface VisitorDetailPanelProps {
  visitor: Visitor | null;
  onClose: () => void;
}

export function VisitorDetailPanel({ visitor, onClose }: VisitorDetailPanelProps) {
  return (
    <AnimatePresence>
      {visitor && <Inner key={visitor.id} visitor={visitor} onClose={onClose} />}
    </AnimatePresence>
  );
}

function Inner({ visitor, onClose }: { visitor: Visitor; onClose: () => void }) {
  const now = useNow();
  const history = useVisitHistory(visitor.phone);
  const { checkOutVisitor } = useAppActions();

  const isInside = !visitor.checkOutAt;
  const insideMs = visitor.checkOutAt
    ? new Date(visitor.checkOutAt).getTime() - new Date(visitor.checkInAt).getTime()
    : now - new Date(visitor.checkInAt).getTime();
  const isOverstaying = isInside && insideMs / HOUR > 8;
  const isReturning = history.length > 1;

  const badgePayload = JSON.stringify({
    type: "onespace-visitor-badge",
    id: visitor.id,
    qr: visitor.qrCode,
  });

  return (
    <>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.15 }}
        className="fixed inset-0 z-40 bg-black/10"
        onClick={onClose}
      />
      <motion.aside
        initial={{ x: 60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: 60, opacity: 0 }}
        transition={{ duration: 0.2, ease: "easeOut" }}
        className="fixed top-3 right-3 bottom-3 z-50 w-[420px] max-w-[calc(100vw-1.5rem)] bg-white rounded-2xl shadow-[0_24px_64px_-12px_rgba(17,24,39,0.25)] ring-1 ring-cs-gray-300/60 flex flex-col overflow-hidden"
      >
        <header className="px-5 py-4 border-b border-cs-gray-100 flex items-start justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <span className="w-10 h-10 rounded-full bg-cs-gray-100 border border-cs-gray-200 flex items-center justify-center text-[13px] font-bold text-cs-gray-700 shrink-0">
              {visitor.name.split(" ").map((p) => p[0]).join("").substring(0, 2).toUpperCase()}
            </span>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-[15px] font-semibold text-cs-black font-heading truncate">
                  {visitor.name}
                </h2>
                {isReturning && (
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-[#2563EB14] text-status-blue">
                    Returning · {history.length}
                  </span>
                )}
              </div>
              <div className="text-[11px] text-cs-gray-500 flex items-center gap-1 truncate">
                <Phone className="w-3 h-3" />
                {visitor.phone}
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-md hover:bg-cs-gray-50 text-cs-gray-500 shrink-0"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto">
          {/* Status block */}
          <div
            className={cn(
              "px-5 py-4 border-b border-cs-gray-100",
              isOverstaying
                ? "bg-[#DC26260A]"
                : isInside
                ? "bg-[#16A34A0A]"
                : "bg-cs-gray-50/40",
            )}
          >
            <div className="flex items-center gap-2 mb-2">
              <span
                className={cn(
                  "w-2 h-2 rounded-full",
                  isOverstaying
                    ? "bg-status-red animate-pulse"
                    : isInside
                    ? "bg-status-green animate-pulse"
                    : "bg-cs-gray-500",
                )}
              />
              <span
                className={cn(
                  "text-[12px] font-semibold uppercase tracking-wider",
                  isOverstaying
                    ? "text-status-red"
                    : isInside
                    ? "text-status-green"
                    : "text-cs-gray-700",
                )}
              >
                {isOverstaying ? "Overstaying" : isInside ? "Currently inside" : "Checked out"}
              </span>
              <span className="ml-auto text-[12px] text-cs-gray-700 font-medium tabular-nums">
                {formatDuration(insideMs)}
              </span>
            </div>
            <div className="grid grid-cols-2 gap-3 text-[12px]">
              <Field icon={Briefcase} label="Purpose" value={visitor.purpose} />
              <Field icon={UserIcon} label="Host" value={visitor.hostName || "—"} />
              <Field
                icon={Clock}
                label="Checked in"
                value={new Date(visitor.checkInAt).toLocaleTimeString([], {
                  hour: "numeric",
                  minute: "2-digit",
                })}
              />
              <Field
                icon={Calendar}
                label="Date"
                value={new Date(visitor.checkInAt).toLocaleDateString("en-US", {
                  day: "numeric",
                  month: "short",
                })}
              />
            </div>
            <div className="flex gap-2 mt-3">
              {isInside && (
                <button
                  type="button"
                  onClick={() => {
                    checkOutVisitor(visitor.id);
                    toast.success(`${visitor.name} checked out`);
                    onClose();
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium bg-cs-red text-white hover:bg-cs-red-dark transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  Check out
                </button>
              )}
              <button
                type="button"
                onClick={() => toast.success(`Notification sent to ${visitor.hostName || "host"}`)}
                className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md text-[12px] font-medium bg-white border border-cs-gray-200 text-cs-gray-700 hover:bg-cs-gray-50 transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                Notify host
              </button>
            </div>
          </div>

          {/* Visitor badge QR */}
          <div className="px-5 py-4 border-b border-cs-gray-100">
            <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-cs-gray-500 mb-2 flex items-center gap-1.5">
              <QrCode className="w-3 h-3" />
              Visitor badge
            </div>
            <div className="flex items-center gap-4">
              <div className="p-2.5 bg-white border border-cs-gray-200 rounded-xl shrink-0">
                <QRCodeSVG
                  value={badgePayload}
                  size={108}
                  bgColor="#ffffff"
                  fgColor="#0D1B2A"
                  level="M"
                />
              </div>
              <div className="text-[12px] text-cs-gray-700 leading-relaxed">
                Scannable badge for door access, room entry, and one-tap checkout. Code{" "}
                <code className="text-[11px] bg-cs-gray-100 px-1 py-0.5 rounded tabular-nums">
                  {visitor.qrCode.slice(-8).toUpperCase()}
                </code>
              </div>
            </div>
          </div>

          {/* History */}
          <div className="px-5 py-4">
            <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-cs-gray-500 mb-3 flex items-center gap-1.5">
              <History className="w-3 h-3" />
              Visit history ({history.length})
            </div>
            {history.length === 0 ? (
              <p className="text-[12px] text-cs-gray-500">No prior visits recorded.</p>
            ) : (
              <ul className="space-y-2">
                {history.map((v) => (
                  <li
                    key={v.id}
                    className={cn(
                      "flex items-center gap-3 px-3 py-2 rounded-lg border",
                      v.id === visitor.id
                        ? "bg-cs-red-bg/40 border-cs-red/30"
                        : "bg-white border-cs-gray-100",
                    )}
                  >
                    <span className="w-1 h-7 rounded-full bg-cs-gray-300 shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="text-[12px] font-medium text-cs-black truncate">
                        {v.purpose}{" "}
                        {v.id === visitor.id && (
                          <span className="text-[10px] text-cs-red font-semibold ml-1">· this visit</span>
                        )}
                      </div>
                      <div className="text-[11px] text-cs-gray-500 truncate">
                        {new Date(v.checkInAt).toLocaleString("en-US", {
                          day: "numeric",
                          month: "short",
                          hour: "numeric",
                          minute: "2-digit",
                        })}{" "}
                        {v.hostName && `· host ${v.hostName}`}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </motion.aside>
    </>
  );
}

function Field({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="text-[10px] font-medium text-cs-gray-500 uppercase tracking-wider flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {label}
      </div>
      <div className="text-[13px] text-cs-black font-medium mt-0.5 truncate">{value}</div>
    </div>
  );
}

function formatDuration(ms: number) {
  if (ms < 60_000) return "<1m";
  const minutes = Math.round(ms / 60_000);
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}
