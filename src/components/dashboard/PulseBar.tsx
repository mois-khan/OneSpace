"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import {
  LucideIcon,
  Activity,
  IndianRupee,
  Users,
  AlertTriangle,
  CalendarClock,
  DoorOpen,
} from "lucide-react";
import { cn } from "@/lib/utils";

type PulseTone = "green" | "amber" | "red" | "blue" | "gray";

export interface PulseChip {
  icon: LucideIcon;
  label: string;
  value: string;
  delta?: string;
  tone: PulseTone;
  pulse?: boolean;
  href?: string;
  onClick?: () => void;
}

interface PulseBarProps {
  chips: PulseChip[];
}

const toneStyles: Record<PulseTone, { dot: string; text: string }> = {
  green: { dot: "bg-status-green", text: "text-status-green" },
  amber: { dot: "bg-status-amber", text: "text-status-amber" },
  red: { dot: "bg-status-red", text: "text-status-red" },
  blue: { dot: "bg-status-blue", text: "text-status-blue" },
  gray: { dot: "bg-status-gray", text: "text-cs-gray-500" },
};

export function PulseBar({ chips }: PulseBarProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, ease: "easeOut" }}
      className="relative rounded-xl border border-cs-gray-300/60 bg-white/70 backdrop-blur-sm shadow-[0_1px_2px_rgba(17,24,39,0.04)] overflow-hidden"
    >
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-[0.035]"
        style={{
          background: "linear-gradient(90deg, var(--cs-hero-from) 0%, var(--cs-hero-to) 100%)",
        }}
      />
      <div className="relative flex items-stretch divide-x divide-cs-gray-100 overflow-x-auto">
        {chips.map((chip, idx) => (
          <PulseChipItem key={chip.label} chip={chip} index={idx} />
        ))}
      </div>
    </motion.div>
  );
}

function PulseChipItem({ chip, index }: { chip: PulseChip; index: number }) {
  const Icon = chip.icon;
  const tone = toneStyles[chip.tone];
  const shouldPulse = chip.pulse ?? (chip.tone === "amber" || chip.tone === "red");

  const inner = (
    <>
      <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-cs-gray-50 border border-cs-gray-100 shrink-0">
        <Icon className={cn("w-4 h-4", tone.text)} />
        <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
          {shouldPulse && (
            <span
              className={cn(
                "absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping",
                tone.dot,
              )}
            />
          )}
          <span className={cn("relative inline-flex h-2 w-2 rounded-full", tone.dot)} />
        </span>
      </div>
      <div className="flex flex-col min-w-0">
        <div className="flex items-baseline gap-2">
          <span className="text-[15px] font-semibold text-cs-black font-heading tabular-nums leading-tight">
            {chip.value}
          </span>
          {chip.delta && (
            <span className={cn("text-[11px] font-medium tabular-nums", tone.text)}>
              {chip.delta}
            </span>
          )}
        </div>
        <span className="text-[11px] uppercase tracking-wider text-cs-gray-500 font-medium leading-tight mt-0.5 truncate">
          {chip.label}
        </span>
      </div>
    </>
  );

  const wrapperClass =
    "flex items-center gap-3 px-5 py-3.5 min-w-[180px] flex-1 first:pl-5 transition-colors";
  const interactive = chip.href || chip.onClick;

  const content = (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.25, delay: index * 0.04, ease: "easeOut" }}
      className={cn(wrapperClass, interactive && "hover:bg-cs-gray-50/80 cursor-pointer")}
    >
      {inner}
    </motion.div>
  );

  if (chip.href) {
    return (
      <Link href={chip.href} className="flex flex-1" aria-label={chip.label}>
        {content}
      </Link>
    );
  }
  if (chip.onClick) {
    return (
      <button type="button" onClick={chip.onClick} className="flex flex-1 text-left" aria-label={chip.label}>
        {content}
      </button>
    );
  }
  return content;
}

export { Activity, IndianRupee, Users, AlertTriangle, CalendarClock, DoorOpen };
