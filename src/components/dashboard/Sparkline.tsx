"use client";

import { Area, AreaChart, ResponsiveContainer } from "recharts";
import { useId } from "react";

interface SparklineProps {
  data: number[];
  color?: string;
  height?: number;
  fillOpacity?: number;
  strokeWidth?: number;
}

export function Sparkline({
  data,
  color = "#E8192C",
  height = 36,
  fillOpacity = 0.15,
  strokeWidth = 1.75,
}: SparklineProps) {
  const gradientId = useId();
  const chartData = data.map((value, i) => ({ i, value }));

  return (
    <div style={{ height }} className="w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 2, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={fillOpacity} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={strokeWidth}
            fill={`url(#${gradientId})`}
            isAnimationActive={true}
            animationDuration={600}
            dot={false}
            activeDot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
