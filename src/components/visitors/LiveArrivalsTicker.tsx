"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { LogIn, QrCode, Users } from "lucide-react";
import { useVisitors, useNow } from "@/lib/store";

/** A rotating "live arrivals" strip that auto-cycles through the 5 most recent check-ins. */
export function LiveArrivalsTicker() {
  const visitors = useVisitors();
  const now = useNow();
  const [index, setIndex] = useState(0);

  const recent = useMemo(
    () =>
      [...visitors]
        .sort((a, b) => b.checkInAt.localeCompare(a.checkInAt))
        .slice(0, 5),
    [visitors],
  );

  useEffect(() => {
    if (recent.length <= 1) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % recent.length), 4500);
    return () => clearInterval(t);
  }, [recent.length]);

  if (recent.length === 0) {
    return (
      <div className="rounded-xl border border-cs-gray-200 bg-white px-4 py-3 mb-4 flex items-center gap-3">
        <Users className="w-4 h-4 text-cs-gray-500" />
        <span className="text-[13px] text-cs-gray-500">No visitors yet today.</span>
      </div>
    );
  }

  const v = recent[index % recent.length];
  const minutesAgo = Math.max(
    0,
    Math.round((now - new Date(v.checkInAt).getTime()) / 60000),
  );
  const timeLabel =
    minutesAgo < 1 ? "Just now" : minutesAgo < 60 ? `${minutesAgo}m ago` : `${Math.round(minutesAgo / 60)}h ago`;

  return (
    <div className="relative rounded-xl border border-cs-gray-200 bg-white px-4 py-3 mb-4 overflow-hidden">
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-[0.04]"
        style={{
          background: "linear-gradient(90deg, var(--cs-hero-from) 0%, var(--cs-hero-to) 100%)",
        }}
      />
      <div className="relative flex items-center gap-4">
        <span className="inline-flex items-center gap-2 px-2 py-1 rounded-md bg-[#16A34A1A] text-status-green text-[10px] font-bold uppercase tracking-wider shrink-0">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full rounded-full bg-status-green opacity-75 animate-ping" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-status-green" />
          </span>
          Live
        </span>

        <div className="min-w-0 flex-1 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={v.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.25 }}
              className="flex items-center gap-2 text-[13px] min-w-0"
            >
              {v.preRegistrationId ? (
                <QrCode className="w-3.5 h-3.5 text-cs-red shrink-0" />
              ) : (
                <LogIn className="w-3.5 h-3.5 text-status-blue shrink-0" />
              )}
              <span className="font-semibold text-cs-black truncate">{v.name}</span>
              <span className="text-cs-gray-500 truncate">
                {v.preRegistrationId ? "self-checked in via QR" : "checked in"} for{" "}
                <span className="text-cs-gray-700 font-medium">{v.purpose}</span>
                {v.hostName && <> · host {v.hostName}</>}
              </span>
            </motion.div>
          </AnimatePresence>
        </div>

        <span className="text-[11px] text-cs-gray-500 tabular-nums shrink-0">{timeLabel}</span>

        <div className="flex items-center gap-1 shrink-0">
          {recent.map((_, i) => (
            <span
              key={i}
              className={
                i === index % recent.length
                  ? "w-1.5 h-1.5 rounded-full bg-cs-red"
                  : "w-1.5 h-1.5 rounded-full bg-cs-gray-300"
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}
