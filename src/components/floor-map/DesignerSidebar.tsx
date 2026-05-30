"use client";

import { Building2, Briefcase, Plus, Star } from "lucide-react";

export type ComponentType =
  | "open_desk"
  | "manager_cabin"
  | "cabin_3"
  | "cabin_6"
  | "cabin_8"
  | "cabin_10"
  | "business_suite_13";

interface DesignerSidebarProps {
  onAddComponent: (type: ComponentType) => void;
}

const PALETTE_ITEMS = [
  {
    category: "Open Seating",
    items: [
      { type: "open_desk", label: "Open Desk", icon: Briefcase, seats: 1, desc: "Flexible seating in open area" },
    ],
  },
  {
    category: "Premium Office",
    items: [
      { type: "manager_cabin", label: "Manager Cabin", icon: Star, seats: 1, desc: "Specialized individual cabin" },
      { type: "business_suite_13", label: "Business Suite (15-Seater)", icon: Building2, seats: 13, desc: "12 layout + 1 manager cabin" },
    ],
  },
  {
    category: "Private Cabins",
    items: [
      { type: "cabin_3", label: "Small Team", icon: Building2, seats: 3, desc: "3-seater private cabin" },
      { type: "cabin_6", label: "Standard Team", icon: Building2, seats: 6, desc: "6-seater private cabin" },
      { type: "cabin_8", label: "Mid Team", icon: Building2, seats: 8, desc: "8-seater private cabin" },
      { type: "cabin_10", label: "Large Team", icon: Building2, seats: 10, desc: "10-seater private cabin" },
    ],
  },
] as const;

export function DesignerSidebar({ onAddComponent }: DesignerSidebarProps) {
  return (
    <div className="w-[280px] h-full bg-white flex flex-col border-r border-cs-gray-200">
      <div className="p-4 border-b border-cs-gray-200 bg-cs-gray-50">
        <h2 className="text-sm font-bold text-cs-black flex items-center gap-2">
          <Edit3Icon /> Designer Palette
        </h2>
        <p className="text-xs text-cs-gray-500 mt-1">Click a component to add it to the center of the active floor.</p>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-5">
        {PALETTE_ITEMS.map((section) => (
          <div key={section.category} className="space-y-2">
            <h3 className="text-[10px] font-bold text-cs-gray-400 uppercase tracking-wider px-1">
              {section.category}
            </h3>
            <div className="grid grid-cols-1 gap-2">
              {section.items.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.type}
                    onClick={() => onAddComponent(item.type as ComponentType)}
                    className="flex items-start gap-3 p-2.5 rounded-lg border border-cs-gray-200 hover:border-cs-red/50 hover:bg-cs-red-bg/20 transition-all text-left group"
                  >
                    <div className="w-8 h-8 rounded-md bg-cs-gray-100 flex items-center justify-center text-cs-gray-500 group-hover:bg-white group-hover:text-cs-red shadow-sm transition-colors shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-semibold text-cs-black truncate">{item.label}</span>
                        <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-cs-gray-100 text-cs-gray-600">
                          {item.seats}s
                        </span>
                      </div>
                      <p className="text-[10px] text-cs-gray-500 mt-0.5 leading-tight">{item.desc}</p>
                    </div>
                    <div className="w-5 h-5 rounded-full border border-cs-gray-200 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-white">
                      <Plus className="w-3 h-3 text-cs-red" />
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Edit3Icon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z" />
    </svg>
  );
}
