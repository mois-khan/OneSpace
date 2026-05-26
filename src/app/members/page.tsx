"use client";

import { useState, useMemo } from "react";
import { MemberCard } from "@/components/members/MemberCard";
import { Search, Filter, Plus, LayoutGrid, List } from "lucide-react";
import { MemberTable } from "@/components/members/MemberTable";
import { OnboardingWizard } from "@/components/members/OnboardingWizard";
import { useMembers, useBranches } from "@/lib/store";

export default function MembersPage() {
  const members = useMembers();
  const branches = useBranches();
  const [searchQuery, setSearchQuery] = useState("");
  const [planFilter, setPlanFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const q = searchQuery.toLowerCase();
      const matchesSearch =
        m.name.toLowerCase().includes(q) ||
        (m.company?.toLowerCase().includes(q) ?? false) ||
        m.email.toLowerCase().includes(q);
      const matchesPlan = planFilter === "all" || m.planType === planFilter;
      return matchesSearch && matchesPlan;
    });
  }, [searchQuery, members, planFilter]);

  const getBranchName = (id: string) => branches.find((b) => b.id === id)?.name || "Unknown";

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] animate-in fade-in duration-500 bg-cs-gray-50/30">
      <div className="bg-white border-b border-cs-gray-200 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold font-heading text-cs-black">Members</h1>
            <p className="text-sm text-cs-gray-500 mt-1">
              Manage {members.length} active member{members.length === 1 ? "" : "s"}
              {members.length !== 0 && " in the current scope"}.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-cs-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${
                  viewMode === "grid"
                    ? "bg-white shadow-sm text-cs-black"
                    : "text-cs-gray-500 hover:text-cs-black"
                }`}
              >
                <LayoutGrid className="w-4 h-4" />
                Grid
              </button>
              <button
                onClick={() => setViewMode("table")}
                className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${
                  viewMode === "table"
                    ? "bg-white shadow-sm text-cs-black"
                    : "text-cs-gray-500 hover:text-cs-black"
                }`}
              >
                <List className="w-4 h-4" />
                Table
              </button>
            </div>
            <button
              onClick={() => setIsOnboardingOpen(true)}
              className="bg-cs-red text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-cs-red-dark transition-colors flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Onboard Member
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-cs-gray-500" />
            <input
              type="text"
              placeholder="Search name, company, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-cs-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-cs-red/20 focus:border-cs-red transition-all"
            />
          </div>

          <div className="flex items-center gap-3">
            <select
              value={planFilter}
              onChange={(e) => setPlanFilter(e.target.value)}
              className="border border-cs-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cs-red/20 focus:border-cs-red bg-white"
            >
              <option value="all">All Plans</option>
              <option value="flexi">Flexi Desk</option>
              <option value="dedicated">Dedicated Desk</option>
              <option value="cabin">Private Cabin</option>
            </select>

            <button className="p-2 border border-cs-gray-200 rounded-lg text-cs-gray-500 hover:bg-cs-gray-50 transition-colors">
              <Filter className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="mb-4 text-sm font-medium text-cs-gray-500">
          Showing {filteredMembers.length} of {members.length} members
        </div>

        {filteredMembers.length > 0 ? (
          viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredMembers.map((member) => (
                <MemberCard
                  key={member.id}
                  member={member}
                  branchName={getBranchName(member.branchId)}
                />
              ))}
            </div>
          ) : (
            <MemberTable members={filteredMembers} getBranchName={getBranchName} />
          )
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-16 h-16 bg-cs-gray-100 rounded-full flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-cs-gray-500" />
            </div>
            <h3 className="text-lg font-semibold text-cs-black mb-1">No members found</h3>
            <p className="text-sm text-cs-gray-500 max-w-sm">
              No members matched your filters. Try adjusting search or plan, or pick a different branch.
            </p>
          </div>
        )}
      </div>

      <OnboardingWizard isOpen={isOnboardingOpen} onClose={() => setIsOnboardingOpen(false)} />
    </div>
  );
}
