"use client";

import { Card } from "@/components/ui/card";
import { occupancyTrendData } from "@/lib/data/mock-charts";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from "recharts";

const colors = {
  "Hitech City": "#E8192C",
  "Gachibowli": "#0D1B2A",
  "Raidurg": "#16A34A",
  "Kondapur": "#D97706",
  "Shaikpet-I": "#2563EB",
  "Shaikpet-II": "#9CA3AF"
};

export function OccupancyChart() {
  return (
    <Card className="col-span-3 lg:col-span-3 shadow-sm bg-white p-5 flex flex-col h-[400px]">
      <div className="mb-4">
        <h3 className="font-semibold text-cs-black font-heading">Occupancy Trend (Last 30 Days)</h3>
        <p className="text-xs text-cs-gray-500">Noticeable weekday/weekend cycles and mid-month anomalies</p>
      </div>
      
      <div className="flex-1 min-h-0 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={occupancyTrendData}
            margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
          >
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
              contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              itemStyle={{ fontSize: '13px', fontWeight: 500 }}
              labelStyle={{ fontSize: '12px', color: '#6B7280', marginBottom: '4px' }}
            />
            <Legend 
              wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }}
              iconType="circle"
              iconSize={8}
            />
            {Object.entries(colors).map(([branch, color]) => (
              <Line
                key={branch}
                type="monotone"
                dataKey={branch}
                stroke={color}
                strokeWidth={2}
                dot={false}
                activeDot={{ r: 6, strokeWidth: 0 }}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
