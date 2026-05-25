"use client";

import { ZoomIn, ZoomOut, Maximize2, Layers } from "lucide-react";
import { cn } from "@/lib/utils";

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
}

export function MapControls({
  branches,
  selectedBranch,
  onBranchChange,
  onZoomIn,
  onZoomOut,
  onReset,
  occupancyStats,
}: MapControlsProps) {
  const occupancyPct = occupancyStats.total > 0
    ? Math.round((occupancyStats.occupied / occupancyStats.total) * 100)
    : 0;

  return (
    <div className="flex items-center justify-between gap-4 mb-4 flex-wrap">
      {/* Branch selector */}
      <div className="flex items-center gap-3">
        <Layers className="w-4 h-4 text-cs-gray-500" />
        <select
          value={selectedBranch}
          onChange={(e) => onBranchChange(e.target.value)}
          className="bg-white border border-cs-gray-200 rounded-lg px-3 py-2 text-sm font-medium text-cs-black focus:outline-none focus:ring-2 focus:ring-cs-red/30 focus:border-cs-red cursor-pointer"
        >
          {branches.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>

        {/* Occupancy Badge */}
        <div className="flex items-center gap-2 bg-white border border-cs-gray-200 rounded-lg px-3 py-2">
          <div className="w-2 h-2 rounded-full bg-cs-red animate-pulse"></div>
          <span className="text-sm font-semibold text-cs-black">{occupancyPct}%</span>
          <span className="text-xs text-cs-gray-500">occupied</span>
        </div>
      </div>

      {/* Middle: Legend */}
      <div className="flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#DCFCE7", border: "1px solid #22C55E" }}></span>
          <span className="text-cs-gray-600">Available ({occupancyStats.available})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#FEE2E2", border: "1px solid #EF4444" }}></span>
          <span className="text-cs-gray-600">Occupied ({occupancyStats.occupied})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#FEF3C7", border: "1px solid #F59E0B" }}></span>
          <span className="text-cs-gray-600">Reserved ({occupancyStats.reserved})</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-sm" style={{ backgroundColor: "#F3F4F6", border: "1px solid #9CA3AF" }}></span>
          <span className="text-cs-gray-600">Maintenance ({occupancyStats.maintenance})</span>
        </div>
      </div>

      {/* Right: Zoom controls */}
      <div className="flex items-center gap-1 bg-white border border-cs-gray-200 rounded-lg overflow-hidden">
        <button
          onClick={onZoomIn}
          className="p-2 hover:bg-cs-gray-50 transition-colors text-cs-gray-600 hover:text-cs-black"
          title="Zoom in"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <div className="w-px h-5 bg-cs-gray-200"></div>
        <button
          onClick={onZoomOut}
          className="p-2 hover:bg-cs-gray-50 transition-colors text-cs-gray-600 hover:text-cs-black"
          title="Zoom out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <div className="w-px h-5 bg-cs-gray-200"></div>
        <button
          onClick={onReset}
          className="p-2 hover:bg-cs-gray-50 transition-colors text-cs-gray-600 hover:text-cs-black"
          title="Reset view"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
