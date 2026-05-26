"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import { formatCurrency, cn } from "@/lib/utils";
import { useBranchPerformance } from "@/lib/store";
import { useBranchContext } from "@/lib/BranchContext";
import { useMemo } from "react";
import { ChevronRight } from "lucide-react";
import { Sparkline } from "./Sparkline";
import { SectionHeader } from "./SectionHeader";

export function BranchTable() {
  const { selectedBranchId } = useBranchContext();
  const allRows = useBranchPerformance();

  const filteredData = useMemo(() => {
    if (selectedBranchId === "all") return allRows;
    return allRows.filter((b) => b.id === selectedBranchId);
  }, [allRows, selectedBranchId]);

  return (
    <Card className="col-span-3 lg:col-span-2 bg-white p-5 flex flex-col min-h-[350px] shadow-[0_1px_2px_rgba(17,24,39,0.04)]">
      <SectionHeader
        eyebrow="Operations"
        title="Branch performance"
        description="Click a row to open its floor map"
      />

      <div className="flex-1 overflow-auto rounded-lg border border-cs-gray-100">
        <table className="w-full text-sm text-left">
          <thead className="text-[11px] text-cs-gray-500 bg-cs-gray-50/60 border-b border-cs-gray-100 sticky top-0 uppercase tracking-wider">
            <tr>
              <th className="px-4 py-2.5 font-semibold">Branch</th>
              <th className="px-4 py-2.5 font-semibold text-right">Members</th>
              <th className="px-4 py-2.5 font-semibold text-right">MRR</th>
              <th className="px-4 py-2.5 font-semibold text-right">Occupancy</th>
              <th className="px-4 py-2.5 font-semibold">14d trend</th>
              <th className="px-4 py-2.5 font-semibold text-right">Status</th>
              <th className="px-2 py-2.5"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cs-gray-100">
            {filteredData.map((branch) => (
              <tr key={branch.id} className="hover:bg-cs-red-bg/30 transition-colors group">
                <td className="px-4 py-3">
                  <Link
                    href={`/floor-map?branch=${branch.id}`}
                    className="font-medium text-cs-black group-hover:text-cs-red transition-colors"
                  >
                    {branch.name}
                  </Link>
                </td>
                <td className="px-4 py-3 text-right tabular-nums">{branch.members}</td>
                <td className="px-4 py-3 text-right tabular-nums font-medium">
                  {formatCurrency(branch.mrr)}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center justify-end gap-2">
                    <span className="w-9 text-right tabular-nums font-medium">
                      {branch.occupancy}%
                    </span>
                    <div className="w-20 h-1.5 bg-cs-gray-100 rounded-full overflow-hidden">
                      <div
                        className={cn(
                          "h-full rounded-full transition-all",
                          branch.occupancy >= 70
                            ? "bg-status-green"
                            : branch.occupancy >= 50
                            ? "bg-status-amber"
                            : "bg-status-red",
                        )}
                        style={{ width: `${branch.occupancy}%` }}
                      />
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 w-[120px]">
                  <div className="w-[100px]">
                    <Sparkline
                      data={branch.trend}
                      color={
                        branch.health === "Action"
                          ? "var(--status-red)"
                          : branch.health === "Watch"
                          ? "var(--status-amber)"
                          : "var(--status-green)"
                      }
                      height={28}
                      strokeWidth={1.5}
                    />
                  </div>
                </td>
                <td className="px-4 py-3 text-right">
                  <span
                    className={cn(
                      "text-[11px] font-semibold px-2 py-0.5 rounded-md inline-flex items-center gap-1",
                      branch.health === "Healthy"
                        ? "bg-[#16A34A1A] text-status-green"
                        : branch.health === "Watch"
                        ? "bg-[#D970061A] text-status-amber"
                        : "bg-[#DC26261A] text-status-red",
                    )}
                  >
                    <span
                      className={cn(
                        "w-1.5 h-1.5 rounded-full",
                        branch.health === "Healthy"
                          ? "bg-status-green"
                          : branch.health === "Watch"
                          ? "bg-status-amber"
                          : "bg-status-red",
                      )}
                    />
                    {branch.health}
                  </span>
                </td>
                <td className="px-2 py-3">
                  <Link
                    href={`/floor-map?branch=${branch.id}`}
                    className="text-cs-gray-300 group-hover:text-cs-red transition-colors"
                    aria-label={`View ${branch.name}`}
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
