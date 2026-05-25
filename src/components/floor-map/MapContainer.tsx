"use client";

import React, { useState, useCallback } from "react";
import { TransformWrapper, TransformComponent, useControls } from "react-zoom-pan-pinch";
import { Seat } from "@/types";
import { Zone, zoneIcons } from "@/lib/data/floor-plan";
import { SeatNode } from "./SeatNode";

interface MapContainerProps {
  zones: Zone[];
  seats: Seat[];
  canvasWidth: number;
  canvasHeight: number;
  branchName: string;
  address: string;
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

// Premium SVG icon renderer — uses <path> with scale transform (no nested <svg>)
function ZoneIcon({ type, x, y }: { type: Zone["type"]; x: number; y: number }) {
  const path = zoneIcons[type];
  if (!path) return null;
  return (
    <g transform={`translate(${x}, ${y})`}>
      <rect x={-2} y={-2} width={18} height={18} rx={4} fill="#fff" opacity={0.75} />
      <g transform="scale(0.583)">
        <path d={path} fill="none" stroke="#6B7280" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </g>
  );
}

// Decorative furniture elements for non-seat zones
function ZoneDecoration({ zone }: { zone: Zone }) {
  const cx = zone.x + zone.width / 2;
  const cy = zone.y + zone.height / 2 + 6;

  if (zone.type === "conference") {
    // Conference table
    const tw = Math.min(zone.width * 0.55, 80);
    const th = Math.min(zone.height * 0.35, 30);
    return (
      <g opacity={0.25}>
        <rect x={cx - tw / 2} y={cy - th / 2} width={tw} height={th} rx={th / 2} fill="#9CA3AF" stroke="#6B7280" strokeWidth={0.6} />
      </g>
    );
  }
  if (zone.type === "lounge") {
    // L-shaped couch
    return (
      <g opacity={0.2}>
        <rect x={zone.x + 12} y={cy - 8} width={zone.width * 0.5} height={16} rx={4} fill="#818CF8" stroke="#6366F1" strokeWidth={0.5} />
        <rect x={zone.x + 12} y={cy + 8} width={20} height={20} rx={4} fill="#818CF8" stroke="#6366F1" strokeWidth={0.5} />
        {/* Coffee table */}
        <circle cx={zone.x + zone.width * 0.65} cy={cy + 4} r={8} fill="#D1D5DB" stroke="#9CA3AF" strokeWidth={0.5} />
      </g>
    );
  }
  if (zone.type === "reception") {
    // Reception desk (curved)
    const dw = Math.min(zone.width * 0.6, 100);
    return (
      <g opacity={0.2}>
        <path
          d={`M${cx - dw / 2},${cy + 10} Q${cx},${cy - 16} ${cx + dw / 2},${cy + 10}`}
          fill="none" stroke="#78716C" strokeWidth={3} strokeLinecap="round"
        />
        {/* Chair behind desk */}
        <circle cx={cx} cy={cy + 18} r={5} fill="#A8A29E" stroke="#78716C" strokeWidth={0.5} />
      </g>
    );
  }
  if (zone.type === "pantry") {
    // Counter + sink circle
    return (
      <g opacity={0.2}>
        <rect x={zone.x + 10} y={cy - 4} width={zone.width - 20} height={10} rx={3} fill="#F59E0B" stroke="#D97706" strokeWidth={0.5} />
        <circle cx={zone.x + zone.width - 24} cy={cy + 1} r={4} fill="none" stroke="#D97706" strokeWidth={0.8} />
      </g>
    );
  }
  if (zone.type === "phone_booth") {
    // Small desk
    return (
      <g opacity={0.2}>
        <rect x={cx - 10} y={cy - 3} width={20} height={6} rx={2} fill="#6EE7B7" stroke="#34D399" strokeWidth={0.5} />
      </g>
    );
  }
  if (zone.type === "manager") {
    // L-desk + chair
    return (
      <g opacity={0.2}>
        <rect x={zone.x + 15} y={cy - 10} width={zone.width * 0.5} height={14} rx={2} fill="#FCA5A5" stroke="#F87171" strokeWidth={0.5} />
        <rect x={zone.x + 15} y={cy + 4} width={14} height={18} rx={2} fill="#FCA5A5" stroke="#F87171" strokeWidth={0.5} />
        <circle cx={zone.x + zone.width * 0.6} cy={cy + 14} r={5} fill="#FECACA" stroke="#F87171" strokeWidth={0.5} />
      </g>
    );
  }
  return null;
}

// Door swing arc indicator
function DoorArc({ x, y, radius, startAngle, endAngle, flip }: { x: number; y: number; radius: number; startAngle: number; endAngle: number; flip?: boolean }) {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const x1 = x + radius * Math.cos(toRad(startAngle));
  const y1 = y + radius * Math.sin(toRad(startAngle));
  const x2 = x + radius * Math.cos(toRad(endAngle));
  const y2 = y + radius * Math.sin(toRad(endAngle));
  return (
    <g opacity={0.3}>
      <path
        d={`M${x},${y} L${x1},${y1} A${radius},${radius} 0 0 ${flip ? 0 : 1} ${x2},${y2} Z`}
        fill="#CBD5E1"
        stroke="#94A3B8"
        strokeWidth={0.5}
      />
    </g>
  );
}

export function MapContainer({
  zones,
  seats,
  canvasWidth,
  canvasHeight,
  branchName,
  address,
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

  return (
    <div className="flex-1 rounded-xl border border-cs-gray-200 overflow-hidden relative shadow-sm" style={{ background: "linear-gradient(145deg, #FAFBFC 0%, #F1F5F9 100%)" }}>
      <TransformWrapper
        initialScale={1}
        minScale={0.4}
        maxScale={4}
        centerOnInit
        onTransform={(ref) => setScale(ref.state.scale)}
        panning={{ excluded: [] }}
        wheel={{ step: 0.06 }}
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
            {/* ──── DEFS ──── */}
            <defs>
              {/* Fine grid */}
              <pattern id="grid-sm" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#E8ECF1" strokeWidth="0.4" />
              </pattern>
              {/* Major grid */}
              <pattern id="grid-lg" width="100" height="100" patternUnits="userSpaceOnUse">
                <path d="M 100 0 L 0 0 0 100" fill="none" stroke="#D5DCE5" strokeWidth="0.6" />
              </pattern>
              {/* Drop shadow for zones */}
              <filter id="zone-shadow" x="-4%" y="-4%" width="108%" height="108%">
                <feDropShadow dx="0" dy="1" stdDeviation="2" floodOpacity="0.06" />
              </filter>
              {/* Glow for selected seat */}
              <filter id="seat-glow">
                <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#E8192C" floodOpacity="0.4" />
              </filter>
              {/* Entrance arrow marker */}
              <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="5" markerHeight="5" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#22C55E" />
              </marker>
            </defs>

            {/* ──── BACKGROUND ──── */}
            <rect width="100%" height="100%" fill="#FAFBFC" />
            <rect width="100%" height="100%" fill="url(#grid-sm)" />
            <rect width="100%" height="100%" fill="url(#grid-lg)" />

            {/* ──── OUTER WALL ──── */}
            <rect
              x={14} y={14}
              width={canvasWidth - 28}
              height={canvasHeight - 28}
              rx={10}
              fill="none"
              stroke="#94A3B8"
              strokeWidth={2.5}
            />
            {/* Wall inner shadow line */}
            <rect
              x={16} y={16}
              width={canvasWidth - 32}
              height={canvasHeight - 32}
              rx={9}
              fill="none"
              stroke="#CBD5E1"
              strokeWidth={0.8}
              strokeDasharray="4 4"
              opacity={0.5}
            />

            {/* ──── ENTRANCE ──── */}
            <line x1={14} y1={55} x2={14} y2={95} stroke="#22C55E" strokeWidth={5} strokeLinecap="round" />
            <line x1={2} y1={75} x2={14} y2={75} stroke="#22C55E" strokeWidth={1.5} markerEnd="url(#arrow)" />
            <text x={4} y={105} fontSize={7} fill="#22C55E" fontWeight={700} fontFamily="Inter, sans-serif" style={{ userSelect: "none" }}>
              ENTRY
            </text>

            {/* ──── ZONES ──── */}
            {zones.map((zone) => (
              <g key={zone.id}>
                {/* Zone background with shadow */}
                <rect
                  x={zone.x}
                  y={zone.y}
                  width={zone.width}
                  height={zone.height}
                  rx={10}
                  fill={zone.color}
                  stroke={zone.borderColor}
                  strokeWidth={1}
                  filter="url(#zone-shadow)"
                  opacity={0.85}
                />
                {/* Inner highlight */}
                <rect
                  x={zone.x + 1}
                  y={zone.y + 1}
                  width={zone.width - 2}
                  height={zone.height - 2}
                  rx={9}
                  fill="none"
                  stroke="#fff"
                  strokeWidth={0.8}
                  opacity={0.6}
                />

                {/* Zone label */}
                <text
                  x={zone.x + 28}
                  y={zone.y + 16}
                  fill="#374151"
                  fontSize={9.5}
                  fontWeight={600}
                  fontFamily="Inter, sans-serif"
                  letterSpacing="0.02em"
                  style={{ userSelect: "none" }}
                >
                  {zone.label}
                </text>

                {/* Premium SVG Icon */}
                <ZoneIcon type={zone.type} x={zone.x + 8} y={zone.y + 5} />

                {/* Decorative furniture */}
                <ZoneDecoration zone={zone} />
              </g>
            ))}

            {/* ──── INTERNAL WALLS ──── */}
            {/* Horizontal separator between top amenities and work areas */}
            {zones.length > 3 && (
              <line
                x1={20} y1={zones[0].y + zones[0].height + 10}
                x2={canvasWidth - 20} y2={zones[0].y + zones[0].height + 10}
                stroke="#CBD5E1"
                strokeWidth={0.6}
                strokeDasharray="6 3"
                opacity={0.5}
              />
            )}

            {/* ──── DOOR ARCS ──── */}
            {/* Entry door */}
            <DoorArc x={14} y={55} radius={12} startAngle={0} endAngle={90} />
            {/* Doors between amenity zones (approximate) */}
            {zones.length > 2 && (
              <>
                <DoorArc x={zones[0].x + zones[0].width} y={zones[0].y + zones[0].height - 10} radius={10} startAngle={-90} endAngle={0} />
                <DoorArc x={zones[1].x + zones[1].width} y={zones[1].y + zones[1].height - 10} radius={10} startAngle={-90} endAngle={0} />
              </>
            )}

            {/* ──── SEATS ──── */}
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

            {/* ──── WATERMARK ──── */}
            <text
              x={canvasWidth / 2}
              y={canvasHeight - 6}
              textAnchor="middle"
              fill="#CBD5E1"
              fontSize={9}
              fontFamily="Inter, sans-serif"
              fontWeight={500}
              letterSpacing="0.05em"
              style={{ userSelect: "none" }}
            >
              CS Coworking · {branchName} · {address}
            </text>
          </svg>
        </TransformComponent>
      </TransformWrapper>

      {/* Scale indicator */}
      <div className="absolute bottom-3 left-3 bg-white/80 backdrop-blur-sm border border-cs-gray-200 rounded-md px-2 py-1 text-[10px] font-mono text-cs-gray-500">
        {Math.round(scale * 100)}%
      </div>
    </div>
  );
}
