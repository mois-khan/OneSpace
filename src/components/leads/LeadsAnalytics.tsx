"use client";

import { useMemo } from "react";
import { Lead } from "@/types";
import { formatCurrency } from "@/lib/utils";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

interface LeadsAnalyticsProps {
  leads: Lead[];
}

export function LeadsAnalytics({ leads }: LeadsAnalyticsProps) {
  const stats = useMemo(() => {
    let totalValue = 0;
    const sourceMap: Record<string, { total: number; won: number; value: number }> = {};
    const funnelMap = {
      new: 0,
      contacted: 0,
      toured: 0,
      proposal: 0,
      negotiating: 0,
      won: 0,
    };

    leads.forEach((l) => {
      // Accumulate value for open/won leads
      if (l.stage !== "lost") {
        totalValue += (l.mrr || 0) * 12; // Annualized pipeline value
      }

      // Funnel
      if (l.stage !== "lost") {
        if (l.stage === "new" && (!l.interactions || l.interactions.length === 0)) funnelMap.new++;
        else if (l.stage === "new" || l.stage === "toured" || l.stage === "proposal" || l.stage === "negotiating" || l.stage === "won") funnelMap.contacted++;
        
        if (l.stage === "toured" || l.stage === "proposal" || l.stage === "negotiating" || l.stage === "won") funnelMap.toured++;
        if (l.stage === "proposal" || l.stage === "negotiating" || l.stage === "won") funnelMap.proposal++;
        if (l.stage === "negotiating" || l.stage === "won") funnelMap.negotiating++;
        if (l.stage === "won") funnelMap.won++;
      }

      // Sources
      if (!sourceMap[l.source]) {
        sourceMap[l.source] = { total: 0, won: 0, value: 0 };
      }
      sourceMap[l.source].total++;
      if (l.stage === "won") {
        sourceMap[l.source].won++;
        sourceMap[l.source].value += (l.mrr || 0) * 12;
      }
    });

    const sourceData = Object.entries(sourceMap)
      .map(([name, data]) => ({
        name,
        volume: data.total,
        conversion: data.total > 0 ? Math.round((data.won / data.total) * 100) : 0,
        revenue: data.value,
      }))
      .sort((a, b) => b.volume - a.volume);

    const funnelData = [
      { name: "New", value: funnelMap.new, max: funnelMap.new },
      { name: "Contacted", value: funnelMap.contacted, max: funnelMap.new },
      { name: "Toured", value: funnelMap.toured, max: funnelMap.new },
      { name: "Proposal", value: funnelMap.proposal, max: funnelMap.new },
      { name: "Negotiating", value: funnelMap.negotiating, max: funnelMap.new },
      { name: "Won", value: funnelMap.won, max: funnelMap.new },
    ];

    return { totalValue, sourceData, funnelData };
  }, [leads]);

  return (
    <div className="h-full overflow-y-auto p-6">
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="bg-white border border-cs-gray-200 rounded-lg p-4 shadow-sm">
          <div className="text-sm text-cs-gray-500 mb-1">Total Pipeline Value</div>
          <div className="text-2xl font-bold font-heading">{formatCurrency(stats.totalValue)}</div>
        </div>
        <div className="bg-white border border-cs-gray-200 rounded-lg p-4 shadow-sm">
          <div className="text-sm text-cs-gray-500 mb-1">Top Source (Volume)</div>
          <div className="text-2xl font-bold font-heading">{stats.sourceData[0]?.name || "-"}</div>
        </div>
        <div className="bg-white border border-cs-gray-200 rounded-lg p-4 shadow-sm">
          <div className="text-sm text-cs-gray-500 mb-1">Best Conversion</div>
          <div className="text-2xl font-bold font-heading text-status-green">
            {[...stats.sourceData].sort((a, b) => b.conversion - a.conversion)[0]?.name || "-"}
          </div>
        </div>
        <div className="bg-white border border-cs-gray-200 rounded-lg p-4 shadow-sm">
          <div className="text-sm text-cs-gray-500 mb-1">Avg. Conversion Time</div>
          <div className="text-2xl font-bold font-heading">14 days</div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6 mb-6">
        {/* Source Volume & Conversion */}
        <div className="bg-white border border-cs-gray-200 rounded-lg p-5 shadow-sm">
          <h3 className="text-sm font-semibold mb-4 text-cs-black">Source Performance</h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.sourceData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#6B7280" }} />
                <YAxis yAxisId="left" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#6B7280" }} />
                <YAxis yAxisId="right" orientation="right" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#E8192C" }} />
                <Tooltip
                  contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                  cursor={{ fill: "#F3F4F6" }}
                />
                <Bar yAxisId="left" dataKey="volume" name="Leads" fill="#0D1B2A" radius={[4, 4, 0, 0]} />
                <Bar yAxisId="right" dataKey="conversion" name="Conversion %" fill="#E8192C" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Revenue by Source */}
        <div className="bg-white border border-cs-gray-200 rounded-lg p-5 shadow-sm">
          <h3 className="text-sm font-semibold mb-4 text-cs-black">Annualized Revenue by Source</h3>
          <div className="h-[280px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.sourceData} layout="vertical" margin={{ top: 10, right: 20, left: 20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#E5E7EB" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: "#6B7280" }} width={80} />
                <Tooltip
                  contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
                  formatter={(value: any) => formatCurrency(Number(value) || 0)}
                  cursor={{ fill: "#F3F4F6" }}
                />
                <Bar dataKey="revenue" name="Revenue" radius={[0, 4, 4, 0]}>
                  {stats.sourceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? "#E8192C" : "#0D1B2A"} opacity={index === 0 ? 1 : 0.8} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
