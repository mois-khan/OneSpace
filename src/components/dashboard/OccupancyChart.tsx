"use client";

import { Card } from "@/components/ui/card";
import { useOccupancyTrend, useBranch } from "@/lib/store";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { SectionHeader } from "./SectionHeader";
import { useMemo } from "react";

const ALL_KEYS: Array<{ key: string; color: string }> = [
  { key: "CS Coworking - Hitech City", color: "#E8192C" },
  { key: "CS Coworking - Gachibowli", color: "#0D1B2A" },
  { key: "CS Coworking - Raidurg", color: "#16A34A" },
  { key: "CS Coworking - Kondapur", color: "#D97706" },
  { key: "CS Coworking - Shaikpet I", color: "#2563EB" },
  { key: "CS Coworking - Shaikpet II", color: "#9CA3AF" },
];

export function OccupancyChart() {
  const data = useOccupancyTrend();
  const { selectedBranchId, selectedBranch } = useBranch();

  const visibleSeries = useMemo(() => {
    if (selectedBranchId === "all") return ALL_KEYS;
    if (!selectedBranch) return ALL_KEYS;
    return ALL_KEYS.filter((s) => s.key === `CS Coworking - ${selectedBranch.name}`);
  }, [selectedBranchId, selectedBranch]);

  return (
    <Card className="col-span-3 lg:col-span-3 shadow-[0_1px_2px_rgba(17,24,39,0.04)] bg-white p-5 flex flex-col h-[400px]">
      <SectionHeader
        eyebrow="Trends"
        title="Occupancy trajectory"
        description={
          selectedBranchId === "all"
            ? "Last 30 days · all branches"
            : `Last 30 days · ${selectedBranch?.name || ""}`
        }
      />

      <div className="flex-1 min-h-0 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F3F5" />
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: "#6B7280" }}
              dy={10}
              minTickGap={20}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: "#6B7280" }}
              tickFormatter={(val) => `${val}%`}
              domain={[0, 100]}
            />
            <Tooltip
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #E5E7EB",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                fontSize: 12,
              }}
              itemStyle={{ fontSize: "12px", fontWeight: 500 }}
              labelStyle={{ fontSize: "11px", color: "#6B7280", marginBottom: "4px" }}
            />
            <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "12px" }} iconType="circle" iconSize={7} />
            {visibleSeries.map(({ key, color }) => (
              <Line
                key={key}
                type="monotone"
                dataKey={key}
                stroke={color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 5, strokeWidth: 0 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
