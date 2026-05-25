"use client";

import { Card } from "@/components/ui/card";
import { branchRevenueData } from "@/lib/data/mock-charts";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell
} from "recharts";
import { formatCurrency } from "@/lib/utils";

export function RevenueChart() {
  return (
    <Card className="col-span-2 lg:col-span-2 shadow-sm bg-white p-5 flex flex-col h-[400px]">
      <div className="mb-4">
        <h3 className="font-semibold text-cs-black font-heading">Revenue by Branch</h3>
        <p className="text-xs text-cs-gray-500">Monthly Recurring Revenue (MRR)</p>
      </div>
      
      <div className="flex-1 min-h-0 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={branchRevenueData}
            layout="vertical"
            margin={{ top: 10, right: 30, left: 10, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#F1F3F5" />
            <XAxis 
              type="number" 
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 11, fill: "#6B7280" }}
              tickFormatter={(val) => `₹${(val / 100000).toFixed(0)}L`}
            />
            <YAxis 
              dataKey="branch" 
              type="category" 
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: "#374151", fontWeight: 500 }}
              width={80}
            />
            <Tooltip
              cursor={{ fill: '#F8F9FA' }}
              contentStyle={{ borderRadius: '8px', border: '1px solid #E5E7EB', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
              formatter={(value: any) => [formatCurrency(value as number), "MRR"]}
              labelStyle={{ color: '#1A1A1A', fontWeight: 600, marginBottom: '4px' }}
            />
            <Bar 
              dataKey="revenue" 
              radius={[0, 4, 4, 0]}
              barSize={24}
              animationDuration={1000}
            >
              {branchRevenueData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={index === 0 ? "#C0141F" : index === 1 ? "#E8192C" : "#ef4444"} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Card>
  );
}
