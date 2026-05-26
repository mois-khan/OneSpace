"use client";

import { useMemo } from "react";
import { Sparkles, ArrowRight } from "lucide-react";
import { useKpis, useBranchPerformance, useAtRiskMembers } from "@/lib/store";

/** Custom event the AssistantRoot listens for to open the assistant panel. */
export const OPEN_ASSISTANT_EVENT = "onespace:open-assistant";

export function openAssistant() {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(OPEN_ASSISTANT_EVENT));
}

export function AiInsightBanner() {
  const kpis = useKpis();
  const branches = useBranchPerformance();
  const atRisk = useAtRiskMembers();

  /** Pick the most actionable headline. Priority: critical renewals, then worst branch, then top at-risk member. */
  const insight = useMemo(() => {
    if (kpis.renewalsDueIn7Days > 0) {
      return {
        headline: `${kpis.renewalsDueIn7Days} renewal${kpis.renewalsDueIn7Days === 1 ? "" : "s"} need attention this week`,
        prompt: "Which renewals should I prioritize today?",
      };
    }
    const worst = [...branches].sort((a, b) => a.occupancy - b.occupancy)[0];
    if (worst && worst.occupancy < 60) {
      return {
        headline: `${worst.name} occupancy is at ${worst.occupancy}% — below target`,
        prompt: `Why is ${worst.name} occupancy low and what should I do?`,
      };
    }
    const topRisk = atRisk[0];
    if (topRisk) {
      return {
        headline: `${topRisk.name} is your highest churn risk right now`,
        prompt: `Draft a retention plan for ${topRisk.name}`,
      };
    }
    return {
      headline: "Ask anything — your data, your scope, instant answers",
      prompt: "Give me a 30-second briefing on today",
    };
  }, [kpis, branches, atRisk]);

  return (
    <button
      type="button"
      onClick={() => openAssistant()}
      className="group w-full text-left relative overflow-hidden rounded-xl border border-cs-gray-300/60 bg-white shadow-[0_1px_2px_rgba(17,24,39,0.04)] hover:shadow-[0_4px_16px_rgba(17,24,39,0.06)] hover:-translate-y-0.5 transition-all"
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.04] pointer-events-none"
        style={{
          background:
            "linear-gradient(90deg, var(--cs-hero-from) 0%, var(--cs-hero-to) 100%)",
        }}
      />
      <div className="relative flex items-center gap-4 px-4 py-3">
        <span className="w-9 h-9 rounded-lg bg-cs-red-bg flex items-center justify-center shrink-0">
          <Sparkles className="w-4 h-4 text-cs-red" />
        </span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-cs-red">
              AI Insight
            </span>
            <span className="w-1 h-1 rounded-full bg-cs-gray-300" />
            <span className="text-[10px] text-cs-gray-500">Updated just now</span>
          </div>
          <p className="text-[14px] font-medium text-cs-black mt-0.5 truncate">
            {insight.headline}
          </p>
          <p className="text-[12px] text-cs-gray-500 mt-0.5 truncate">
            Try: <span className="italic">&ldquo;{insight.prompt}&rdquo;</span>
          </p>
        </div>
        <span className="shrink-0 inline-flex items-center gap-1.5 text-[12px] font-medium text-cs-red group-hover:translate-x-0.5 transition-transform">
          Ask the AI
          <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </button>
  );
}
