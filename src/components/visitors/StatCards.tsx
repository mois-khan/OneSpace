import React from "react";
import { Visitor } from "@/types";
import { Users, UserCheck, UserMinus, AlertCircle } from "lucide-react";
import { useNow } from "@/lib/store";

interface StatCardsProps {
  visitors: Visitor[];
}

export function StatCards({ visitors }: StatCardsProps) {
  const now = useNow();
  const todayKey = new Date(now).toDateString();
  const todaysVisitors = visitors.filter((v) => new Date(v.checkInAt).toDateString() === todayKey);
  const currentlyInside = visitors.filter((v) => !v.checkOutAt);
  const checkedOut = visitors.filter((v) => v.checkOutAt);

  const overstaying = currentlyInside.filter((v) => {
    const hours = (now - new Date(v.checkInAt).getTime()) / (1000 * 60 * 60);
    return hours > 8;
  });

  const cards = [
    {
      title: "Today's Visitors",
      value: todaysVisitors.length,
      icon: Users,
      color: "text-blue-600",
      bg: "bg-blue-100",
      border: "border-blue-200",
    },
    {
      title: "Currently Inside",
      value: currentlyInside.length,
      icon: UserCheck,
      color: "text-green-600",
      bg: "bg-green-100",
      border: "border-green-200",
    },
    {
      title: "Checked Out",
      value: checkedOut.length,
      icon: UserMinus,
      color: "text-cs-gray-700",
      bg: "bg-cs-gray-100",
      border: "border-cs-gray-200",
    },
    {
      title: "Overstaying (>8h)",
      value: overstaying.length,
      icon: AlertCircle,
      color: overstaying.length > 0 ? "text-cs-red" : "text-amber-600",
      bg: overstaying.length > 0 ? "bg-red-100" : "bg-amber-100",
      border: overstaying.length > 0 ? "border-red-200" : "border-amber-200",
      alert: overstaying.length > 0,
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {cards.map((card, i) => (
        <div
          key={i}
          className={`bg-white rounded-xl border p-4 flex items-center justify-between ${
            card.alert ? "border-cs-red shadow-sm" : "border-cs-gray-200"
          }`}
        >
          <div>
            <p className="text-sm font-medium text-cs-gray-500 mb-1">{card.title}</p>
            <h3 className="text-2xl font-bold font-heading text-cs-black flex items-center gap-2 tabular-nums">
              {card.value}
              {card.alert && (
                <span className="text-[10px] uppercase font-bold bg-cs-red text-white px-2 py-0.5 rounded-full flex items-center">
                  Alert
                </span>
              )}
            </h3>
          </div>
          <div
            className={`w-12 h-12 rounded-full ${card.bg} border ${card.border} flex items-center justify-center`}
          >
            <card.icon className={`w-6 h-6 ${card.color}`} />
          </div>
        </div>
      ))}
    </div>
  );
}
