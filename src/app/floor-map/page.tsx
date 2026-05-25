"use client";

import React, { useState, useRef, useMemo, useCallback, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Seat } from "@/types";
import { generateFloorPlan, FloorPlan } from "@/lib/data/floor-plan";
import { branches } from "@/lib/data/seed";
import { MapControls } from "@/components/floor-map/MapControls";
import { MapContainer } from "@/components/floor-map/MapContainer";
import { SeatDetailsPanel } from "@/components/floor-map/SeatDetailsPanel";

export default function FloorMapPage() {
  const [selectedBranch, setSelectedBranch] = useState("b2"); // Default to Gachibowli
  const [floorPlan, setFloorPlan] = useState<FloorPlan>(() => generateFloorPlan("b2"));
  const [seats, setSeats] = useState<Seat[]>(floorPlan.seats);
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

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

  const handleBranchChange = useCallback((branchId: string) => {
    if (branchId === selectedBranch) return;
    setIsTransitioning(true);
    setSelectedSeat(null);

    // Animate out, then swap data, then animate in
    setTimeout(() => {
      const newPlan = generateFloorPlan(branchId);
      setSelectedBranch(branchId);
      setFloorPlan(newPlan);
      setSeats(newPlan.seats);

      // Reset zoom after branch switch
      setTimeout(() => {
        controlsRef.current?.resetTransform();
        setIsTransitioning(false);
      }, 100);
    }, 250);
  }, [selectedBranch]);

  const handleSeatSelect = useCallback((seat: Seat) => {
    setSelectedSeat((prev) => prev?.id === seat.id ? null : seat);
  }, []);

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

      <div className="flex flex-1 min-h-0 gap-0 relative">
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedBranch}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="flex-1 min-h-0 flex"
          >
            <MapContainer
              zones={floorPlan.zones}
              seats={seats}
              canvasWidth={floorPlan.canvasWidth}
              canvasHeight={floorPlan.canvasHeight}
              branchName={floorPlan.branchName}
              address={floorPlan.address}
              selectedSeat={selectedSeat}
              onSeatSelect={handleSeatSelect}
              onSeatsUpdate={setSeats}
              controlsRef={controlsRef}
            />
          </motion.div>
        </AnimatePresence>

        <AnimatePresence>
          {selectedSeat && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden flex-shrink-0"
            >
              <SeatDetailsPanel
                seat={selectedSeat}
                onClose={() => setSelectedSeat(null)}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
