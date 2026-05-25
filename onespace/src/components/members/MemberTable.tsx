import React from "react";
import { Member } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { MoreHorizontal } from "lucide-react";
import Link from "next/link";

interface MemberTableProps {
  members: Member[];
  getBranchName: (id: string) => string;
}

export function MemberTable({ members, getBranchName }: MemberTableProps) {
  const getInitials = (name: string) => name.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);

  return (
    <div className="bg-white border border-cs-gray-200 rounded-xl overflow-hidden shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-cs-gray-50 text-xs uppercase text-cs-gray-500 border-b border-cs-gray-200">
            <tr>
              <th className="px-6 py-4 font-semibold">Member</th>
              <th className="px-6 py-4 font-semibold">Branch</th>
              <th className="px-6 py-4 font-semibold">Plan</th>
              <th className="px-6 py-4 font-semibold">MRR</th>
              <th className="px-6 py-4 font-semibold">Contract End</th>
              <th className="px-6 py-4 font-semibold text-center">Risk</th>
              <th className="px-6 py-4 font-semibold text-center">Status</th>
              <th className="px-6 py-4 font-semibold"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-cs-gray-100">
            {members.map(member => {
              const riskScore = member.riskScore || 0;
              let badgeColor = "bg-green-100 text-green-700 border-green-200";
              if (riskScore >= 70) badgeColor = "bg-red-100 text-red-700 border-red-200";
              else if (riskScore >= 40) badgeColor = "bg-amber-100 text-amber-700 border-amber-200";

              return (
                <tr key={member.id} className="hover:bg-cs-gray-50/50 transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-cs-red-bg flex items-center justify-center text-cs-red font-bold text-xs border border-cs-red/20 flex-shrink-0">
                        {getInitials(member.name)}
                      </div>
                      <div>
                        <p className="font-semibold text-cs-black group-hover:text-cs-red transition-colors cursor-pointer">
                          <Link href={`/members/${member.id}`}>{member.name}</Link>
                        </p>
                        <p className="text-xs text-cs-gray-500">{member.company || "Independent"}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-cs-gray-600 font-medium">
                    {getBranchName(member.branchId)}
                  </td>
                  <td className="px-6 py-4 capitalize text-cs-gray-600">
                    {member.planType.replace("_", " ")}
                  </td>
                  <td className="px-6 py-4 font-medium text-cs-black">
                    {formatCurrency(member.monthlyFee)}
                  </td>
                  <td className="px-6 py-4 text-cs-gray-600">
                    {new Date(member.contractEnd).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className={`inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-bold border ${badgeColor} min-w-[36px]`}>
                      {riskScore}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-md text-xs font-medium bg-cs-gray-100 border border-cs-gray-200 text-cs-gray-700 capitalize">
                      {member.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-1.5 text-cs-gray-400 hover:text-cs-black hover:bg-cs-gray-100 rounded-md transition-colors">
                      <MoreHorizontal className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="px-6 py-4 border-t border-cs-gray-200 bg-cs-gray-50 flex items-center justify-between text-sm text-cs-gray-500">
        <p>Showing 1 to {members.length} of {members.length} entries</p>
      </div>
    </div>
  );
}
