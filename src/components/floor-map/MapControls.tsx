"use client";

import {
  Briefcase,
  Building2,
  DoorOpen,
  Phone,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Activity,
} from "lucide-react";
import { cn } from "@/lib/utils";

export type ZoneCategory = "hot_desk" | "dedicated" | "cabin" | "meeting";

interface MapControlsProps {
  branches: { id: string; name: string }[];
  selectedBranch: string;
  onBranchChange: (branchId: string) => void;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  occupancyStats: {
    total: number;
    occupied: number;
    available: number;
    reserved: number;
    maintenance: number;
  };
  visibleCategories: Set<ZoneCategory>;
  onToggleCategory: (cat: ZoneCategory) => void;
}

const STATUS_LEGEND: Array<{
  key: "occupied" | "available" | "reserved" | "maintenance";
  label: string;
  bg: string;
  border: string;
}> = [
  { key: "available", label: "Available", bg: "#DCFCE7", border: "#22C55E" },
  { key: "occupied", label: "Occupied", bg: "#FEE2E2", border: "#EF4444" },
  { key: "reserved", label: "Reserved", bg: "#FEF3C7", border: "#F59E0B" },
  { key: "maintenance", label: "Maintenance", bg: "#F3F4F6", border: "#9CA3AF" },
];

const CATEGORY_FILTERS: Array<{
  key: ZoneCategory;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { key: "hot_desk", label: "Hot desks", icon: Briefcase },
  { key: "dedicated", label: "Dedicated", icon: DoorOpen },
  { key: "cabin", label: "Cabins", icon: Building2 },
  { key: "meeting", label: "Meeting rooms", icon: Phone },
];

export function MapControls({
  branches,
  selectedBranch,
  onBranchChange,
  onZoomIn,
  onZoomOut,
  onReset,
  occupancyStats,
  visibleCategories,
  onToggleCategory,
}: MapControlsProps) {
  const occupancyPct =
    occupancyStats.total > 0
      ? Math.round(
          ((occupancyStats.occupied + occupancyStats.reserved) / occupancyStats.total) * 100,
        )
      : 0;

  return (
    <div className="mb-4 space-y-3">
      {/* Toolbar row 1 — branch picker · live occupancy · zoom */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          <select
            value={selectedBranch}
            onChange={(e) => onBranchChange(e.target.value)}
            className="bg-white border border-cs-gray-200 rounded-lg px-3 py-2 text-sm font-medium text-cs-black focus:outline-none focus:ring-2 focus:ring-cs-red/30 focus:border-cs-red cursor-pointer"
          >
            {branches.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2 bg-white border border-cs-gray-200 rounded-lg px-3 py-2">
            <Activity className="w-3.5 h-3.5 text-cs-red" />
            <span className="text-sm font-semibold text-cs-black tabular-nums">{occupancyPct}%</span>
            <span className="text-[11px] text-cs-gray-500">live occupancy</span>
          </div>
        </div>

        <div className="flex items-center gap-1 bg-white border border-cs-gray-200 rounded-lg overflow-hidden">
          <button
            onClick={onZoomIn}
            className="p-2 hover:bg-cs-gray-50 transition-colors text-cs-gray-700 hover:text-cs-black"
            title="Zoom in"
            aria-label="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <div className="w-px h-5 bg-cs-gray-200" />
          <button
            onClick={onZoomOut}
            className="p-2 hover:bg-cs-gray-50 transition-colors text-cs-gray-700 hover:text-cs-black"
            title="Zoom out"
            aria-label="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <div className="w-px h-5 bg-cs-gray-200" />
          <button
            onClick={onReset}
            className="p-2 hover:bg-cs-gray-50 transition-colors text-cs-gray-700 hover:text-cs-black"
            title="Reset view"
            aria-label="Reset view"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Toolbar row 2 — status legend + category filter chips */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-cs-gray-500 mr-1">
            Status
          </span>
          {STATUS_LEGEND.map((s) => (
            <span
              key={s.key}
              className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-white border border-cs-gray-200 text-[11px]"
            >
              <span
                className="w-3 h-3 rounded-sm shrink-0"
                style={{ backgroundColor: s.bg, border: `1.5px solid ${s.border}` }}
              />
              <span className="text-cs-gray-700">{s.label}</span>
              <span className="font-semibold text-cs-black tabular-nums">
                {occupancyStats[s.key]}
              </span>
            </span>
          ))}
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[10px] font-semibold uppercase tracking-[0.08em] text-cs-gray-500 mr-1">
            Filter
          </span>
          {CATEGORY_FILTERS.map((f) => {
            const active = visibleCategories.has(f.key);
            const Icon = f.icon;
            return (
              <button
                key={f.key}
                type="button"
                onClick={() => onToggleCategory(f.key)}
                className={cn(
                  "inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-medium border transition-colors",
                  active
                    ? "bg-cs-red-bg text-cs-red border-cs-red/30"
                    : "bg-white text-cs-gray-500 border-cs-gray-200 hover:border-cs-gray-300",
                )}
                aria-pressed={active}
              >
                <Icon className="w-3 h-3" />
                {f.label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
