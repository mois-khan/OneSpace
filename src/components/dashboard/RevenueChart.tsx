"use client";

import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { useBranchRevenue, useAppActions } from "@/lib/store";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { formatCurrency } from "@/lib/utils";
import { SectionHeader } from "./SectionHeader";
import { useMemo } from "react";

const BRANCH_ID_BY_NAME: Record<string, string> = {
  "CS Coworking - Hitech City": "b1",
  "CS Coworking - Gachibowli": "b2",
  "CS Coworking - Raidurg": "b3",
  "CS Coworking - Kondapur": "b4",
  "CS Coworking - Shaikpet I": "b5",
  "CS Coworking - Shaikpet II": "b6",
};

export function RevenueChart() {
  const router = useRouter();
  const { setBranch } = useAppActions();
  const raw = useBranchRevenue();

  const data = useMemo(
    () =>
      [...raw]
        .sort((a, b) => b.revenue - a.revenue)
        .map((d) => ({
          ...d,
          // pretty label (strip "CS Coworking - " prefix)
          label: d.branch.replace("CS Coworking - ", ""),
        })),
    [raw],
  );

  return (
    <Card className="col-span-2 lg:col-span-2 shadow-[0_1px_2px_rgba(17,24,39,0.04)] bg-white p-5 flex flex-col h-[400px]">
      <SectionHeader
        eyebrow="Finance"
        title="Revenue by branch"
        description="Monthly Recurring Revenue · click to filter"
      />

      <div className="flex-1 min-h-0 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 10, right: 30, left: 10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F3F5" />
            <XAxis
              type="number"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "#6B7280" }}
              tickFormatter={(val) => `₹${(val / 100000).toFixed(0)}L`}
            />
            <YAxis
              dataKey="label"
              type="category"
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: "#374151", fontWeight: 500 }}
              width={88}
            />
            <Tooltip
              cursor={{ fill: "#F8F9FA" }}
              contentStyle={{
                borderRadius: "8px",
                border: "1px solid #E5E7EB",
                boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
              }}
              formatter={(value) => [formatCurrency(Number(value) || 0), "MRR"]}
              labelStyle={{ color: "#1A1A1A", fontWeight: 600, marginBottom: "4px" }}
            />
            <Bar
              dataKey="revenue"
              radius={[0, 4, 4, 0]}
              barSize={20}
              animationDuration={700}
              cursor="pointer"
              onClick={(data) => {
                const branch = (data as { branch?: string } | undefined)?.branch;
                const id = branch ? BRANCH_ID_BY_NAME[branch] : undefined;
                if (id) {
                  setBranch(id);
                  router.push(`/floor-map?branch=${id}`);
                }
              }}
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={index === 0 ? "#C0141F" : index === 1 ? "#E8192C" : index === 2 ? "#EF4444" : "#9CA3AF"}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
