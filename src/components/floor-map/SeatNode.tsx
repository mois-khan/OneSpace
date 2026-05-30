"use client";

import React, { useState, useCallback, useMemo } from "react";
import { Seat } from "@/types";
import { useAllMembers } from "@/lib/store";
import { useAppState } from "@/lib/store/provider";

interface SeatNodeProps {
  seat: Seat;
  isSelected: boolean;
  onSelect: (seat: Seat) => void;
  onDragEnd?: (seatId: string, dx: number, dy: number) => void;
  scale: number;
  zoneType?: string;
}

const statusColors: Record<Seat["status"], { bg: string; border: string; text: string; glow: string }> = {
  available: { bg: "#DCFCE7", border: "#86EFAC", text: "#15803D", glow: "#22C55E" },
  occupied: { bg: "#FEE2E2", border: "#FCA5A5", text: "#B91C1C", glow: "#EF4444" },
  reserved: { bg: "#FEF3C7", border: "#FCD34D", text: "#92400E", glow: "#F59E0B" },
  maintenance: { bg: "#F3F4F6", border: "#D1D5DB", text: "#6B7280", glow: "#9CA3AF" },
};

export function SeatNode({ seat, isSelected, onSelect, onDragEnd, scale, zoneType }: SeatNodeProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [isHovered, setIsHovered] = useState(false);
  const colors = statusColors[seat.status];
  const allMembers = useAllMembers();
  const { invoices } = useAppState();

  const memberInfo = seat.memberId ? allMembers.find((m) => m.id === seat.memberId) : null;

  const isRoom = seat.code.startsWith("CONF") || seat.code.startsWith("PB");
  const seatW = seat.width;
  const seatH = seat.height;

  const paymentStatus = useMemo(() => {
    if (seat.status !== "occupied" || !seat.memberId) return null;
    const memberInvoices = invoices.filter(inv => inv.memberId === seat.memberId);
    if (memberInvoices.length === 0) return "pending";
    const sorted = [...memberInvoices].sort((a, b) => new Date(b.dueAt || 0).getTime() - new Date(a.dueAt || 0).getTime());
    return sorted[0].status;
  }, [invoices, seat.memberId, seat.status]);

  // Compute fake contract days left
  const contractDays = useMemo(() => {
    if (seat.status !== "occupied" || !seat.memberId) return 0;
    const seed = parseInt(seat.memberId.replace(/\D/g, "")) || 0;
    return (seed * 37) % 180 + 10;
  }, [seat.status, seat.memberId]);

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
      style={{ cursor: onDragEnd ? (isDragging ? "grabbing" : "grab") : "pointer" }}
      className={onDragEnd ? "panning-disabled" : ""}
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
          opacity={0.6}
        >
          <animate attributeName="opacity" values="0.6;0.4;0.6" dur="2s" repeatCount="indefinite" />
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

      {/* ──── Seat Geometry based on zoneType ──── */}
      {zoneType === "cabin" ? (
        <g>
          <rect
            width={seatW}
            height={seatH}
            rx={4}
            fill={colors.bg}
            stroke={isSelected ? "#E8192C" : colors.border}
            strokeWidth={isSelected ? 2 : 1.5}
            style={{
              transition: "all 0.15s ease",
              filter: isDragging ? "drop-shadow(0 3px 6px rgba(0,0,0,0.2))" : "none",
            }}
          />
          {/* Door notch gap effect */}
          <path
            d={`M 0 ${seatH - 6} L 0 ${seatH} L 10 ${seatH}`}
            fill="none"
            stroke="#fff"
            strokeWidth={2.5}
          />
        </g>
      ) : zoneType === "conference" ? (
        <g>
          <rect
            width={seatW}
            height={seatH}
            rx={6}
            fill={colors.bg}
            stroke={isSelected ? "#E8192C" : colors.border}
            strokeWidth={isSelected ? 2 : 1.5}
            style={{ filter: isDragging ? "drop-shadow(0 3px 6px rgba(0,0,0,0.2))" : "none" }}
          />
          <rect
            x={6}
            y={6}
            width={seatW - 12}
            height={seatH - 12}
            rx={3}
            fill="none"
            stroke={colors.border}
            strokeWidth={1}
            opacity={0.7}
          />
        </g>
      ) : zoneType === "phone_booth" ? (
        <g>
          <rect
            width={seatW}
            height={seatH}
            rx={2}
            fill={colors.bg}
            stroke={isSelected ? "#E8192C" : colors.border}
            strokeWidth={isSelected ? 2 : 2}
          />
          <circle cx={seatW/2} cy={seatH/2} r={seatW/4} fill="none" stroke={colors.border} strokeWidth={1} opacity={0.5} />
        </g>
      ) : zoneType === "manager" ? (
        <g>
          <defs>
            <linearGradient id={`grad-${seat.id}`} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor={colors.bg} />
              <stop offset="100%" stopColor="#fff" stopOpacity={0.6} />
            </linearGradient>
          </defs>
          <rect
            width={seatW}
            height={seatH}
            rx={4}
            fill={`url(#grad-${seat.id})`}
            stroke={isSelected ? "#E8192C" : colors.border}
            strokeWidth={isSelected ? 2 : 1}
          />
        </g>
      ) : (
        <g>
          <rect
            width={seatW}
            height={seatH}
            rx={3}
            fill={colors.bg}
            stroke={isSelected ? "#E8192C" : colors.border}
            strokeWidth={isSelected ? 2 : 1}
            style={{
              transition: "all 0.15s ease",
              filter: isDragging ? "drop-shadow(0 3px 6px rgba(0,0,0,0.2))" : "none",
            }}
          />
          {/* Chair bump */}
          <path
            d={`M ${seatW / 2 - 5} ${seatH} A 5 5 0 0 0 ${seatW / 2 + 5} ${seatH}`}
            fill={colors.border}
            opacity={0.5}
          />
        </g>
      )}

      {/* Inner shine highlight */}
      <rect
        x={1} y={1}
        width={seatW - 2}
        height={seatH / 2.5}
        rx={isRoom ? 5 : 3}
        fill="#fff"
        opacity={0.35}
        style={{ pointerEvents: "none" }}
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

      {/* Hover Tooltip — richer when occupied */}
      {isHovered && (
        <g>
          {(() => {
            const lines: Array<{ text: string; color: string; size: number; weight: number }> = [];
            lines.push({ text: seat.code, color: "#fff", size: 10, weight: 700 });
            lines.push({
              text: seat.status.charAt(0).toUpperCase() + seat.status.slice(1),
              color: "#94A3B8",
              size: 8.5,
              weight: 400,
            });
            if (memberInfo) {
              lines.push({ text: memberInfo.name, color: "#E2E8F0", size: 9.5, weight: 600 });
              const plan = memberInfo.planType.replace("_", " ");
              lines.push({
                text: `${plan} · ₹${(memberInfo.monthlyFee / 1000).toFixed(1)}k/mo`,
                color: "#94A3B8",
                size: 8.5,
                weight: 400,
              });
              if (memberInfo.company) {
                lines.push({
                  text: memberInfo.company,
                  color: "#94A3B8",
                  size: 8,
                  weight: 400,
                });
              }
              // Payment & Contract
              lines.push({
                text: `Payment: ${paymentStatus || "Unknown"}`,
                color: paymentStatus === "overdue" ? "#FCA5A5" : paymentStatus === "paid" ? "#86EFAC" : "#FCD34D",
                size: 8,
                weight: 500,
              });
              lines.push({
                text: `Contract: ${contractDays}d left`,
                color: contractDays < 30 ? "#FCA5A5" : "#94A3B8",
                size: 8,
                weight: 500,
              });
            }
            const rowH = 13;
            const padY = 10;
            const boxH = lines.length * rowH + padY;
            const isNearTop = seat.y < boxH + 20;
            const boxY = isNearTop ? 6 : -boxH - 6;
            const toolTipY = isNearTop ? seatH + 8 : -8;
            
            return (
              <g transform={`translate(${seatW / 2}, ${toolTipY})`}>
                <rect
                  x={-85}
                  y={boxY}
                  width={170}
                  height={boxH}
                  rx={8}
                  fill="#0D1B2A"
                  opacity={0.95}
                />
                <polygon 
                  points={isNearTop ? "-5,6 5,6 0,0" : "-5,-1 5,-1 0,4"} 
                  fill="#0D1B2A" 
                  opacity={0.95} 
                />
                {lines.map((l, i) => {
                  if (i === 2 && memberInfo) {
                    // Divider above the member name
                    return (
                      <g key={`g-${i}`}>
                        <line
                          x1={-68}
                          y1={boxY + padY / 2 + i * rowH - 3}
                          x2={68}
                          y2={boxY + padY / 2 + i * rowH - 3}
                          stroke="#334155"
                          strokeWidth={0.5}
                        />
                        <text
                          x={0}
                          y={boxY + padY / 2 + i * rowH + 6}
                          textAnchor="middle"
                          fill={l.color}
                          fontSize={l.size}
                          fontWeight={l.weight}
                          fontFamily="Inter, sans-serif"
                        >
                          {l.text}
                        </text>
                      </g>
                    );
                  }
                  return (
                    <text
                      key={`t-${i}`}
                      x={0}
                      y={boxY + padY / 2 + i * rowH + 6}
                      textAnchor="middle"
                      fill={l.color}
                      fontSize={l.size}
                      fontWeight={l.weight}
                      fontFamily="Inter, sans-serif"
                    >
                      {l.text}
                    </text>
                  );
                })}
              </g>
            );
          })()}
        </g>
      )}
    </g>
  );
}
