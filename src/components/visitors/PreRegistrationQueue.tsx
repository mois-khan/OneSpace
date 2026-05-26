"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { CalendarClock, Send, X, QrCode, ChevronDown, ChevronUp, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { usePreRegistrations, useAppActions, useNow } from "@/lib/store";
import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { toast } from "sonner";

export function PreRegistrationQueue() {
  const preRegs = usePreRegistrations();
  const now = useNow();
  const { cancelPreRegistration, convertPreRegistration } = useAppActions();
  const [expanded, setExpanded] = useState(true);

  const pending = preRegs
    .filter((p) => p.status === "pending")
    .sort((a, b) => a.scheduledFor.localeCompare(b.scheduledFor));
  const recent = preRegs
    .filter((p) => p.status !== "pending")
    .slice(0, 5);

  return (
    <Card className="bg-white shadow-[0_1px_2px_rgba(17,24,39,0.04)] mb-4">
      <button
        type="button"
        onClick={() => setExpanded((e) => !e)}
        className="w-full px-5 py-3 flex items-center justify-between text-left hover:bg-cs-gray-50/40 transition-colors rounded-xl"
      >
        <div className="flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg bg-cs-red-bg flex items-center justify-center">
            <QrCode className="w-4 h-4 text-cs-red" />
          </span>
          <div>
            <div className="text-[13px] font-semibold text-cs-black font-heading">
              Pre-registrations
            </div>
            <div className="text-[11px] text-cs-gray-500">
              {pending.length} pending · awaiting QR check-in
            </div>
          </div>
        </div>
        <span className="text-cs-gray-500">
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </span>
      </button>

      {expanded && (
        <div className="px-5 pb-4 pt-1">
          {pending.length === 0 ? (
            <p className="text-[12px] text-cs-gray-500 text-center py-4">
              No pending invitations. Pre-register a visitor to send them a QR.
            </p>
          ) : (
            <SectionHeader
              eyebrow="Awaiting arrival"
              title=""
              description={undefined}
              className="!mb-2"
            />
          )}

          <div className="space-y-2">
            {pending.map((p) => {
              const eta = new Date(p.scheduledFor).getTime();
              const minsToEta = Math.round((eta - now) / 60_000);
              const etaLabel =
                minsToEta < 0
                  ? `Late by ${Math.abs(minsToEta)}m`
                  : minsToEta < 60
                  ? `In ${minsToEta}m`
                  : `In ${Math.floor(minsToEta / 60)}h ${minsToEta % 60}m`;
              const isLate = minsToEta < 0;
              const isSoon = !isLate && minsToEta < 30;
              return (
                <div
                  key={p.id}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-lg border transition-colors",
                    isLate
                      ? "border-status-red/40 bg-[#DC26260A]"
                      : isSoon
                      ? "border-status-amber/40 bg-[#D970060A]"
                      : "border-cs-gray-100 bg-white hover:border-cs-gray-200",
                  )}
                >
                  <span className="w-9 h-9 rounded-full bg-cs-gray-100 border border-cs-gray-200 flex items-center justify-center text-[11px] font-bold text-cs-gray-700 shrink-0">
                    {p.visitorName.split(" ").map((w) => w[0]).join("").substring(0, 2).toUpperCase()}
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[13px] font-semibold text-cs-black truncate">
                        {p.visitorName}
                      </span>
                      <code className="text-[10px] font-bold text-cs-red bg-cs-red-bg px-1.5 py-0.5 rounded">
                        {p.inviteCode}
                      </code>
                    </div>
                    <div className="text-[11px] text-cs-gray-500 truncate">
                      {p.purpose} · host {p.hostName} · {p.phone}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div
                      className={cn(
                        "text-[11px] font-semibold tabular-nums",
                        isLate
                          ? "text-status-red"
                          : isSoon
                          ? "text-status-amber"
                          : "text-cs-gray-700",
                      )}
                    >
                      {etaLabel}
                    </div>
                    <div className="text-[10px] text-cs-gray-500 flex items-center gap-1 justify-end">
                      <CalendarClock className="w-2.5 h-2.5" />
                      {new Date(p.scheduledFor).toLocaleTimeString([], {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        convertPreRegistration(p.id);
                        toast.success(`${p.visitorName} marked arrived`);
                      }}
                      className="p-1.5 rounded-md text-status-green hover:bg-[#16A34A14]"
                      title="Mark arrived (manual check-in)"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => toast.success(`Reminder re-sent to ${p.visitorName}`)}
                      className="p-1.5 rounded-md text-cs-gray-500 hover:bg-cs-gray-100 hover:text-cs-black"
                      title="Resend invite"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        cancelPreRegistration(p.id);
                        toast.info(`Invite for ${p.visitorName} cancelled`);
                      }}
                      className="p-1.5 rounded-md text-cs-gray-500 hover:bg-[#DC26261A] hover:text-status-red"
                      title="Cancel invite"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {recent.length > 0 && (
            <div className="mt-4 pt-3 border-t border-cs-gray-100">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-cs-gray-500 mb-2">
                Recently resolved
              </div>
              <div className="flex flex-wrap gap-1.5">
                {recent.map((p) => (
                  <span
                    key={p.id}
                    className={cn(
                      "inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[10px] font-medium",
                      p.status === "arrived"
                        ? "bg-[#16A34A1A] text-status-green"
                        : p.status === "cancelled"
                        ? "bg-cs-gray-100 text-cs-gray-700"
                        : "bg-[#D970061A] text-status-amber",
                    )}
                  >
                    <span className="w-1 h-1 rounded-full bg-current" />
                    {p.visitorName} · {p.status}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

/** A tiny version of SectionHeader to satisfy a layout need without the full component import. */
