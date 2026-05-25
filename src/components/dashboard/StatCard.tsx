"use client";

import { useEffect, useState } from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import { Card } from "@/components/ui/card";
import { LucideIcon, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: number;
  isCurrency?: boolean;
  isPercentage?: boolean;
  sub: string;
  trend: string;
  trendDirection: "up" | "down" | "neutral";
  icon: LucideIcon;
  cta?: string;
  ctaLink?: string;
}

export function StatCard({
  label,
  value,
  isCurrency,
  isPercentage,
  sub,
  trend,
  trendDirection,
  icon: Icon,
  cta,
  ctaLink
}: StatCardProps) {
  const [hasMounted, setHasMounted] = useState(false);
  const spring = useSpring(0, { mass: 1, stiffness: 60, damping: 15 });
  
  const displayValue = useTransform(spring, (current) => {
    if (isCurrency) {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
      }).format(current);
    }
    if (isPercentage) {
      return Math.round(current) + "%";
    }
    return Math.round(current).toLocaleString("en-IN") + (value > 1000 && !isPercentage ? "+" : "");
  });

  useEffect(() => {
    setHasMounted(true);
    spring.set(value);
  }, [spring, value]);

  return (
    <Card className="p-5 border-t-4 border-t-cs-red relative overflow-hidden flex flex-col justify-between hover:-translate-y-1 transition-transform duration-200 shadow-sm hover:shadow-md bg-white">
      <div className="flex justify-between items-start mb-2">
        <span className="text-[12px] font-medium text-cs-gray-500 uppercase tracking-wider font-sans">
          {label}
        </span>
        <div className="p-2 bg-cs-red-bg rounded-lg">
          <Icon className="w-5 h-5 text-cs-red" />
        </div>
      </div>
      
      <div className="mb-3">
        <motion.div className="text-[28px] font-bold text-cs-black font-heading leading-tight">
          {hasMounted ? <motion.span>{displayValue}</motion.span> : (isCurrency ? "₹0" : "0")}
        </motion.div>
        <div className="text-[13px] text-cs-gray-500 mt-1">{sub}</div>
      </div>

      <div className="flex items-center justify-between mt-auto pt-4 border-t border-cs-gray-100">
        <div className="flex items-center gap-1.5">
          {trendDirection === "up" && <ArrowUpRight className="w-4 h-4 text-status-green" />}
          {trendDirection === "down" && <ArrowDownRight className="w-4 h-4 text-status-amber" />}
          <span className={cn(
            "text-[13px] font-medium",
            trendDirection === "up" ? "text-status-green" : 
            trendDirection === "down" ? "text-status-amber" : "text-cs-gray-500"
          )}>
            {trend}
          </span>
        </div>
        
        {cta && (
          <a href={ctaLink || "#"} className="text-[13px] font-medium text-cs-red hover:text-cs-red-dark transition-colors">
            {cta}
          </a>
        )}
      </div>
    </Card>
  );
}
