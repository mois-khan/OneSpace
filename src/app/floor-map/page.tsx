"use client";

import { useState, useRef, useMemo, useCallback, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Seat } from "@/types";
import { generateFloorPlan, FloorPlan } from "@/lib/data/floor-plan";
import { useBranches, useBranch, useAppActions } from "@/lib/store";
import type { OnboardMemberPayload } from "@/lib/store";
import { MapControls, type ZoneCategory } from "@/components/floor-map/MapControls";
import { MapContainer } from "@/components/floor-map/MapContainer";
import { SeatDetailsPanel } from "@/components/floor-map/SeatDetailsPanel";
import { toast } from "sonner";

const ALL_CATEGORIES: ZoneCategory[] = ["hot_desk", "dedicated", "cabin", "meeting"];

function FloorMapWrapper() {
  const branches = useBranches();
  const { selectedBranchId } = useBranch();
  const { setBranch } = useAppActions();
  const searchParams = useSearchParams();
  const urlBranch = searchParams.get("branch");

  // Single derived branch: URL param > global context > default
  const branchId = useMemo(() => {
    if (urlBranch && branches.some((b) => b.id === urlBranch)) return urlBranch;
    if (selectedBranchId !== "all" && branches.some((b) => b.id === selectedBranchId))
      return selectedBranchId;
    return "b2";
  }, [urlBranch, branches, selectedBranchId]);

  return <FloorMapContent key={branchId} branchId={branchId} branches={branches} onBranchChange={setBranch} />;
}

export default function FloorMapPage() {
  return (
    <Suspense fallback={<div className="flex flex-col h-[calc(100vh-3.5rem-3rem)] animate-pulse bg-cs-gray-50/50" />}>
      <FloorMapWrapper />
    </Suspense>
  );
}

interface ContentProps {
  branchId: string;
  branches: ReturnType<typeof useBranches>;
  onBranchChange: (id: string) => void;
}

function FloorMapContent({ branchId, branches, onBranchChange }: ContentProps) {
  const floorPlan: FloorPlan = useMemo(() => generateFloorPlan(branchId), [branchId]);
  const [seats, setSeats] = useState<Seat[]>(floorPlan.seats);
  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [visibleCategories, setVisibleCategories] = useState<Set<ZoneCategory>>(
    () => new Set(ALL_CATEGORIES),
  );
  const { onboardMember } = useAppActions();

  const toggleCategory = useCallback((cat: ZoneCategory) => {
    setVisibleCategories((prev) => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat);
      else next.add(cat);
      // Never allow an empty set — re-fill if user deselected the last one.
      if (next.size === 0) return new Set(ALL_CATEGORIES);
      return next;
    });
  }, []);

  const controlsRef = useRef<{
    zoomIn: () => void;
    zoomOut: () => void;
    resetTransform: () => void;
  } | null>(null);

  const occupancyStats = useMemo(() => {
    const total = seats.length;
    const occupied = seats.filter((s) => s.status === "occupied").length;
    const available = seats.filter((s) => s.status === "available").length;
    const reserved = seats.filter((s) => s.status === "reserved").length;
    const maintenance = seats.filter((s) => s.status === "maintenance").length;
    return { total, occupied, available, reserved, maintenance };
  }, [seats]);

  const handleBranchChange = useCallback(
    (id: string) => {
      onBranchChange(id);
    },
    [onBranchChange],
  );

  const handleSeatSelect = useCallback((seat: Seat) => {
    setSelectedSeat((prev) => (prev?.id === seat.id ? null : seat));
  }, []);

  const handleAssignSeat = useCallback(
    (seatId: string, payload: OnboardMemberPayload) => {
      // 1. Dispatch global store action
      onboardMember(payload);

      // 2. Update local seats state — mark seat as occupied
      setSeats((prev) =>
        prev.map((s) =>
          s.id === seatId
            ? { ...s, status: "occupied" as const, memberId: `m-ob-${Date.now()}` }
            : s,
        ),
      );

      // 3. Toast
      toast.success(`${payload.name} onboarded to seat ${selectedSeat?.code || seatId}`, {
        description: `${payload.planType} plan · ₹${(payload.monthlyFee / 1000).toFixed(0)}k/mo`,
      });
    },
    [onboardMember, selectedSeat],
  );

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem-3rem)] animate-in fade-in duration-500">
      <MapControls
        branches={branches}
        selectedBranch={branchId}
        onBranchChange={handleBranchChange}
        onZoomIn={() => controlsRef.current?.zoomIn()}
        onZoomOut={() => controlsRef.current?.zoomOut()}
        onReset={() => controlsRef.current?.resetTransform()}
        occupancyStats={occupancyStats}
        visibleCategories={visibleCategories}
        onToggleCategory={toggleCategory}
      />

      <div className="flex flex-1 min-h-0 gap-0 relative">
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
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
              visibleCategories={visibleCategories}
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
                branchId={branchId}
                onClose={() => setSelectedSeat(null)}
                onAssignSeat={handleAssignSeat}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

