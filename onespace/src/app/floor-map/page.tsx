"use client";

import React, { useState, useRef, useMemo } from "react";
import { Seat } from "@/types";
import { generateGachibowliFloorPlan } from "@/lib/data/floor-plan";
import { branches } from "@/lib/data/seed";
import { MapControls } from "@/components/floor-map/MapControls";
import { MapContainer } from "@/components/floor-map/MapContainer";
import { SeatDetailsPanel } from "@/components/floor-map/SeatDetailsPanel";

export default function FloorMapPage() {
  const [selectedBranch, setSelectedBranch] = useState("b2"); // Default to Gachibowli

  // Generate the floor plan data once (memoized)
  const floorPlan = useMemo(() => generateGachibowliFloorPlan(), []);

  const [seats, setSeats] = useState<Seat[]>(floorPlan.seats);
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);

  const controlsRef = useRef<{
    zoomIn: () => void;
    zoomOut: () => void;
    resetTransform: () => void;
  } | null>(null);

  // Compute stats from current seats
  const occupancyStats = useMemo(() => {
    const total = seats.length;
    const occupied = seats.filter((s) => s.status === "occupied").length;
    const available = seats.filter((s) => s.status === "available").length;
    const reserved = seats.filter((s) => s.status === "reserved").length;
    const maintenance = seats.filter((s) => s.status === "maintenance").length;
    return { total, occupied, available, reserved, maintenance };
  }, [seats]);

  const handleBranchChange = (branchId: string) => {
    setSelectedBranch(branchId);
    setSelectedSeat(null);
    // For demo, we only show the Gachibowli floor plan
    // Other branches would have their own generators
  };

  const handleSeatSelect = (seat: Seat) => {
    setSelectedSeat(seat.id === selectedSeat?.id ? null : seat);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem-3rem)] animate-in fade-in duration-500">
      <MapControls
        branches={branches}
        selectedBranch={selectedBranch}
        onBranchChange={handleBranchChange}
        onZoomIn={() => controlsRef.current?.zoomIn()}
        onZoomOut={() => controlsRef.current?.zoomOut()}
        onReset={() => controlsRef.current?.resetTransform()}
        occupancyStats={occupancyStats}
      />

      <div className="flex flex-1 min-h-0 gap-0">
        <MapContainer
          zones={floorPlan.zones}
          seats={seats}
          selectedSeat={selectedSeat}
          onSeatSelect={handleSeatSelect}
          onSeatsUpdate={setSeats}
          controlsRef={controlsRef}
        />

        <SeatDetailsPanel
          seat={selectedSeat}
          onClose={() => setSelectedSeat(null)}
        />
      </div>
    </div>
  );
}
