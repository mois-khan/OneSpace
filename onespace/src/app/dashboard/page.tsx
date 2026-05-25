"use client";

import { StatCard } from "@/components/dashboard/StatCard";
import { BranchTable } from "@/components/dashboard/BranchTable";
import { AlertFeed } from "@/components/dashboard/AlertFeed";
import { OccupancyChart } from "@/components/dashboard/OccupancyChart";
import { RevenueChart } from "@/components/dashboard/RevenueChart";
import { totalRevenue } from "@/lib/data/mock-charts";
import { TrendingUp, IndianRupee, AlertTriangle, Users } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="flex flex-col gap-6 max-w-[1400px] mx-auto animate-in fade-in duration-500">
      {/* Row 1: KPI Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          label="Total Occupancy"
          value={76}
          isPercentage={true}
          sub="Across 6 branches today"
          trend="+3% vs last week"
          trendDirection="up"
          icon={TrendingUp}
        />
        <StatCard 
          label="Monthly Revenue"
          value={totalRevenue}
          isCurrency={true}
          sub="Collected this month"
          trend="-₹12,000 from target"
          trendDirection="down"
          icon={IndianRupee}
        />
        <StatCard 
          label="At-Risk Revenue"
          value={108500}
          isCurrency={true}
          sub="5 members at high churn risk"
          trend="Action required"
          trendDirection="down"
          icon={AlertTriangle}
          cta="View renewals →"
          ctaLink="/renewals"
        />
        <StatCard 
          label="Active Members"
          value={1524}
          sub="18 contracts due in 30 days"
          trend="+6 this month"
          trendDirection="up"
          icon={Users}
        />
      </div>

      {/* Row 2: Branch Table + Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <BranchTable />
        <AlertFeed />
      </div>

      {/* Row 3: Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <OccupancyChart />
        <RevenueChart />
      </div>
    </div>
  );
}
