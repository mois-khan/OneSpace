"use client";

import { useMemo } from "react";
import { Card } from "@/components/ui/card";
import { TrendingDown, AlertTriangle, Clock, ShieldCheck } from "lucide-react";
import type { Member } from "@/types";
import { formatCurrency, cn } from "@/lib/utils";
import { useNow } from "@/lib/store";

interface RenewalHeroProps {
  members: Member[];
}

const DAY = 24 * 60 * 60 * 1000;

const BANDS = [
  { id: "critical", label: "Critical", min: 70, max: 100, color: "var(--status-red)", chip: "#DC26261A" },
  { id: "high", label: "High", min: 40, max: 69, color: "var(--status-amber)", chip: "#D970061A" },
  { id: "watch", label: "Watch", min: 20, max: 39, color: "#EAB308", chip: "#EAB30815" },
  { id: "healthy", label: "Healthy", min: 0, max: 19, color: "var(--status-green)", chip: "#16A34A1A" },
] as const;

type BandId = (typeof BANDS)[number]["id"];

export function RenewalHero({ members }: RenewalHeroProps) {
  const now = useNow();

  const bandStats = useMemo(() => {
    const init: Record<BandId, { count: number; mrr: number }> = {
      critical: { count: 0, mrr: 0 },
      high: { count: 0, mrr: 0 },
      watch: { count: 0, mrr: 0 },
      healthy: { count: 0, mrr: 0 },
    };
    for (const m of members) {
      const r = m.riskScore || 0;
      const band: BandId = r >= 70 ? "critical" : r >= 40 ? "high" : r >= 20 ? "watch" : "healthy";
      init[band].count += 1;
      init[band].mrr += m.monthlyFee;
    }
    return init;
  }, [members]);

  const totalMembers = members.length;
  const totalMrr = members.reduce((acc, m) => acc + m.monthlyFee, 0);
  const atRiskMrr = bandStats.critical.mrr + bandStats.high.mrr;
  const atRiskCount = bandStats.critical.count + bandStats.high.count;

  // Renewals expiring within next 30 days — used in the right-side summary
  const expiring30 = useMemo(
    () =>
      members.filter((m) => {
        const d = (new Date(m.contractEnd).getTime() - now) / DAY;
        return d > 0 && d <= 30;
      }),
    [members, now],
  );
  const expiring30Mrr = expiring30.reduce((acc, m) => acc + m.monthlyFee, 0);

  return (
    <Card className="bg-white p-6 shadow-[0_1px_2px_rgba(17,24,39,0.04)] mb-6 overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-8">
        {/* Headline + stacked bar */}
        <div>
          <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-cs-gray-500 mb-1.5">
            Revenue at risk
          </div>
          <div className="flex items-baseline gap-3 mb-4">
            <span className="text-[36px] font-bold font-heading text-cs-black tabular-nums leading-none">
              {formatCurrency(atRiskMrr)}
            </span>
            <span className="text-[13px] text-cs-gray-500">
              across <span className="font-semibold text-cs-black tabular-nums">{atRiskCount}</span> high & critical members
            </span>
          </div>

          {/* Stacked bar */}
          <div className="space-y-2">
            <div className="flex w-full h-9 rounded-lg overflow-hidden ring-1 ring-cs-gray-200 bg-cs-gray-50">
              {BANDS.map((band) => {
                const stats = bandStats[band.id];
                const widthPct = totalMembers > 0 ? (stats.count / totalMembers) * 100 : 0;
                if (widthPct === 0) return null;
                return (
                  <div
                    key={band.id}
                    className="relative group flex items-center justify-center text-white text-[12px] font-semibold tabular-nums transition-all hover:brightness-110 cursor-default"
                    style={{ width: `${widthPct}%`, backgroundColor: band.color }}
                    title={`${band.label}: ${stats.count} members · ${formatCurrency(stats.mrr)}`}
                  >
                    {widthPct >= 6 ? stats.count : ""}
                  </div>
                );
              })}
            </div>
            <div className="flex flex-wrap gap-2">
              {BANDS.map((band) => {
                const stats = bandStats[band.id];
                return (
                  <BandLegend
                    key={band.id}
                    label={band.label}
                    color={band.color}
                    chip={band.chip}
                    count={stats.count}
                    mrr={stats.mrr}
                  />
                );
              })}
            </div>
          </div>
        </div>

        {/* Right column — quick stats */}
        <div className="lg:border-l lg:border-cs-gray-100 lg:pl-8 flex flex-col gap-3">
          <RightStat
            icon={Clock}
            iconBg="bg-[#D970061A]"
            iconColor="text-status-amber"
            label="Expiring next 30 days"
            value={`${expiring30.length} members`}
            sub={formatCurrency(expiring30Mrr)}
          />
          <RightStat
            icon={AlertTriangle}
            iconBg="bg-[#DC26261A]"
            iconColor="text-status-red"
            label="Critical risk"
            value={`${bandStats.critical.count} members`}
            sub={formatCurrency(bandStats.critical.mrr)}
          />
          <RightStat
            icon={ShieldCheck}
            iconBg="bg-[#16A34A1A]"
            iconColor="text-status-green"
            label="Total tracked MRR"
            value={formatCurrency(totalMrr)}
            sub={`${totalMembers} members`}
          />
        </div>
      </div>
    </Card>
  );
}

function BandLegend({
  label,
  color,
  chip,
  count,
  mrr,
}: {
  label: string;
  color: string;
  chip: string;
  count: number;
  mrr: number;
}) {
  return (
    <span
      className={cn("inline-flex items-center gap-2 px-2 py-1 rounded-md text-[11px]")}
      style={{ background: chip }}
    >
      <span className="w-2 h-2 rounded-sm" style={{ background: color }} />
      <span className="font-medium text-cs-gray-700">{label}</span>
      <span className="font-semibold text-cs-black tabular-nums">{count}</span>
      <span className="text-cs-gray-500">· {formatCurrency(mrr)}</span>
    </span>
  );
}

function RightStat({
  icon: Icon,
  iconBg,
  iconColor,
  label,
  value,
  sub,
}: {
  icon: typeof TrendingDown;
  iconBg: string;
  iconColor: string;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="flex items-center gap-3">
      <span className={cn("w-9 h-9 rounded-lg flex items-center justify-center shrink-0", iconBg)}>
        <Icon className={cn("w-4 h-4", iconColor)} />
      </span>
      <div className="min-w-0">
        <div className="text-[11px] font-medium text-cs-gray-500 uppercase tracking-wider">
          {label}
        </div>
        <div className="text-[15px] font-semibold text-cs-black tabular-nums">{value}</div>
        <div className="text-[12px] text-cs-gray-500 tabular-nums">{sub}</div>
      </div>
    </div>
  );
}
