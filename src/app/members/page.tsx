"use client";

import React, { useState, useMemo } from "react";
import { MemberCard } from "@/components/members/MemberCard";
import { members, branches } from "@/lib/data/seed";
import { Search, Filter, Plus, LayoutGrid, List } from "lucide-react";
import { Member } from "@/types";
import { MemberTable } from "@/components/members/MemberTable";
import { OnboardingWizard } from "@/components/members/OnboardingWizard";

// Generate dummy members for the demo to make the list look full
const generateDummyMembers = (): Member[] => {
  const dummyNames = [
    "Arun Sharma", "Sneha Reddy", "Vikram Singh", "Deepika Nair", "Rahul Verma",
    "Anita Desai", "Suresh Patil", "Kavita Rao", "Manish Gupta", "Pooja Iyer"
  ];
  const companies = ["MarketPro Agency", "DataForge Analytics", "GreenLeaf Tech", "PixelCraft Studios", "VentureBox Capital"];
  
  return dummyNames.map((name, i) => ({
    id: `dummy-${i}`,
    branchId: branches[i % branches.length].id,
    name,
    company: companies[i % companies.length],
    email: `${name.split(" ")[0].toLowerCase()}@example.com`,
    phone: `+91 98765432${20 + i}`,
    planType: i % 3 === 0 ? "cabin" : i % 2 === 0 ? "dedicated" : "flexi",
    monthlyFee: i % 3 === 0 ? 22000 : i % 2 === 0 ? 12000 : 7999,
    contractStart: "2025-01-01",
    contractEnd: new Date(Date.now() + (30 + i * 15) * 24 * 60 * 60 * 1000).toISOString(),
    status: "active",
    tickets: [],
    invoices: [],
    riskScore: Math.floor(Math.random() * 60) // Low to medium risk
  }));
};

const allMembers = [...members, ...generateDummyMembers()];

export default function MembersPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [branchFilter, setBranchFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "table">("grid");
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);

  const filteredMembers = useMemo(() => {
    return allMembers.filter((m) => {
      const matchesSearch = m.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            (m.company?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      const matchesBranch = branchFilter === "all" || m.branchId === branchFilter;
      const matchesPlan = planFilter === "all" || m.planType === planFilter;
      
      return matchesSearch && matchesBranch && matchesPlan;
    });
  }, [searchQuery, branchFilter, planFilter]);

  const getBranchName = (id: string) => branches.find((b) => b.id === id)?.name || "Unknown";

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] animate-in fade-in duration-500 bg-cs-gray-50/30">
      {/* Header & Filters */}
      <div className="bg-white border-b border-cs-gray-200 p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold font-heading text-cs-black">Members</h1>
            <p className="text-sm text-cs-gray-500 mt-1">Manage {allMembers.length} active members across all branches.</p>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex bg-cs-gray-100 rounded-lg p-1">
              <button 
                onClick={() => setViewMode("grid")}
                className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${viewMode === "grid" ? 'bg-white shadow-sm text-cs-black' : 'text-cs-gray-500 hover:text-cs-black'}`}
              >
                <LayoutGrid className="w-4 h-4" />
                Grid
              </button>
              <button 
                onClick={() => setViewMode("table")}
                className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-colors ${viewMode === "table" ? 'bg-white shadow-sm text-cs-black' : 'text-cs-gray-500 hover:text-cs-black'}`}
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

        {/* Filter Bar */}
        <div className="flex items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-cs-gray-400" />
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
              value={branchFilter}
              onChange={(e) => setBranchFilter(e.target.value)}
              className="border border-cs-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-cs-red/20 focus:border-cs-red bg-white"
            >
              <option value="all">All Branches</option>
              {branches.map(b => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>

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

      {/* Content */}
      <div className="flex-1 overflow-auto p-6">
        <div className="mb-4 text-sm font-medium text-cs-gray-500">
          Showing {filteredMembers.length} members
        </div>
        
        {filteredMembers.length > 0 ? (
          viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredMembers.map(member => (
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
              <Search className="w-8 h-8 text-cs-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-cs-black mb-1">No members found</h3>
            <p className="text-sm text-cs-gray-500 max-w-sm">
              We couldn't find any members matching your current filters. Try adjusting your search criteria.
            </p>
          </div>
        )}
      </div>

      <OnboardingWizard isOpen={isOnboardingOpen} onClose={() => setIsOnboardingOpen(false)} />
    </div>
  );
}
