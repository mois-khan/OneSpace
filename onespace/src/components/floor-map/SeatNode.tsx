"use client";

import React, { useState, useCallback } from "react";
import { Seat } from "@/types";
import { getMemberDisplayInfo } from "@/lib/data/floor-plan";

interface SeatNodeProps {
  seat: Seat;
  isSelected: boolean;
  onSelect: (seat: Seat) => void;
  onDragEnd?: (seatId: string, dx: number, dy: number) => void;
  scale: number;
}

const statusColors: Record<Seat["status"], { bg: string; border: string; text: string; glow: string }> = {
  available: { bg: "#DCFCE7", border: "#86EFAC", text: "#15803D", glow: "#22C55E" },
  occupied: { bg: "#FEE2E2", border: "#FCA5A5", text: "#B91C1C", glow: "#EF4444" },
  reserved: { bg: "#FEF3C7", border: "#FCD34D", text: "#92400E", glow: "#F59E0B" },
  maintenance: { bg: "#F3F4F6", border: "#D1D5DB", text: "#6B7280", glow: "#9CA3AF" },
};

// Small SVG icons for seat status (12x12 viewBox)
const statusIcons: Record<Seat["status"], string> = {
  available: "M5 12l5 5L20 7",  // check
  occupied: "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4-4v2", // user
  reserved: "M12 8v4l3 3M21 12a9 9 0 11-18 0 9 9 0 0118 0z", // clock
  maintenance: "M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z", // wrench
};

export function SeatNode({ seat, isSelected, onSelect, onDragEnd, scale }: SeatNodeProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [isHovered, setIsHovered] = useState(false);
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
      onMouseUp={handleMouseUp}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); }}
      style={{ cursor: isDragging ? "grabbing" : "pointer" }}
    >
      {/* Selection glow ring */}
      {isSelected && (
        <rect
          x={-3} y={-3}
          width={seatW + 6}
          height={seatH + 6}
          rx={isRoom ? 9 : 7}
          fill="none"
          stroke="#E8192C"
          strokeWidth={2}
          opacity={0.5}
        >
          <animate attributeName="opacity" values="0.5;0.2;0.5" dur="2s" repeatCount="indefinite" />
        </rect>
      )}

      {/* Hover glow */}
      {isHovered && !isSelected && (
        <rect
          x={-2} y={-2}
          width={seatW + 4}
          height={seatH + 4}
          rx={isRoom ? 8 : 6}
          fill="none"
          stroke={colors.glow}
          strokeWidth={1.5}
          opacity={0.4}
        />
      )}

      {/* Seat body */}
      <rect
        width={seatW}
        height={seatH}
        rx={isRoom ? 6 : 4}
        ry={isRoom ? 6 : 4}
        fill={colors.bg}
        stroke={isSelected ? "#E8192C" : colors.border}
        strokeWidth={isSelected ? 2 : 1}
        style={{
          transition: "all 0.15s ease",
          filter: isDragging ? "drop-shadow(0 3px 6px rgba(0,0,0,0.2))" : "none",
        }}
      />

      {/* Inner shine highlight */}
      <rect
        x={1} y={1}
        width={seatW - 2}
        height={seatH / 2.5}
        rx={isRoom ? 5 : 3}
        fill="#fff"
        opacity={0.35}
      />

      {/* Seat code label */}
      <text
        x={seatW / 2}
        y={seatH / 2 + (isRoom ? 1 : 0.5)}
        textAnchor="middle"
        dominantBaseline="central"
        fill={colors.text}
        fontSize={isRoom ? 8.5 : 7}
        fontWeight={700}
        fontFamily="Inter, sans-serif"
        letterSpacing="0.03em"
        style={{ pointerEvents: "none", userSelect: "none" }}
      >
        {seat.code}
      </text>

      {/* Status indicator dot (top-right) */}
      <circle
        cx={seatW - 5}
        cy={5}
        r={3}
        fill={colors.glow}
        stroke="#fff"
        strokeWidth={1.2}
      >
        {seat.status === "occupied" && (
          <animate attributeName="r" values="3;3.5;3" dur="3s" repeatCount="indefinite" />
        )}
      </circle>

      {/* Hover Tooltip */}
      {isHovered && (
        <g transform={`translate(${seatW / 2}, ${-8})`}>
          <rect
            x={-72}
            y={memberInfo ? -48 : -32}
            width={144}
            height={memberInfo ? 46 : 30}
            rx={8}
            fill="#0D1B2A"
            opacity={0.94}
          />
          {/* Tooltip arrow */}
          <polygon points="-5,0 5,0 0,5" fill="#0D1B2A" opacity={0.94} />

          <text
            x={0}
            y={memberInfo ? -34 : -14}
            textAnchor="middle"
            fill="#fff"
            fontSize={9}
            fontWeight={700}
            fontFamily="Inter, sans-serif"
          >
            {seat.code}
          </text>
          <text
            x={0}
            y={memberInfo ? -22 : -4}
            textAnchor="middle"
            fill="#94A3B8"
            fontSize={7.5}
            fontFamily="Inter, sans-serif"
          >
            {seat.status.charAt(0).toUpperCase() + seat.status.slice(1)}
          </text>
          {memberInfo && (
            <>
              <line x1={-50} y1={-16} x2={50} y2={-16} stroke="#334155" strokeWidth={0.5} />
              <text
                x={0}
                y={-6}
                textAnchor="middle"
                fill="#E2E8F0"
                fontSize={8}
                fontWeight={600}
                fontFamily="Inter, sans-serif"
              >
                {memberInfo.name}
              </text>
            </>
          )}
        </g>
      )}
    </g>
  );
}
