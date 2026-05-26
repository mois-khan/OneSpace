"use client";

import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { useNow } from "@/lib/store";
import type { Member } from "@/types";
import { cn, formatCurrency } from "@/lib/utils";
import { SectionHeader } from "../dashboard/SectionHeader";

const DAY = 24 * 60 * 60 * 1000;

interface RenewalTimelineProps {
  members: Member[];
  /** Number of days to render. Defaults to 30. */
  windowDays?: number;
}

export function RenewalTimeline({ members, windowDays = 30 }: RenewalTimelineProps) {
  const now = useNow();

  const buckets = useMemo(() => {
    const arr: Array<{
      dayOffset: number;
      label: string;
      members: Member[];
      mrr: number;
    }> = [];
    const startOfDay = (t: number) => {
      const d = new Date(t);
      d.setHours(0, 0, 0, 0);
      return d.getTime();
    };
    const todayStart = startOfDay(now);

    for (let i = 0; i < windowDays; i++) {
      const dayStart = todayStart + i * DAY;
      const dayEnd = dayStart + DAY;
      const dayMembers = members.filter((m) => {
        const t = new Date(m.contractEnd).getTime();
        return t >= dayStart && t < dayEnd;
      });
      const d = new Date(dayStart);
      arr.push({
        dayOffset: i,
        label: d.toLocaleDateString("en-US", { day: "numeric", month: "short" }),
        members: dayMembers,
        mrr: dayMembers.reduce((acc, m) => acc + m.monthlyFee, 0),
      });
    }
    return arr;
  }, [members, now, windowDays]);

  const maxCount = Math.max(1, ...buckets.map((b) => b.members.length));
  const totalCount = buckets.reduce((acc, b) => acc + b.members.length, 0);
  const totalMrr = buckets.reduce((acc, b) => acc + b.mrr, 0);

  return (
    <Card className="bg-white p-5 shadow-[0_1px_2px_rgba(17,24,39,0.04)] mb-6">
      <SectionHeader
        eyebrow="Pipeline"
        title={`Renewals timeline — next ${windowDays} days`}
        description="Each bar shows contracts expiring on that day"
        actions={
          totalCount > 0 ? (
            <div className="text-right">
              <div className="text-[11px] text-cs-gray-500 uppercase tracking-wider">Total at stake</div>
              <div className="text-[15px] font-semibold text-cs-black tabular-nums">
                {totalCount} · {formatCurrency(totalMrr)}
              </div>
            </div>
          ) : null
        }
      />

      {totalCount === 0 ? (
        <p className="text-center text-[13px] text-cs-gray-500 py-8">
          No contracts expiring in the next {windowDays} days. You&apos;re ahead.
        </p>
      ) : (
        <div className="relative">
          <div className="flex items-end gap-[3px] h-24">
            {buckets.map((b, i) => {
              const isToday = i === 0;
              const isWeekStart = i === 7 || i === 14 || i === 21 || i === 28;
              const heightPct = b.members.length > 0 ? (b.members.length / maxCount) * 100 : 0;
              const hasCritical = b.members.some((m) => (m.riskScore || 0) >= 70);
              const color = hasCritical
                ? "bg-status-red"
                : b.members.some((m) => (m.riskScore || 0) >= 40)
                ? "bg-status-amber"
                : b.members.length > 0
                ? "bg-status-blue"
                : "bg-cs-gray-100";

              return (
                <div key={i} className="flex-1 flex flex-col justify-end relative group">
                  {b.members.length > 0 && (
                    <div className="absolute -top-7 left-1/2 -translate-x-1/2 z-10 px-1.5 py-0.5 rounded bg-cs-black text-white text-[10px] font-semibold tabular-nums opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                      {b.members.length} · {formatCurrency(b.mrr)}
                    </div>
                  )}
                  <div
                    className={cn(
                      "rounded-sm transition-all",
                      color,
                      b.members.length === 0 ? "h-0.5" : "min-h-[6px]",
                      isToday && b.members.length > 0 && "ring-2 ring-cs-red ring-offset-1",
                    )}
                    style={{ height: b.members.length > 0 ? `${heightPct}%` : 2 }}
                  />
                  {(isToday || isWeekStart) && (
                    <div
                      className={cn(
                        "absolute -bottom-5 left-1/2 -translate-x-1/2 text-[9px] font-medium tabular-nums whitespace-nowrap",
                        isToday ? "text-cs-red font-semibold" : "text-cs-gray-500",
                      )}
                    >
                      {isToday ? "Today" : b.label}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="h-5" />
        </div>
      )}
    </Card>
  );
}
