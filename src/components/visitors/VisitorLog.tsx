"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Search, QrCode, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useVisitors, useAppActions, useNow } from "@/lib/store";
import type { Visitor } from "@/types";

const HOUR = 60 * 60 * 1000;

interface VisitorLogProps {
  onSelectVisitor: (visitor: Visitor) => void;
}

type StatusFilter = "all" | "inside" | "out" | "overstay";

export function VisitorLog({ onSelectVisitor }: VisitorLogProps) {
  const visitors = useVisitors();
  const { checkOutVisitor } = useAppActions();
  const now = useNow();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<StatusFilter>("all");

  const enriched = useMemo(() => {
    return [...visitors]
      .sort((a, b) => b.checkInAt.localeCompare(a.checkInAt))
      .map((v) => {
        const insideMs = v.checkOutAt
          ? new Date(v.checkOutAt).getTime() - new Date(v.checkInAt).getTime()
          : now - new Date(v.checkInAt).getTime();
        const hours = insideMs / HOUR;
        const statusKind: "inside" | "overstay" | "out" = v.checkOutAt
          ? "out"
          : hours > 8
          ? "overstay"
          : "inside";
        return { v, insideMs, statusKind };
      });
  }, [visitors, now]);

  const filtered = useMemo(() => {
    return enriched.filter(({ v, statusKind }) => {
      if (status !== "all" && statusKind !== status) return false;
      if (query.trim()) {
        const q = query.trim().toLowerCase();
        if (
          !v.name.toLowerCase().includes(q) &&
          !v.purpose.toLowerCase().includes(q) &&
          !v.phone.toLowerCase().includes(q) &&
          !(v.hostName || "").toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [enriched, status, query]);

  return (
    <Card className="bg-white shadow-[0_1px_2px_rgba(17,24,39,0.04)] flex flex-col overflow-hidden">
      <div className="px-4 py-3 border-b border-cs-gray-100 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <FilterChip label="All" count={enriched.length} active={status === "all"} onClick={() => setStatus("all")} />
          <FilterChip
            label="Inside"
            count={enriched.filter((e) => e.statusKind === "inside").length}
            active={status === "inside"}
            tone="green"
            onClick={() => setStatus("inside")}
          />
          <FilterChip
            label="Overstaying"
            count={enriched.filter((e) => e.statusKind === "overstay").length}
            active={status === "overstay"}
            tone="red"
            onClick={() => setStatus("overstay")}
          />
          <FilterChip
            label="Checked out"
            count={enriched.filter((e) => e.statusKind === "out").length}
            active={status === "out"}
            onClick={() => setStatus("out")}
          />
        </div>

        <div className="relative">
          <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-cs-gray-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search name, purpose, host…"
            className="pl-8 pr-3 py-1.5 border border-cs-gray-200 rounded-md text-[12px] focus:outline-none focus:ring-1 focus:ring-cs-red bg-white w-56"
          />
        </div>
      </div>

      <div className="overflow-y-auto max-h-[560px]">
        <table className="w-full text-sm text-left">
          <thead className="bg-cs-gray-50/60 sticky top-0 z-10 text-[10px] uppercase tracking-wider text-cs-gray-500 border-b border-cs-gray-100">
            <tr>
              <th className="px-4 py-2.5 font-semibold">Visitor</th>
              <th className="px-3 py-2.5 font-semibold">Purpose · Host</th>
              <th className="px-3 py-2.5 font-semibold">Checked in</th>
              <th className="px-3 py-2.5 font-semibold">Duration</th>
              <th className="px-3 py-2.5 font-semibold">Status</th>
              <th className="px-3 py-2.5 font-semibold text-right pr-4">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cs-gray-100">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-cs-gray-500 text-[13px]">
                  No visitors match the current filters.
                </td>
              </tr>
            ) : (
              filtered.map(({ v, insideMs, statusKind }) => (
                <tr
                  key={v.id}
                  onClick={() => onSelectVisitor(v)}
                  className="hover:bg-cs-red-bg/30 transition-colors cursor-pointer group"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <span className="w-8 h-8 rounded-full bg-cs-gray-100 border border-cs-gray-200 flex items-center justify-center text-[11px] font-bold text-cs-gray-700 shrink-0">
                        {v.name.split(" ").map((p) => p[0]).join("").substring(0, 2).toUpperCase()}
                      </span>
                      <div className="min-w-0">
                        <div className="text-[13px] font-semibold text-cs-black truncate group-hover:text-cs-red transition-colors">
                          {v.name}
                          {v.preRegistrationId && (
                            <span
                              className="ml-1.5 inline-flex items-center gap-0.5 text-[9px] font-semibold uppercase tracking-wider text-cs-red"
                              title="Self-checked-in via QR"
                            >
                              <QrCode className="w-2.5 h-2.5" /> QR
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-cs-gray-500 truncate">{v.phone}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-3 py-3">
                    <div className="text-[12px] text-cs-gray-700">{v.purpose}</div>
                    {v.hostName && (
                      <div className="text-[11px] text-cs-gray-500">→ {v.hostName}</div>
                    )}
                  </td>
                  <td className="px-3 py-3 text-[12px] text-cs-gray-700 tabular-nums">
                    {new Date(v.checkInAt).toLocaleTimeString([], {
                      hour: "numeric",
                      minute: "2-digit",
                    })}
                  </td>
                  <td className="px-3 py-3 text-[12px] text-cs-gray-700 tabular-nums">
                    {formatDuration(insideMs)}
                  </td>
                  <td className="px-3 py-3">
                    <StatusPill kind={statusKind} />
                  </td>
                  <td className="px-3 py-3 pr-4 text-right">
                    {statusKind !== "out" ? (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          checkOutVisitor(v.id);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[12px] font-medium bg-white border border-cs-gray-200 text-cs-gray-700 hover:bg-cs-gray-50 hover:text-cs-black transition-colors"
                      >
                        <LogOut className="w-3 h-3" /> Check out
                      </button>
                    ) : (
                      <span className="text-[11px] text-cs-gray-500">
                        out{" "}
                        {new Date(v.checkOutAt!).toLocaleTimeString([], {
                          hour: "numeric",
                          minute: "2-digit",
                        })}
                      </span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

function FilterChip({
  label,
  count,
  active,
  onClick,
  tone,
}: {
  label: string;
  count: number;
  active: boolean;
  onClick: () => void;
  tone?: "green" | "red";
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[12px] font-medium transition-colors",
        active
          ? "bg-cs-red text-white border-cs-red shadow-sm"
          : "bg-white text-cs-gray-700 border-cs-gray-200 hover:border-cs-gray-300",
      )}
    >
      <span
        className={cn(
          "w-1.5 h-1.5 rounded-full",
          active
            ? "bg-white"
            : tone === "green"
            ? "bg-status-green"
            : tone === "red"
            ? "bg-status-red"
            : "bg-cs-gray-500",
        )}
      />
      {label}
      <span
        className={cn(
          "text-[11px] font-semibold px-1.5 py-0.5 rounded tabular-nums",
          active ? "bg-white/20 text-white" : "bg-cs-gray-100 text-cs-gray-700",
        )}
      >
        {count}
      </span>
    </button>
  );
}

function StatusPill({ kind }: { kind: "inside" | "overstay" | "out" }) {
  const cfg = {
    inside: { label: "Inside", bg: "bg-[#16A34A1A]", text: "text-status-green", dot: "bg-status-green" },
    overstay: { label: "Overstaying", bg: "bg-[#DC26261A]", text: "text-status-red", dot: "bg-status-red" },
    out: { label: "Checked out", bg: "bg-cs-gray-100", text: "text-cs-gray-700", dot: "bg-cs-gray-500" },
  }[kind];
  return (
    <span className={cn("inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-medium", cfg.bg, cfg.text)}>
      <span className={cn("w-1.5 h-1.5 rounded-full", cfg.dot)} />
      {cfg.label}
    </span>
  );
}

function formatDuration(ms: number) {
  if (ms < 60_000) return "<1m";
  const minutes = Math.round(ms / 60_000);
  if (minutes < 60) return `${minutes}m`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m === 0 ? `${h}h` : `${h}h ${m}m`;
}
