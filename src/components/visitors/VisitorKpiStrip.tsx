"use client";

import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import {
  UserCheck,
  AlertCircle,
  Clock,
  CalendarClock,
  TrendingUp,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useVisitors, usePreRegistrations, useNow } from "@/lib/store";

const HOUR = 60 * 60 * 1000;
const DAY = 24 * HOUR;

export function VisitorKpiStrip() {
  const visitors = useVisitors();
  const preRegs = usePreRegistrations();
  const now = useNow();

  const stats = useMemo(() => {
    const inside = visitors.filter((v) => !v.checkOutAt);
    const overstaying = inside.filter(
      (v) => (now - new Date(v.checkInAt).getTime()) / HOUR > 8,
    );
    const pendingPreRegs = preRegs.filter((p) => p.status === "pending");

    // Avg visit length for those who've checked out today
    const todayStart = new Date(now);
    todayStart.setHours(0, 0, 0, 0);
    const completed = visitors.filter(
      (v) => v.checkOutAt && new Date(v.checkInAt).getTime() >= todayStart.getTime(),
    );
    const avgMs =
      completed.length === 0
        ? 0
        : completed.reduce(
            (acc, v) => acc + (new Date(v.checkOutAt!).getTime() - new Date(v.checkInAt).getTime()),
            0,
          ) / completed.length;
    const avgLabel = avgMs === 0
      ? "—"
      : avgMs < HOUR
      ? `${Math.round(avgMs / 60_000)}m`
      : `${Math.floor(avgMs / HOUR)}h ${Math.round((avgMs % HOUR) / 60_000)}m`;

    // Peak hour (last 7 days)
    const weekAgo = now - 7 * DAY;
    const hourBuckets: Record<number, number> = {};
    for (const v of visitors) {
      const t = new Date(v.checkInAt).getTime();
      if (t < weekAgo) continue;
      const h = new Date(t).getHours();
      hourBuckets[h] = (hourBuckets[h] || 0) + 1;
    }
    const peakHour = Object.entries(hourBuckets).sort(
      (a, b) => Number(b[1]) - Number(a[1]),
    )[0];
    const peakLabel = peakHour
      ? `${formatHour(Number(peakHour[0]))}–${formatHour(Number(peakHour[0]) + 1)}`
      : "—";

    return {
      inside: inside.length,
      overstaying: overstaying.length,
      pending: pendingPreRegs.length,
      avgLabel,
      peakLabel,
    };
  }, [visitors, preRegs, now]);

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 mb-4">
      <Kpi
        icon={UserCheck}
        tone="green"
        label="Currently inside"
        value={String(stats.inside)}
      />
      <Kpi
        icon={AlertCircle}
        tone={stats.overstaying > 0 ? "red" : "gray"}
        label="Overstaying >8h"
        value={String(stats.overstaying)}
        alert={stats.overstaying > 0}
      />
      <Kpi
        icon={CalendarClock}
        tone="blue"
        label="Pre-registered"
        value={String(stats.pending)}
        sub="awaiting arrival"
      />
      <Kpi
        icon={Clock}
        tone="gray"
        label="Avg visit today"
        value={stats.avgLabel}
      />
      <Kpi
        icon={TrendingUp}
        tone="amber"
        label="Peak hour (7d)"
        value={stats.peakLabel}
      />
    </div>
  );
}

function formatHour(h: number) {
  const norm = ((h % 24) + 24) % 24;
  if (norm === 0) return "12am";
  if (norm < 12) return `${norm}am`;
  if (norm === 12) return "12pm";
  return `${norm - 12}pm`;
}

function Kpi({
  icon: Icon,
  tone,
  label,
  value,
  sub,
  alert,
}: {
  icon: LucideIcon;
  tone: "green" | "amber" | "red" | "blue" | "gray";
  label: string;
  value: string;
  sub?: string;
  alert?: boolean;
}) {
  const toneClass = {
    green: { bg: "bg-[#16A34A1A]", text: "text-status-green" },
    amber: { bg: "bg-[#D970061A]", text: "text-status-amber" },
    red: { bg: "bg-[#DC26261A]", text: "text-status-red" },
    blue: { bg: "bg-[#2563EB14]", text: "text-status-blue" },
    gray: { bg: "bg-cs-gray-100", text: "text-cs-gray-700" },
  }[tone];

  return (
    <Card
      className={cn(
        "p-3.5 flex items-center gap-3 bg-white shadow-[0_1px_2px_rgba(17,24,39,0.04)]",
        alert && "ring-1 ring-status-red/30",
      )}
    >
      <span className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", toneClass.bg)}>
        <Icon className={cn("w-4 h-4", toneClass.text)} />
      </span>
      <div className="min-w-0">
        <div className="text-[10px] font-semibold uppercase tracking-wider text-cs-gray-500 truncate">
          {label}
        </div>
        <div className="text-[18px] font-bold text-cs-black font-heading leading-none mt-0.5 tabular-nums">
          {value}
        </div>
        {sub && <div className="text-[10px] text-cs-gray-500 mt-0.5 truncate">{sub}</div>}
      </div>
    </Card>
  );
}
