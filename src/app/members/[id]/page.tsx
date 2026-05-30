"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAllMembers, useBranches, useAppActions, useTickets, useConversations } from "@/lib/store";
import { RiskGauge } from "@/components/members/RiskGauge";
import { AIEmailModal } from "@/components/members/AIEmailModal";
import {
  ArrowLeft,
  Sparkles,
  Calendar,
  Phone,
  Mail,
  MapPin,
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Plus,
  RefreshCcw,
  MessageSquare,
  Send,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

export default function MemberProfilePage() {
  const params = useParams();
  const router = useRouter();
  const members = useAllMembers();
  const branches = useBranches();
  const { renewMember } = useAppActions();
  const allTickets = useTickets();
  const allConversations = useConversations();
  const [activeTab, setActiveTab] = useState<"overview" | "bookings" | "invoices" | "tickets" | "messages">("overview");
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [replyText, setReplyText] = useState("");

  const memberId = params.id as string;
  const member = members.find((m) => m.id === memberId);
  const memberTickets = allTickets.filter(t => t.memberId === memberId);
  const conversation = allConversations.find(c => c.memberId === memberId);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;
    useAppActions.getState().sendMessage({
      conversationId: conversation?.id,
      memberId: member.id,
      branchId: member.branchId,
      text: replyText,
      senderId: "admin"
    });
    setReplyText("");
  };

  if (!member) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <h2 className="text-lg font-semibold">Member not found</h2>
        <button onClick={() => router.back()} className="mt-4 text-cs-red underline">
          Go back
        </button>
      </div>
    );
  }

  const branchName = branches.find((b) => b.id === member.branchId)?.name || "Unknown Branch";
  const initials = member.name.split(" ").map((n) => n[0]).join("").toUpperCase().substring(0, 2);
  const riskScore = member.riskScore || 0;
  const overdueCount = member.invoices.filter((i) => i.status === "overdue").length;

  const handleRenew = () => {
    renewMember(member.id, 12);
    toast.success(`${member.name} renewed for 12 months`);
  };

  return (
    <div className="flex h-[calc(100vh-3.5rem)] animate-in fade-in duration-500 bg-cs-gray-50/30">
      <div className="w-[340px] border-r border-cs-gray-200 bg-white flex flex-col h-full overflow-y-auto">
        <div className="p-6 pb-0">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-sm text-cs-gray-500 hover:text-cs-black mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Directory
          </button>

          <div className="flex flex-col items-center text-center mb-6">
            <div className="w-20 h-20 rounded-full bg-cs-red-bg flex items-center justify-center text-cs-red font-bold text-2xl border border-cs-red/20 mb-4 shadow-sm">
              {initials}
            </div>
            <h1 className="text-xl font-bold font-heading text-cs-black mb-1">{member.name}</h1>
            <p className="text-cs-gray-500 text-sm mb-3">{member.company || "Independent Professional"}</p>
            <div className="flex items-center gap-2 flex-wrap justify-center">
              <span className="text-xs font-medium px-2.5 py-1 bg-cs-gray-100 text-cs-gray-700 rounded-md border border-cs-gray-200">
                {branchName}
              </span>
              <span className="text-xs font-medium px-2.5 py-1 bg-cs-gray-100 text-cs-gray-700 rounded-md border border-cs-gray-200 capitalize">
                {member.planType.replace("_", " ")}
              </span>
            </div>
          </div>
        </div>

        <hr className="border-cs-gray-100 mx-6" />

        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold uppercase text-cs-gray-500 tracking-wider">Retention Risk</h3>
          </div>

          <div className="bg-cs-gray-50 rounded-xl p-4 border border-cs-gray-100 mb-4">
            <RiskGauge score={riskScore} />
          </div>

          <ul className="space-y-3 mb-6">
            <li className="flex items-start gap-2 text-sm text-cs-gray-700">
              {riskScore >= 70 ? (
                <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              )}
              <span>
                {member.daysSinceLastVisit === 0
                  ? "Active recently"
                  : `Last visit ${member.daysSinceLastVisit} days ago (avg: ${member.avgVisitsPerMonth}/mo)`}
              </span>
            </li>
            <li className="flex items-start gap-2 text-sm text-cs-gray-700">
              {memberTickets.length > 0 ? (
                <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
              )}
              <span>{memberTickets.length} open support ticket{memberTickets.length === 1 ? "" : "s"}</span>
            </li>
            <li className="flex items-start gap-2 text-sm text-cs-gray-700">
              <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
              <span>
                Contract ends on{" "}
                {new Date(member.contractEnd).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </span>
            </li>
          </ul>

          <div className="space-y-2">
            <button
              onClick={() => setIsEmailModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 bg-cs-red text-white rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-cs-red-dark transition-all shadow-sm hover:shadow group"
            >
              <Sparkles className="w-4 h-4 text-red-200 group-hover:text-white transition-colors" />
              Draft AI Retention Email
            </button>
            <button
              onClick={handleRenew}
              className="w-full flex items-center justify-center gap-2 bg-white border border-cs-gray-200 text-cs-gray-700 rounded-lg px-4 py-2.5 text-sm font-medium hover:bg-cs-gray-50 hover:border-cs-gray-300 transition-all"
            >
              <RefreshCcw className="w-4 h-4" />
              Renew 12 months
            </button>
          </div>
        </div>

        <hr className="border-cs-gray-100 mx-6" />

        <div className="p-6">
          <h3 className="text-sm font-bold uppercase text-cs-gray-500 tracking-wider mb-4">Quick Stats</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center text-sm">
              <span className="text-cs-gray-500 flex items-center gap-2">
                <CreditCard className="w-4 h-4" /> MRR
              </span>
              <span className="font-semibold text-cs-black tabular-nums">{formatCurrency(member.monthlyFee)}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-cs-gray-500 flex items-center gap-2">
                <Calendar className="w-4 h-4" /> Member since
              </span>
              <span className="font-semibold text-cs-black">{member.memberSince}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-cs-gray-500 flex items-center gap-2">
                <MapPin className="w-4 h-4" /> Seat
              </span>
              <span className="font-semibold text-cs-black">{member.seatId || "Unassigned"}</span>
            </div>
            <div className="flex justify-between items-center text-sm">
              <span className="text-cs-gray-500 flex items-center gap-2">
                <FileText className="w-4 h-4" /> Invoices
              </span>
              <span className="font-semibold text-cs-black tabular-nums">
                {member.invoices.length} total{overdueCount > 0 ? ` · ${overdueCount} overdue` : ""}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <div className="bg-white border-b border-cs-gray-200 px-8 pt-6">
          <h2 className="text-2xl font-bold font-heading text-cs-black mb-6">Member Profile</h2>
          <div className="flex gap-6 border-b-2 border-transparent">
            {(["overview", "messages", "bookings", "invoices", "tickets"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-3 text-sm font-medium transition-colors relative capitalize ${
                  activeTab === tab ? "text-cs-red" : "text-cs-gray-500 hover:text-cs-black"
                }`}
              >
                {tab === "tickets" ? "Support Tickets" : tab}
                {activeTab === tab && <div className="absolute bottom-[-2px] left-0 right-0 h-0.5 bg-cs-red" />}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8">
          {activeTab === "overview" && (
            <div className="max-w-3xl space-y-8 animate-in slide-in-from-bottom-2 duration-300">
              <div className="bg-white rounded-xl border border-cs-gray-200 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-semibold text-cs-black text-lg">Contact Information</h3>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs font-semibold text-cs-gray-500 uppercase">Email Address</label>
                    <p className="mt-1 text-sm text-cs-black flex items-center gap-2">
                      <Mail className="w-4 h-4 text-cs-gray-500" /> {member.email}
                    </p>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-cs-gray-500 uppercase">Phone Number</label>
                    <p className="mt-1 text-sm text-cs-black flex items-center gap-2">
                      <Phone className="w-4 h-4 text-cs-gray-500" /> {member.phone}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-cs-gray-200 p-6">
                <h3 className="font-semibold text-cs-black text-lg mb-6">Recent Activity</h3>
                <div className="relative border-l-2 border-cs-gray-100 ml-3 space-y-8">
                  <div className="relative pl-6">
                    <div className="absolute left-[-9px] top-1 w-4 h-4 rounded-full bg-cs-red/20 border-2 border-white flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-cs-red" />
                    </div>
                    <p className="text-sm font-semibold text-cs-black">Checked In</p>
                    <p className="text-xs text-cs-gray-500 mt-0.5">
                      {member.daysSinceLastVisit === 0
                        ? "Today, 9:14 AM"
                        : `${member.daysSinceLastVisit} day${member.daysSinceLastVisit === 1 ? "" : "s"} ago`}
                    </p>
                  </div>
                  <div className="relative pl-6">
                    <div className="absolute left-[-9px] top-1 w-4 h-4 rounded-full bg-blue-100 border-2 border-white flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                    </div>
                    <p className="text-sm font-semibold text-cs-black">Booked Conference Room Alpha</p>
                    <p className="text-xs text-cs-gray-500 mt-0.5">Last week, 2 hours</p>
                  </div>
                  <div className="relative pl-6">
                    <div className="absolute left-[-9px] top-1 w-4 h-4 rounded-full bg-green-100 border-2 border-white flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                    </div>
                    <p className="text-sm font-semibold text-cs-black">Paid Monthly Invoice</p>
                    <p className="text-xs text-cs-gray-500 mt-0.5">{formatCurrency(member.monthlyFee)}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "tickets" && (
            <div className="max-w-4xl animate-in slide-in-from-bottom-2 duration-300">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-cs-black text-lg">Support Tickets</h3>
                <button className="flex items-center gap-2 text-sm text-cs-red font-medium hover:underline">
                  <Plus className="w-4 h-4" /> New Ticket
                </button>
              </div>

              {memberTickets.length > 0 ? (
                <div className="bg-white border border-cs-gray-200 rounded-xl overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-cs-gray-50 text-xs uppercase text-cs-gray-500 border-b border-cs-gray-200">
                      <tr>
                        <th className="px-6 py-4 font-semibold">Ticket</th>
                        <th className="px-6 py-4 font-semibold">Status</th>
                        <th className="px-6 py-4 font-semibold">Opened</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-cs-gray-100">
                      {memberTickets.map((t) => (
                        <tr key={t.id} className="hover:bg-cs-gray-50/50">
                          <td className="px-6 py-4 font-medium text-cs-black">{t.title}</td>
                          <td className="px-6 py-4">
                            <span className="px-2.5 py-1 bg-amber-100 text-amber-700 rounded-md text-xs font-semibold capitalize border border-amber-200">
                              {t.status.replace("_", " ")}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-cs-gray-500">3 days ago</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="bg-white border border-cs-gray-200 rounded-xl p-8 text-center flex flex-col items-center">
                  <CheckCircle2 className="w-12 h-12 text-green-400 mb-3" />
                  <p className="text-cs-black font-medium">No open tickets</p>
                  <p className="text-sm text-cs-gray-500 mt-1">This member has not reported any issues.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === "invoices" && (
            <div className="max-w-4xl animate-in slide-in-from-bottom-2 duration-300">
              <h3 className="font-semibold text-cs-black text-lg mb-6">Invoices</h3>
              {member.invoices.length === 0 ? (
                <div className="bg-white border border-cs-gray-200 rounded-xl p-8 text-center text-cs-gray-500">
                  No invoices on file.
                </div>
              ) : (
                <div className="bg-white border border-cs-gray-200 rounded-xl overflow-hidden">
                  <table className="w-full text-sm text-left">
                    <thead className="bg-cs-gray-50 text-xs uppercase text-cs-gray-500 border-b border-cs-gray-200">
                      <tr>
                        <th className="px-6 py-3 font-semibold">Invoice</th>
                        <th className="px-6 py-3 font-semibold text-right">Amount</th>
                        <th className="px-6 py-3 font-semibold">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-cs-gray-100">
                      {member.invoices.map((inv) => (
                        <tr key={inv.id} className="hover:bg-cs-gray-50/50">
                          <td className="px-6 py-3 font-medium text-cs-black">{inv.id}</td>
                          <td className="px-6 py-3 text-right tabular-nums">{formatCurrency(inv.amount)}</td>
                          <td className="px-6 py-3">
                            <span
                              className={`px-2.5 py-1 rounded-md text-xs font-semibold capitalize border ${
                                inv.status === "paid"
                                  ? "bg-green-100 text-green-700 border-green-200"
                                  : inv.status === "overdue"
                                  ? "bg-red-100 text-red-700 border-red-200"
                                  : "bg-amber-100 text-amber-700 border-amber-200"
                              }`}
                            >
                              {inv.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === "bookings" && (
            <div className="flex flex-col items-center justify-center py-20 text-center animate-in slide-in-from-bottom-2 duration-300">
              <FileText className="w-12 h-12 text-cs-gray-300 mb-4" />
              <h3 className="text-lg font-semibold text-cs-black mb-1">No bookings yet</h3>
              <p className="text-sm text-cs-gray-500">This member hasn&apos;t booked any rooms recently.</p>
            </div>
          )}
        </div>
      </div>

      <AIEmailModal
        isOpen={isEmailModalOpen}
        onClose={() => setIsEmailModalOpen(false)}
        member={member}
      />
    </div>
  );
}
