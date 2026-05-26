"use client";

import { useEffect } from "react";
import { motion, useSpring, useTransform } from "framer-motion";
import { Card } from "@/components/ui/card";
import { LucideIcon, ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { cn } from "@/lib/utils";
import { Sparkline } from "./Sparkline";

type TrendDirection = "up" | "down" | "neutral";

interface KpiHeroCardProps {
  label: string;
  value: number;
  isCurrency?: boolean;
  isPercentage?: boolean;
  sub?: string;
  trend?: string;
  trendDirection?: TrendDirection;
  icon: LucideIcon;
  cta?: string;
  ctaLink?: string;
  sparkData?: number[];
  /** "primary" = larger hero treatment; "default" = standard size */
  variant?: "primary" | "default";
  /** override sparkline color (defaults to brand red for primary, gray for default) */
  sparkColor?: string;
}

export function KpiHeroCard({
  label,
  value,
  isCurrency,
  isPercentage,
  sub,
  trend,
  trendDirection = "neutral",
  icon: Icon,
  cta,
  ctaLink,
  sparkData,
  variant = "default",
  sparkColor,
}: KpiHeroCardProps) {
  const spring = useSpring(0, { mass: 1, stiffness: 60, damping: 15 });

  const displayValue = useTransform(spring, (current) => {
    if (isCurrency) {
      return new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
        maximumFractionDigits: 0,
        notation: current >= 1_00_000 ? "compact" : "standard",
      }).format(current);
    }
    if (isPercentage) return Math.round(current) + "%";
    return Math.round(current).toLocaleString("en-IN");
  });

  useEffect(() => {
    spring.set(value);
  }, [spring, value]);

  const isPrimary = variant === "primary";
  const resolvedSparkColor =
    sparkColor ?? (isPrimary ? "var(--cs-red)" : "var(--cs-gray-500)");

  const trendTone =
    trendDirection === "up"
      ? "text-status-green bg-[#16A34A1A]"
      : trendDirection === "down"
      ? "text-status-red bg-[#DC26261A]"
      : "text-cs-gray-500 bg-cs-gray-100";

  const TrendIcon =
    trendDirection === "up"
      ? ArrowUpRight
      : trendDirection === "down"
      ? ArrowDownRight
      : Minus;

  return (
    <Card
      className={cn(
        "relative overflow-hidden bg-white border border-cs-gray-300/60 shadow-[0_1px_2px_rgba(17,24,39,0.04)]",
        "hover:-translate-y-0.5 hover:shadow-[0_4px_16px_rgba(17,24,39,0.06)] transition-all duration-150",
        "flex flex-col",
        isPrimary ? "p-6" : "p-5"
      )}
    >
      {/* faint brand accent at top for primary variant only */}
      {isPrimary && (
        <div
          aria-hidden
          className="absolute inset-x-0 top-0 h-[3px]"
          style={{
            background:
              "linear-gradient(90deg, var(--cs-red) 0%, var(--cs-red-dark) 100%)",
          }}
        />
      )}

      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-cs-gray-500">
            {label}
          </div>
          <div
            className={cn(
              "mt-2 font-bold font-heading text-cs-black leading-none tabular-nums",
              isPrimary ? "text-[32px]" : "text-[24px]"
            )}
          >
            <motion.span>{displayValue}</motion.span>
          </div>
          {sub && (
            <div className="text-[12px] text-cs-gray-500 mt-1.5 truncate">{sub}</div>
          )}
        </div>
        <div
          className={cn(
            "shrink-0 rounded-lg flex items-center justify-center",
            isPrimary
              ? "w-10 h-10 bg-cs-red-bg"
              : "w-9 h-9 bg-cs-gray-50 border border-cs-gray-100"
          )}
        >
          <Icon
            className={cn("w-4 h-4", isPrimary ? "text-cs-red" : "text-cs-gray-700")}
          />
        </div>
      </div>

      {sparkData && sparkData.length > 1 && (
        <div className={cn("mt-3 -mx-1", isPrimary ? "h-10" : "h-8")}>
          <Sparkline
            data={sparkData}
            color={resolvedSparkColor}
            height={isPrimary ? 40 : 32}
            fillOpacity={isPrimary ? 0.18 : 0.1}
          />
        </div>
      )}

      <div className="flex items-center justify-between gap-2 mt-3 pt-3 border-t border-cs-gray-100">
        {trend ? (
          <span
            className={cn(
              "inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[12px] font-medium tabular-nums",
              trendTone
            )}
          >
            <TrendIcon className="w-3.5 h-3.5" />
            {trend}
          </span>
        ) : (
          <span />
        )}
        {cta && (
          <a
            href={ctaLink || "#"}
            className="text-[12px] font-medium text-cs-red hover:text-cs-red-dark transition-colors"
          >
            {cta}
          </a>
        )}
      </div>
    </Card>
  );
}
