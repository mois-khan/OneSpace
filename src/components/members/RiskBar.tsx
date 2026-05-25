import React from "react";
import { cn } from "@/lib/utils";

interface RiskBarProps {
  score: number;
  className?: string;
}

export function RiskBar({ score, className }: RiskBarProps) {
  let colorClass = "bg-green-500";
  if (score >= 70) colorClass = "bg-red-500";
  else if (score >= 40) colorClass = "bg-amber-500";

  return (
    <div className={cn("w-full bg-cs-gray-100 rounded-full h-1.5 overflow-hidden", className)}>
      <div
        className={cn("h-full transition-all duration-500 ease-out", colorClass)}
        style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
      />
    </div>
  );
}
