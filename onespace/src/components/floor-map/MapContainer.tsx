"use client";

import React, { useState, useRef, useCallback, useMemo } from "react";
import { TransformWrapper, TransformComponent, useControls } from "react-zoom-pan-pinch";
import { Seat } from "@/types";
import { Zone } from "@/lib/data/floor-plan";
import { SeatNode } from "./SeatNode";

interface MapContainerProps {
  zones: Zone[];
  seats: Seat[];
  selectedSeat: Seat | null;
  onSeatSelect: (seat: Seat) => void;
  onSeatsUpdate: (seats: Seat[]) => void;
  controlsRef: React.MutableRefObject<{ zoomIn: () => void; zoomOut: () => void; resetTransform: () => void } | null>;
}

function ControlsBridge({ controlsRef }: { controlsRef: React.MutableRefObject<any> }) {
  const controls = useControls();
  React.useEffect(() => {
    controlsRef.current = controls;
  }, [controls, controlsRef]);
  return null;
}

export function MapContainer({
  zones,
  seats,
  selectedSeat,
  onSeatSelect,
  onSeatsUpdate,
  controlsRef,
}: MapContainerProps) {
  const [scale, setScale] = useState(1);

  const handleDragEnd = useCallback(
    (seatId: string, dx: number, dy: number) => {
      const updated = seats.map((s) =>
        s.id === seatId ? { ...s, x: Math.round(s.x + dx), y: Math.round(s.y + dy) } : s
      );
      onSeatsUpdate(updated);
    },
    [seats, onSeatsUpdate]
  );

  // Calculate canvas bounds from zones
  const canvasWidth = 860;
  const canvasHeight = 580;

  return (
    <div className="flex-1 bg-white rounded-xl border border-cs-gray-200 overflow-hidden relative shadow-sm">
      {/* Grid pattern background */}
      <TransformWrapper
        initialScale={1}
        minScale={0.5}
        maxScale={3}
        centerOnInit
        onTransform={(ref) => setScale(ref.state.scale)}
        panning={{ excluded: [] }}
        wheel={{ step: 0.08 }}
      >
        <ControlsBridge controlsRef={controlsRef} />
        <TransformComponent
          wrapperStyle={{ width: "100%", height: "100%" }}
          contentStyle={{ width: canvasWidth, height: canvasHeight }}
        >
          <svg
            width={canvasWidth}
            height={canvasHeight}
            viewBox={`0 0 ${canvasWidth} ${canvasHeight}`}
            className="select-none"
          >
            {/* Background grid pattern */}
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#F1F5F9" strokeWidth="0.5" />
              </pattern>
              <pattern id="grid-large" width="100" height="100" patternUnits="userSpaceOnUse">
                <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#E2E8F0" strokeWidth="0.8" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
            <rect width="100%" height="100%" fill="url(#grid-large)" />

            {/* Outer wall */}
            <rect
              x={12}
              y={12}
              width={canvasWidth - 24}
              height={canvasHeight - 24}
              rx={8}
              fill="none"
              stroke="#CBD5E1"
              strokeWidth={2}
              strokeDasharray="none"
            />

            {/* Zones */}
            {zones.map((zone) => (
              <g key={zone.id}>
                {/* Zone background */}
                <rect
                  x={zone.x}
                  y={zone.y}
                  width={zone.width}
                  height={zone.height}
                  rx={8}
                  fill={zone.color}
                  stroke="#D1D5DB"
                  strokeWidth={0.8}
                  opacity={0.6}
                />
                {/* Zone label */}
                <text
                  x={zone.x + 10}
                  y={zone.y + 16}
                  fill="#6B7280"
                  fontSize={10}
                  fontWeight={600}
                  fontFamily="Inter, sans-serif"
                  style={{ userSelect: "none" }}
                >
                  {zone.label}
                </text>

                {/* Zone type icon markers */}
                {zone.type === "reception" && (
                  <text x={zone.x + zone.width - 24} y={zone.y + 16} fontSize={12}>🏢</text>
                )}
                {zone.type === "pantry" && (
                  <text x={zone.x + zone.width - 24} y={zone.y + 16} fontSize={12}>☕</text>
                )}
                {zone.type === "lounge" && (
                  <text x={zone.x + zone.width - 24} y={zone.y + 16} fontSize={12}>🛋️</text>
                )}
                {zone.type === "conference" && (
                  <text x={zone.x + zone.width - 24} y={zone.y + 16} fontSize={12}>📋</text>
                )}
                {zone.type === "phone_booth" && (
                  <text x={zone.x + zone.width - 24} y={zone.y + 16} fontSize={12}>📞</text>
                )}
                {zone.type === "cabin" && zone.id === "z-mgr" && (
                  <text x={zone.x + zone.width - 24} y={zone.y + 16} fontSize={12}>👔</text>
                )}
              </g>
            ))}

            {/* Wall details - doors */}
            {/* Main entrance */}
            <line x1={20} y1={60} x2={20} y2={90} stroke="#22C55E" strokeWidth={4} strokeLinecap="round" />
            <text x={6} y={78} fontSize={8} fill="#22C55E" fontWeight={700} writingMode="tb" fontFamily="Inter">▶</text>

            {/* Internal doors between zones */}
            <line x1={300} y1={180} x2={300} y2={200} stroke="#94A3B8" strokeWidth={3} strokeLinecap="round" />
            <line x1={300} y1={360} x2={300} y2={380} stroke="#94A3B8" strokeWidth={3} strokeLinecap="round" />

            {/* Seats */}
            {seats.map((seat) => (
              <SeatNode
                key={seat.id}
                seat={seat}
                isSelected={selectedSeat?.id === seat.id}
                onSelect={onSeatSelect}
                onDragEnd={handleDragEnd}
                scale={scale}
              />
            ))}

            {/* Floor label watermark */}
            <text
              x={canvasWidth / 2}
              y={canvasHeight - 8}
              textAnchor="middle"
              fill="#D1D5DB"
              fontSize={10}
              fontFamily="Inter, sans-serif"
              fontWeight={500}
            >
              CS Coworking — Floor Plan (Drag seats to reposition)
            </text>
          </svg>
        </TransformComponent>
      </TransformWrapper>
    </div>
  );
}
