"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import {
  IndianRupee,
  AlertTriangle,
  Users,
  CalendarClock,
  DoorOpen,
  TrendingUp,
  FileWarning,
  TrendingDown,
} from "lucide-react";

import { KpiHeroCard } from "@/components/dashboard/KpiHeroCard";
import { PulseBar } from "@/components/dashboard/PulseBar";
import { SectionHeader } from "@/components/dashboard/SectionHeader";
import { BranchTable } from "@/components/dashboard/BranchTable";
import { OccupancyChart } from "@/components/dashboard/OccupancyChart";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { TodayFocusCard } from "@/components/dashboard/TodayFocusCard";
import { AiInsightBanner } from "@/components/dashboard/AiInsightBanner";

import {
  useBranch,
  useKpis,
  useOccupancyTrend,
  useBranchRevenue,
} from "@/lib/store";
import { useCan } from "@/lib/rbac";

const BRANCH_KEYS = [
  "CS Coworking - Hitech City",
  "CS Coworking - Gachibowli",
  "CS Coworking - Raidurg",
  "CS Coworking - Kondapur",
  "CS Coworking - Shaikpet I",
  "CS Coworking - Shaikpet II",
] as const;

export default function DashboardPage() {
  const { selectedBranchId, selectedBranch, branches } = useBranch();
  const kpis = useKpis();
  const trend = useOccupancyTrend();
  const revenue = useBranchRevenue();
  const canSeeFinance = useCan("view_finance");
  const canSeeRenewals = useCan("view_renewals");

  const occupancySpark = useMemo(() => {
    const keys =
      selectedBranchId === "all"
        ? BRANCH_KEYS
        : ([`CS Coworking - ${selectedBranch?.name || ""}`].filter(Boolean) as readonly string[]);
    return trend.map((d) => {
      const vals = keys
        .map((k) => (d as Record<string, number | string>)[k] as number)
        .filter((v) => typeof v === "number");
      return vals.length ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
    });
  }, [trend, selectedBranchId, selectedBranch]);

  const revenueSpark = useMemo(() => {
    const total = revenue.reduce((acc, r) => acc + r.revenue, 0);
    const base = total / 30;
    return Array.from({ length: 30 }).map((_, i) => {
      const phase = Math.sin(i / 3) * 0.08 + Math.cos(i / 5) * 0.05;
      return Math.round(base * (1 + phase));
    });
  }, [revenue]);

  const atRiskSpark = useMemo(() => {
    const base = Math.max(kpis.atRiskMrr / 30, 1000);
    return Array.from({ length: 30 }).map((_, i) => Math.round(base * (1 + i * 0.02)));
  }, [kpis.atRiskMrr]);

  const membersSpark = useMemo(() => {
    const total = kpis.activeMembers || 1;
    return Array.from({ length: 30 }).map(
      (_, i) => total - Math.max(0, 30 - i) * 0.4 + Math.sin(i / 4) * 1.2,
    );
  }, [kpis.activeMembers]);

  const branchScope =
    selectedBranchId === "all"
      ? `Across ${branches.length} branches`
      : selectedBranch?.name || "Selected branch";

  const pulseTone = (n: number, warnAt: number, critAt: number) =>
    n >= critAt ? "red" : n >= warnAt ? "amber" : "green";

  return (
    <div className="flex flex-col gap-6 max-w-[1440px] mx-auto">
      {/* § 1. Pulse Bar — 4 action signals (gated by role permissions) */}
      <PulseBar
        chips={[
          canSeeRenewals && {
            icon: CalendarClock,
            label: "Renewals ≤ 7 days",
            value: String(kpis.renewalsDueIn7Days),
            tone: pulseTone(kpis.renewalsDueIn7Days, 1, 5),
            href: "/renewals",
          },
          canSeeFinance && {
            icon: FileWarning,
            label: "Overdue invoices",
            value: String(kpis.overdueInvoices),
            tone: pulseTone(kpis.overdueInvoices, 1, 3),
            href: canSeeRenewals ? "/renewals" : "/members",
          },
          canSeeRenewals && {
            icon: TrendingDown,
            label: "High-risk members",
            value: String(kpis.highRiskCount),
            tone: pulseTone(kpis.highRiskCount, 1, 5),
            href: "/renewals",
          },
          {
            icon: DoorOpen,
            label: "Visitors today",
            value: String(kpis.visitorsToday),
            tone: "gray",
            href: "/visitors",
          },
          // Community gets an extra occupancy-focused chip to fill space
          !canSeeFinance && {
            icon: Users,
            label: "Active members",
            value: String(kpis.activeMembers),
            tone: "blue" as const,
            href: "/members",
          },
        ].filter(Boolean) as Parameters<typeof PulseBar>[0]["chips"]}
      />

      {/* § 1b. AI insight banner — opens the assistant with a relevant prompt */}
      {canSeeRenewals && <AiInsightBanner />}

      {/* § 2. Executive KPI Grid — the headline numbers (financial cards are RBAC-gated) */}
      <section>
        <SectionHeader
          eyebrow="Executive overview"
          title="Today's headline numbers"
          description={branchScope}
        />
        <motion.div
          initial="hidden"
          animate="show"
          variants={{ hidden: {}, show: { transition: { staggerChildren: 0.05 } } }}
          className={
            canSeeFinance
              ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
              : "grid grid-cols-1 md:grid-cols-2 gap-4"
          }
        >
          {[
            <KpiHeroCard
              key="occ"
              label="Total Occupancy"
              value={kpis.occupancy}
              isPercentage
              sub={
                selectedBranchId === "all"
                  ? "Average across branches today"
                  : "For selected branch"
              }
              trend="+3% vs last week"
              trendDirection="up"
              icon={TrendingUp}
              variant="primary"
              sparkData={occupancySpark}
              cta="View floor map →"
              ctaLink="/floor-map"
            />,
            canSeeFinance && (
              <KpiHeroCard
                key="mrr"
                label="Monthly Revenue"
                value={kpis.mrr}
                isCurrency
                sub="Active MRR"
                trend="+4.1% MoM"
                trendDirection="up"
                icon={IndianRupee}
                sparkData={revenueSpark}
                cta="View members →"
                ctaLink="/members"
              />
            ),
            canSeeFinance && (
              <KpiHeroCard
                key="risk"
                label="At-Risk Revenue"
                value={kpis.atRiskMrr}
                isCurrency
                sub={`${kpis.highRiskCount} high-risk members`}
                trend="Action required"
                trendDirection="down"
                icon={AlertTriangle}
                cta={canSeeRenewals ? "View renewals →" : undefined}
                ctaLink={canSeeRenewals ? "/renewals" : undefined}
                sparkData={atRiskSpark}
                sparkColor="var(--status-red)"
              />
            ),
            <KpiHeroCard
              key="members"
              label="Active Members"
              value={kpis.activeMembers}
              sub={
                canSeeFinance
                  ? `${kpis.overdueInvoices} overdue invoice${kpis.overdueInvoices === 1 ? "" : "s"}`
                  : "in this branch"
              }
              trend={
                canSeeRenewals
                  ? `${kpis.renewalsDueIn30Days} renewals next 30d`
                  : `${kpis.visitorsToday} visitors today`
              }
              trendDirection="up"
              icon={Users}
              sparkData={membersSpark}
              sparkColor="var(--status-blue)"
              cta="View directory →"
              ctaLink="/members"
            />,
          ]
            .filter(Boolean)
            .map((card, i) => (
            <motion.div
              key={i}
              variants={{
                hidden: { opacity: 0, y: 6 },
                show: { opacity: 1, y: 0, transition: { duration: 0.25 } },
              }}
            >
              {card}
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* § 3. Today's Focus — full width, the command-center moment */}
      <section>
        <TodayFocusCard />
      </section>

      {/* § 4. Branch performance matrix — full width, drill-down by row */}
      <section>
        <BranchTable />
      </section>

      {/* § 5. Trends */}
      <section className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <OccupancyChart />
        <RevenueChart />
      </section>
    </div>
  );
}
