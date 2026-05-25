"use client";

import React, { useState, useCallback } from "react";
import { Seat } from "@/types";
import { cn } from "@/lib/utils";
import { getMemberDisplayInfo } from "@/lib/data/floor-plan";

interface SeatNodeProps {
  seat: Seat;
  isSelected: boolean;
  onSelect: (seat: Seat) => void;
  onDragEnd?: (seatId: string, dx: number, dy: number) => void;
  scale: number;
}

const statusColors: Record<Seat["status"], { bg: string; border: string; text: string }> = {
  available: { bg: "#DCFCE7", border: "#22C55E", text: "#15803D" },
  occupied: { bg: "#FEE2E2", border: "#EF4444", text: "#B91C1C" },
  reserved: { bg: "#FEF3C7", border: "#F59E0B", text: "#92400E" },
  maintenance: { bg: "#F3F4F6", border: "#9CA3AF", text: "#6B7280" },
};

export function SeatNode({ seat, isSelected, onSelect, onDragEnd, scale }: SeatNodeProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [tooltip, setTooltip] = useState(false);
  const colors = statusColors[seat.status];

  const memberInfo = seat.memberId ? getMemberDisplayInfo(seat.memberId) : null;

  const isRoom = seat.code.startsWith("CONF") || seat.code.startsWith("PB");
  const seatW = seat.width;
  const seatH = seat.height;

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  }, []);

  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (!isDragging || !dragStart) return;
    // We handle dragging through the parent's state via onDragEnd
  }, [isDragging, dragStart]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (isDragging && dragStart && onDragEnd) {
      const dx = (e.clientX - dragStart.x) / scale;
      const dy = (e.clientY - dragStart.y) / scale;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        onDragEnd(seat.id, dx, dy);
      } else {
        onSelect(seat);
      }
    } else {
      onSelect(seat);
    }
    setIsDragging(false);
    setDragStart(null);
  }, [isDragging, dragStart, onDragEnd, scale, seat, onSelect]);

  return (
    <g
      transform={`translate(${seat.x}, ${seat.y})`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseEnter={() => setTooltip(true)}
      onMouseLeave={() => { setTooltip(false); }}
      style={{ cursor: isDragging ? "grabbing" : "pointer" }}
    >
      {/* Seat rectangle */}
      <rect
        width={seatW}
        height={seatH}
        rx={isRoom ? 6 : 4}
        ry={isRoom ? 6 : 4}
        fill={colors.bg}
        stroke={isSelected ? "#E8192C" : colors.border}
        strokeWidth={isSelected ? 2.5 : 1.2}
        className="transition-all duration-150"
        style={{
          filter: isSelected ? "drop-shadow(0 0 6px rgba(232,25,44,0.35))" : isDragging ? "drop-shadow(0 2px 6px rgba(0,0,0,0.25))" : "none",
        }}
      />

      {/* Seat label */}
      <text
        x={seatW / 2}
        y={seatH / 2 + 1}
        textAnchor="middle"
        dominantBaseline="central"
        fill={colors.text}
        fontSize={isRoom ? 9 : 7.5}
        fontWeight={600}
        fontFamily="Inter, sans-serif"
        style={{ pointerEvents: "none", userSelect: "none" }}
      >
        {seat.code}
      </text>

      {/* Occupancy dot */}
      {seat.status === "occupied" && !isRoom && (
        <circle
          cx={seatW - 4}
          cy={5}
          r={3.5}
          fill="#EF4444"
          stroke="#fff"
          strokeWidth={1}
        />
      )}

      {/* Tooltip */}
      {tooltip && (
        <g transform={`translate(${seatW / 2}, ${-12})`}>
          <rect
            x={-65}
            y={-38}
            width={130}
            height={memberInfo ? 36 : 24}
            rx={6}
            fill="#0D1B2A"
            opacity={0.92}
          />
          <text
            x={0}
            y={memberInfo ? -26 : -22}
            textAnchor="middle"
            fill="#fff"
            fontSize={9}
            fontWeight={600}
            fontFamily="Inter, sans-serif"
          >
            {seat.code} — {seat.status.charAt(0).toUpperCase() + seat.status.slice(1)}
          </text>
          {memberInfo && (
            <text
              x={0}
              y={-14}
              textAnchor="middle"
              fill="#94A3B8"
              fontSize={8}
              fontFamily="Inter, sans-serif"
            >
              {memberInfo.name} • {memberInfo.company}
            </text>
          )}
        </g>
      )}
    </g>
  );
}
