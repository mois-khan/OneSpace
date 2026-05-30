"use client";

import React, { useState, useCallback } from "react";
import { Zone } from "@/types";
import { zoneIcons } from "@/lib/data/floor-plan";
import { Trash2 } from "lucide-react";

interface ZoneNodeProps {
  zone: Zone;
  isEditMode: boolean;
  onDragEnd?: (zoneId: string, dx: number, dy: number) => void;
  onDelete?: (zoneId: string) => void;
  scale: number;
}

export function ZoneNode({ zone, isEditMode, onDragEnd, onDelete, scale }: ZoneNodeProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState<{ x: number; y: number } | null>(null);
  const [isSelected, setIsSelected] = useState(false);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (!isEditMode) return;
    e.stopPropagation();
    setIsDragging(true);
    setIsSelected(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  }, [isEditMode]);

  const handleMouseUp = useCallback((e: React.MouseEvent) => {
    if (!isEditMode) return;
    if (isDragging && dragStart && onDragEnd) {
      const dx = (e.clientX - dragStart.x) / scale;
      const dy = (e.clientY - dragStart.y) / scale;
      if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
        onDragEnd(zone.id, dx, dy);
      }
    }
    setIsDragging(false);
    setDragStart(null);
  }, [isDragging, dragStart, onDragEnd, scale, zone.id, isEditMode]);

  // Click away to deselect
  React.useEffect(() => {
    const handleGlobalClick = () => setIsSelected(false);
    if (isSelected) window.addEventListener("mousedown", handleGlobalClick);
    return () => window.removeEventListener("mousedown", handleGlobalClick);
  }, [isSelected]);

  const path = zoneIcons[zone.type as keyof typeof zoneIcons];

  return (
    <g
      transform={`translate(${zone.x}, ${zone.y})`}
      onMouseDown={handleMouseDown}
      onMouseUp={handleMouseUp}
      style={{ cursor: isEditMode ? (isDragging ? "grabbing" : "grab") : "default" }}
      className={isEditMode ? "panning-disabled" : ""}
    >
      <rect
        width={zone.width}
        height={zone.height}
        rx={10}
        fill={zone.color}
        stroke={isSelected ? "#E8192C" : zone.borderColor}
        strokeWidth={isSelected ? 3 : (zone.type === "cabin" ? 2 : 1)}
        filter="url(#zone-shadow)"
        opacity={0.85}
        strokeDasharray={isEditMode ? "4 4" : "none"}
      />
      <rect
        x={1}
        y={1}
        width={zone.width - 2}
        height={zone.height - 2}
        rx={9}
        fill="none"
        stroke="#fff"
        strokeWidth={0.8}
        opacity={0.6}
        style={{ pointerEvents: "none" }}
      />
      <text
        x={28}
        y={16}
        fill="#374151"
        fontSize={9.5}
        fontWeight={600}
        fontFamily="Inter, sans-serif"
        letterSpacing="0.02em"
        style={{ userSelect: "none", pointerEvents: "none" }}
      >
        {zone.label}
      </text>

      {path && (
        <g transform="translate(8, 5)" style={{ pointerEvents: "none" }}>
          <rect x={-2} y={-2} width={18} height={18} rx={4} fill="#fff" opacity={0.75} />
          <g transform="scale(0.583)">
            <path d={path} fill="none" stroke="#6B7280" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
          </g>
        </g>
      )}

      {/* Delete Button floating near the zone when selected in edit mode */}
      {isSelected && isEditMode && onDelete && (
        <g 
          transform={`translate(${zone.width - 15}, -15)`} 
          onClick={(e) => { e.stopPropagation(); onDelete(zone.id); }}
          style={{ cursor: "pointer" }}
        >
          <circle cx={10} cy={10} r={12} fill="#FEE2E2" stroke="#EF4444" strokeWidth={1.5} />
          <path d="M6 7H14M8 7V5C8 4.44772 8.44772 4 9 4H11C11.5523 4 12 4.44772 12 5V7M7 9V14C7 14.5523 7.44772 15 8 15H12C12.5523 15 13 14.5523 13 14V9" stroke="#EF4444" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </g>
      )}
    </g>
  );
}
