"use client";

import { Card } from "@/components/ui/card";
import { formatCurrency, cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { branchOverviewData } from "@/lib/data/mock-charts";

export function BranchTable() {
  const router = useRouter();

  return (
    <Card className="col-span-2 overflow-hidden shadow-sm flex flex-col bg-white">
      <div className="flex items-center justify-between p-5 border-b border-cs-gray-100">
        <div className="flex items-center gap-3">
          <h3 className="font-semibold text-cs-black font-heading">Branch Overview</h3>
          <span className="bg-cs-gray-100 text-cs-gray-700 text-xs font-semibold px-2.5 py-0.5 rounded-full">
            {branchOverviewData.length} Branches
          </span>
        </div>
      </div>
      
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-sm text-left">
          <thead className="text-[12px] uppercase text-cs-gray-500 bg-cs-gray-50/50">
            <tr>
              <th className="px-5 py-3 font-semibold tracking-wider">Branch</th>
              <th className="px-5 py-3 font-semibold tracking-wider">Occupancy</th>
              <th className="px-5 py-3 font-semibold tracking-wider">Members</th>
              <th className="px-5 py-3 font-semibold tracking-wider">MRR</th>
              <th className="px-5 py-3 font-semibold tracking-wider">Overdue</th>
              <th className="px-5 py-3 font-semibold tracking-wider text-right">Health</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cs-gray-100">
            {branchOverviewData.map((branch) => (
              <tr 
                key={branch.id} 
                onClick={() => router.push(`/floor-map?branch=${branch.id}`)}
                className="hover:bg-cs-red-bg/30 transition-colors cursor-pointer group"
              >
                <td className="px-5 py-4 font-medium text-cs-black group-hover:text-cs-red transition-colors">
                  {branch.name}
                </td>
                <td className="px-5 py-4">
                  <div className="flex items-center gap-2">
                    <span className="w-9 font-medium">{branch.occupancy}%</span>
                    <div className="w-20 h-1.5 bg-cs-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-cs-red rounded-full" 
                        style={{ width: `${branch.occupancy}%` }}
                      ></div>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-4 text-cs-gray-700">{branch.members}</td>
                <td className="px-5 py-4 font-medium">{formatCurrency(branch.mrr)}</td>
                <td className="px-5 py-4 text-cs-gray-700">
                  {branch.overdue > 0 ? (
                    <span className="text-status-red font-medium">{branch.overdue}</span>
                  ) : "0"}
                </td>
                <td className="px-5 py-4 text-right">
                  <span className={cn(
                    "text-xs font-semibold px-2.5 py-1 rounded-full",
                    branch.health === "Healthy" ? "bg-green-100 text-green-700" :
                    branch.health === "Watch" ? "bg-amber-100 text-amber-700" :
                    "bg-red-100 text-red-700"
                  )}>
                    {branch.health === "Healthy" && "🟢 "}
                    {branch.health === "Watch" && "🟡 "}
                    {branch.health === "Action" && "🔴 "}
                    {branch.health}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
