import React from "react";
import { Member } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { AlertTriangle, Clock, TrendingDown } from "lucide-react";

interface RenewalKPIsProps {
  members: Member[];
}

export function RenewalKPIs({ members }: RenewalKPIsProps) {
  const highRisk = members.filter(m => (m.riskScore || 0) >= 70);
  const mediumRisk = members.filter(m => (m.riskScore || 0) >= 40 && (m.riskScore || 0) < 70);
  
  const now = new Date().getTime();
  const expiring = members.filter(m => {
    const end = new Date(m.contractEnd).getTime();
    const daysLeft = (end - now) / (1000 * 60 * 60 * 24);
    return daysLeft > 0 && daysLeft <= 30;
  });

  const getMRR = (list: Member[]) => list.reduce((sum, m) => sum + m.monthlyFee, 0);

  const cards = [
    {
      title: "High Risk (70+)",
      count: highRisk.length,
      mrr: getMRR(highRisk),
      icon: TrendingDown,
      color: "text-red-600",
      bg: "bg-red-100",
      border: "border-red-200",
      cta: "Act Now"
    },
    {
      title: "Medium Risk (40-69)",
      count: mediumRisk.length,
      mrr: getMRR(mediumRisk),
      icon: AlertTriangle,
      color: "text-amber-600",
      bg: "bg-amber-100",
      border: "border-amber-200",
    },
    {
      title: "Expiring <30 Days",
      count: expiring.length,
      mrr: getMRR(expiring),
      icon: Clock,
      color: "text-blue-600",
      bg: "bg-blue-100",
      border: "border-blue-200",
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
      {cards.map((card, i) => (
        <div key={i} className="bg-white rounded-xl border border-cs-gray-200 p-5 flex flex-col hover:shadow-md transition-shadow relative overflow-hidden">
          {card.title.includes("High Risk") && (
            <div className="absolute top-0 left-0 right-0 h-1 bg-cs-red" />
          )}
          
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-sm font-semibold text-cs-gray-500 uppercase tracking-wider mb-1">{card.title}</p>
              <h3 className="text-3xl font-bold font-heading text-cs-black flex items-end gap-2">
                {card.count} <span className="text-sm font-medium text-cs-gray-500 mb-1">members</span>
              </h3>
            </div>
            <div className={`w-12 h-12 rounded-full ${card.bg} border ${card.border} flex items-center justify-center`}>
              <card.icon className={`w-6 h-6 ${card.color}`} />
            </div>
          </div>

          <div className="mt-auto pt-4 border-t border-cs-gray-100 flex items-center justify-between">
            <div>
              <p className="text-xs text-cs-gray-500">MRR at stake</p>
              <p className="font-semibold text-cs-black">{formatCurrency(card.mrr)}</p>
            </div>
            {card.cta && (
              <button className="px-3 py-1.5 bg-cs-red text-white text-xs font-semibold rounded-md hover:bg-cs-red-dark transition-colors shadow-sm">
                {card.cta}
              </button>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
