"use client";

import { useState, useRef, useMemo, useCallback, Suspense, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Seat, FloorPlan, Floor } from "@/types";
import { generateFloorPlan } from "@/lib/data/floor-plan";
import { useBranches, useBranch, useAppActions } from "@/lib/store";
import type { OnboardMemberPayload } from "@/lib/store";
import { MapControls, type ZoneCategory } from "@/components/floor-map/MapControls";
import { MapContainer } from "@/components/floor-map/MapContainer";
import { SeatDetailsPanel } from "@/components/floor-map/SeatDetailsPanel";
import { DesignerSidebar } from "@/components/floor-map/DesignerSidebar";
import { toast } from "sonner";
import { useAppState } from "@/lib/store/provider";
import { buildDesignerComponent } from "@/lib/data/designer-utils";

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
  const { floorPlans } = useAppState();
  const { onboardMember, saveFloorPlan } = useAppActions();

  // Fallback for when state is hydrated from an older version of localStorage
  // that doesn't have floorPlans.
  const fallbackPlan = useMemo(() => generateFloorPlan(branchId), [branchId]);
  const floorPlan: FloorPlan = floorPlans?.[branchId] || fallbackPlan;
  
  const [activeFloorId, setActiveFloorId] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  const currentFloorId = useMemo(() => {
    if (!floorPlan) return "";
    if (activeFloorId && floorPlan.floors.some((f: Floor) => f.id === activeFloorId)) return activeFloorId;
    return floorPlan.floors[0]?.id || "";
  }, [activeFloorId, floorPlan]);

  const activeFloor = useMemo(() => {
    if (!floorPlan) return null;
    return floorPlan.floors.find((f: Floor) => f.id === currentFloorId) || floorPlan.floors[0];
  }, [currentFloorId, floorPlan]);

  // Maintain dragged seats state per floor
  const [floorSeats, setFloorSeats] = useState<Record<string, Seat[]>>({});
  const [floorZones, setFloorZones] = useState<Record<string, import("@/types").Zone[]>>({});

  useEffect(() => {
    if (activeFloor && !floorSeats[currentFloorId]) {
      setFloorSeats(prev => ({ ...prev, [currentFloorId]: activeFloor.seats }));
    }
    if (activeFloor && !floorZones[currentFloorId]) {
      setFloorZones(prev => ({ ...prev, [currentFloorId]: activeFloor.zones }));
    }
  }, [currentFloorId, activeFloor, floorSeats, floorZones]);

  const seats = activeFloor ? (floorSeats[currentFloorId] || activeFloor.seats) : [];
  const zones = activeFloor ? (floorZones[currentFloorId] || activeFloor.zones) : [];

  const handleSeatsUpdate = useCallback((newSeats: Seat[]) => {
    setFloorSeats(prev => ({ ...prev, [currentFloorId]: newSeats }));
  }, [currentFloorId]);

  const handleZonesUpdate = useCallback((newZones: import("@/types").Zone[]) => {
    setFloorZones(prev => ({ ...prev, [currentFloorId]: newZones }));
  }, [currentFloorId]);

  const handleSaveLayout = useCallback(() => {
    if (!floorPlan) return;
    const updatedFloors = floorPlan.floors.map((f) => {
      if (f.id === currentFloorId) {
        return {
          ...f,
          seats: floorSeats[currentFloorId] || f.seats,
          zones: floorZones[currentFloorId] || f.zones,
        };
      }
      return f;
    });
    saveFloorPlan(branchId, { ...floorPlan, floors: updatedFloors });
    toast.success("Floor layout saved successfully!");
    setIsEditMode(false);
  }, [floorPlan, currentFloorId, floorSeats, floorZones, saveFloorPlan, branchId]);

  const [selectedSeat, setSelectedSeat] = useState<Seat | null>(null);
  const [visibleCategories, setVisibleCategories] = useState<Set<ZoneCategory>>(
    () => new Set(ALL_CATEGORIES),
  );

  // Reset selected seat when floor changes
  useEffect(() => {
    setSelectedSeat(null);
  }, [currentFloorId]);

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

  const mapFloorsForControls = useMemo(() => {
    if (!floorPlan) return [];
    return floorPlan.floors.map((f: Floor) => ({
      id: f.id,
      name: f.name,
      level: f.level,
      seatCount: f.seats.length
    }));
  }, [floorPlan]);

  const handleBranchChange = useCallback(
    (id: string) => {
      onBranchChange(id);
      setActiveFloorId(null);
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
      setFloorSeats((prev) => {
        const currSeats = prev[currentFloorId] || activeFloor.seats;
        return {
          ...prev,
          [currentFloorId]: currSeats.map((s: Seat) =>
            s.id === seatId
              ? { ...s, status: "occupied" as const, memberId: `m-ob-${Date.now()}` }
              : s,
          ),
        };
      });

      // 3. Toast
      toast.success(`${payload.name} onboarded to seat ${selectedSeat?.code || seatId}`, {
        description: `${payload.planType} plan · ₹${(payload.monthlyFee / 1000).toFixed(0)}k/mo`,
      });
    },
    [onboardMember, selectedSeat, currentFloorId, activeFloor.seats],
  );

  if (!floorPlan || !activeFloor) return null;

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
        floors={mapFloorsForControls}
        activeFloorId={currentFloorId}
        onFloorChange={setActiveFloorId}
        isEditMode={isEditMode}
        onToggleEditMode={() => {
          if (isEditMode && activeFloor) {
            // Revert to saved state
            setFloorZones(prev => ({ ...prev, [currentFloorId]: activeFloor.zones }));
            setFloorSeats(prev => ({ ...prev, [currentFloorId]: activeFloor.seats }));
          }
          setIsEditMode(prev => !prev);
        }}
        onSaveLayout={handleSaveLayout}
      />

      <div className="flex flex-1 min-h-0 gap-0 relative">
        <AnimatePresence>
          {isEditMode && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 280, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden flex-shrink-0 z-10 border-r border-cs-gray-200"
            >
              <DesignerSidebar
                onAddComponent={(type) => {
                  if (!activeFloor) return;
                  const { zone, seats: newSeats } = buildDesignerComponent(
                    type,
                    branchId,
                    activeFloor?.canvasWidth ? activeFloor.canvasWidth / 2 : 400,
                    activeFloor?.canvasHeight ? activeFloor.canvasHeight / 2 : 300,
                    seats.length
                  );
                  handleZonesUpdate([...zones, zone]);
                  handleSeatsUpdate([...seats, ...newSeats]);
                  toast.success(`Added ${zone.name}`);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentFloorId}
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="flex-1 min-h-0 flex"
          >
            <MapContainer
              zones={zones}
              seats={seats}
              canvasWidth={activeFloor?.canvasWidth || 800}
              canvasHeight={activeFloor?.canvasHeight || 600}
              branchName={floorPlan.branchName}
              address={floorPlan.address}
              selectedSeat={selectedSeat}
              onSeatSelect={handleSeatSelect}
              onSeatsUpdate={handleSeatsUpdate}
              onZonesUpdate={handleZonesUpdate}
              controlsRef={controlsRef}
              visibleCategories={visibleCategories}
              floorName={activeFloor?.name}
              isEditMode={isEditMode}
            />
          </motion.div>
        </AnimatePresence>

        <AnimatePresence>
          {selectedSeat && !isEditMode && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 320, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="overflow-hidden flex-shrink-0 z-10"
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
