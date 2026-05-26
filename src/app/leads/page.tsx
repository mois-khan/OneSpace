"use client";

import { useState, useMemo } from "react";
import { Plus, Search } from "lucide-react";
import { KanbanBoard } from "@/components/leads/KanbanBoard";
import { useLeads, useBranch, useAppActions } from "@/lib/store";
import { toast } from "sonner";

export default function LeadsPage() {
  const leads = useLeads();
  const { selectedBranchId } = useBranch();
  const { addLead } = useAppActions();
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Add lead form fields
  const [form, setForm] = useState({
    name: "",
    company: "",
    phone: "",
    planType: "",
    source: "",
  });

  const filteredLeads = useMemo(() => {
    if (!searchQuery) return leads;
    const q = searchQuery.toLowerCase();
    return leads.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        (l.company || "").toLowerCase().includes(q) ||
        l.phone.toLowerCase().includes(q),
    );
  }, [leads, searchQuery]);

  const newCount = filteredLeads.filter((l) => l.stage === "new").length;
  const touredCount = filteredLeads.filter((l) => l.stage === "toured").length;
  const proposalCount = filteredLeads.filter((l) => l.stage === "proposal").length;
  const negotiatingCount = filteredLeads.filter((l) => l.stage === "negotiating").length;
  const wonCount = filteredLeads.filter((l) => l.stage === "won").length;
  const lostCount = filteredLeads.filter((l) => l.stage === "lost").length;

  const handleSave = () => {
    if (!form.name || !form.phone) {
      toast.error("Name and phone are required");
      return;
    }
    addLead({
      name: form.name,
      company: form.company || undefined,
      phone: form.phone,
      planType: form.planType || "Flexi",
      source: form.source || "Walk-in",
      stage: "new",
      branchId: selectedBranchId === "all" ? "b2" : selectedBranchId,
    });
    toast.success(`Added ${form.name}`);
    setForm({ name: "", company: "", phone: "", planType: "", source: "" });
    setIsAddFormOpen(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-3.5rem)] animate-in fade-in duration-500 bg-cs-gray-50/30 overflow-hidden">
      <div className="bg-white border-b border-cs-gray-200 p-6 flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold font-heading text-cs-black">Leads Pipeline</h1>
            <p className="text-sm text-cs-gray-500 mt-1">
              {leads.length} lead{leads.length === 1 ? "" : "s"} in pipeline. Drag cards to move stages.
            </p>
          </div>
          <button
            onClick={() => setIsAddFormOpen((o) => !o)}
            className="bg-cs-red text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-cs-red-dark transition-colors flex items-center gap-2 shadow-sm"
          >
            <Plus className="w-4 h-4" />
            Add Lead
          </button>
        </div>

        <div className="flex items-center justify-between bg-cs-gray-50 rounded-lg border border-cs-gray-200 px-3 py-2.5">
          <div className="flex items-center gap-5 text-[13px] flex-wrap">
            <PipelineStat label="Active" count={newCount + touredCount + proposalCount + negotiatingCount} tone="black" />
            <span className="w-px h-4 bg-cs-gray-300" />
            <PipelineStat label="New" count={newCount} tone="blue" />
            <PipelineStat label="Toured" count={touredCount} tone="amber" />
            <PipelineStat label="Proposal" count={proposalCount} tone="red" />
            <PipelineStat label="Negotiating" count={negotiatingCount} tone="green" />
            <span className="w-px h-4 bg-cs-gray-300" />
            <PipelineStat label="Won" count={wonCount} tone="green" muted />
            <PipelineStat label="Lost" count={lostCount} tone="gray" muted />
          </div>

          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-cs-gray-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search leads..."
              className="pl-8 pr-3 py-1.5 border border-cs-gray-200 rounded-md text-xs focus:outline-none focus:ring-1 focus:ring-cs-red bg-white w-48"
            />
          </div>
        </div>

        {isAddFormOpen && (
          <div className="mt-4 p-4 border border-cs-gray-200 rounded-lg bg-white shadow-sm animate-in slide-in-from-top-2 duration-200">
            <div className="flex items-center gap-3 flex-wrap">
              <input
                type="text"
                placeholder="Name *"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="flex-1 min-w-[140px] px-3 py-2 border border-cs-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-cs-red"
              />
              <input
                type="text"
                placeholder="Company"
                value={form.company}
                onChange={(e) => setForm({ ...form, company: e.target.value })}
                className="flex-1 min-w-[140px] px-3 py-2 border border-cs-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-cs-red"
              />
              <input
                type="tel"
                placeholder="Phone *"
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
                className="flex-1 min-w-[140px] px-3 py-2 border border-cs-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-cs-red"
              />

              <select
                value={form.planType}
                onChange={(e) => setForm({ ...form, planType: e.target.value })}
                className="px-3 py-2 border border-cs-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-cs-red bg-white"
              >
                <option value="">Plan Interest ▾</option>
                <option value="Flexi">Flexi Desk</option>
                <option value="Dedicated">Dedicated Desk</option>
                <option value="Cabin">Private Cabin</option>
              </select>

              <select
                value={form.source}
                onChange={(e) => setForm({ ...form, source: e.target.value })}
                className="px-3 py-2 border border-cs-gray-200 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-cs-red bg-white"
              >
                <option value="">Source ▾</option>
                <option value="WhatsApp">WhatsApp</option>
                <option value="Referral">Referral</option>
                <option value="Google">Google</option>
                <option value="Walk-in">Walk-in</option>
                <option value="Website">Website</option>
              </select>

              <button
                onClick={handleSave}
                className="px-4 py-2 bg-cs-black text-white text-sm font-medium rounded-md hover:bg-cs-gray-700 transition-colors"
              >
                Save
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="flex-1 pt-6 overflow-hidden flex flex-col min-h-0">
        <KanbanBoard leads={filteredLeads} />
      </div>
    </div>
  );
}

type PipelineTone = "blue" | "amber" | "red" | "green" | "gray" | "black";

function PipelineStat({
  label,
  count,
  tone,
  muted = false,
}: {
  label: string;
  count: number;
  tone: PipelineTone;
  muted?: boolean;
}) {
  const toneClass: Record<PipelineTone, string> = {
    blue: "bg-status-blue",
    amber: "bg-status-amber",
    red: "bg-cs-red",
    green: "bg-status-green",
    gray: "bg-cs-gray-500",
    black: "bg-cs-black",
  };
  return (
    <span className={`inline-flex items-center gap-1.5 ${muted ? "opacity-70" : ""}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${toneClass[tone]}`} />
      <span className="font-medium text-cs-gray-700">{label}</span>
      <span className="font-semibold text-cs-black tabular-nums">{count}</span>
    </span>
  );
}
