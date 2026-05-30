"use client";

import { useState } from "react";
import { usePortalMember, useInvoices, useAppActions } from "@/lib/store";
import { format } from "date-fns";
import { Download, CreditCard, Receipt } from "lucide-react";
import { cn } from "@/lib/utils";
import { PaymentModal } from "@/components/portal/PaymentModal";

export default function PortalBilling() {
  const member = usePortalMember();
  const invoices = useInvoices();
  const { payInvoices } = useAppActions();
  
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  if (!member) return null;

  const memberInvoices = invoices.filter((inv) => inv.memberId === member.id);
  const pendingInvoices = memberInvoices.filter((inv) => inv.status !== "paid");

  return (
    <div className="animate-in fade-in duration-300">
      <div className="mb-8">
        <h1 className="text-3xl font-bold font-heading text-cs-black">Billing & Invoices</h1>
        <p className="text-cs-gray-500 mt-2 text-lg">Manage your payments and download past receipts.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-cs-gray-200 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-cs-gray-200 bg-cs-gray-50 flex items-center gap-2">
              <Receipt className="w-5 h-5 text-cs-gray-500" />
              <h2 className="font-bold text-cs-black">Invoice History</h2>
            </div>
            
            {memberInvoices.length === 0 ? (
              <div className="p-8 text-center text-cs-gray-500">No invoices found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-cs-gray-600">
                  <thead className="bg-white text-xs uppercase font-semibold text-cs-gray-400 border-b border-cs-gray-200">
                    <tr>
                      <th className="px-6 py-4">Invoice ID</th>
                      <th className="px-6 py-4">Date</th>
                      <th className="px-6 py-4">Amount</th>
                      <th className="px-6 py-4">Status</th>
                      <th className="px-6 py-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-cs-gray-100">
                    {memberInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-cs-gray-50 transition-colors">
                        <td className="px-6 py-4 font-medium text-cs-black">{inv.id.toUpperCase()}</td>
                        <td className="px-6 py-4">{format(new Date(inv.dueAt), "MMM d, yyyy")}</td>
                        <td className="px-6 py-4 font-medium">₹{inv.amount.toLocaleString()}</td>
                        <td className="px-6 py-4">
                          <span className={cn(
                            "inline-flex items-center px-2 py-1 rounded text-xs font-semibold",
                            inv.status === "paid" ? "bg-green-100 text-green-700" :
                            inv.status === "overdue" ? "bg-red-100 text-red-700" :
                            "bg-orange-100 text-orange-700"
                          )}>
                            {inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <a
                            href={`/portal/billing/invoice/${inv.id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center justify-center p-2 text-cs-gray-400 hover:text-cs-black hover:bg-cs-gray-100 rounded-lg transition-colors"
                            title="Download PDF"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-cs-gray-200 p-6 shadow-sm sticky top-24">
            <h2 className="font-bold text-cs-black mb-4 flex items-center gap-2">
              <CreditCard className="w-5 h-5 text-cs-gray-500" /> Payment Summary
            </h2>
            
            <div className="space-y-4">
              <div className="flex justify-between py-2 border-b border-cs-gray-100">
                <span className="text-cs-gray-500">Total Pending</span>
                <span className="font-bold text-cs-black">
                  ₹{pendingInvoices.reduce((acc, inv) => acc + inv.amount, 0).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-cs-gray-100">
                <span className="text-cs-gray-500">Next Due Date</span>
                <span className="font-medium text-cs-black">
                  {pendingInvoices.length > 0 
                    ? format(new Date(pendingInvoices.sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime())[0].dueAt), "MMM d, yyyy")
                    : "-"}
                </span>
              </div>
              
              <button 
                onClick={() => setIsPaymentModalOpen(true)}
                disabled={pendingInvoices.length === 0}
                className={cn(
                  "w-full py-3 rounded-xl font-bold transition-all shadow-sm flex justify-center items-center gap-2",
                  pendingInvoices.length > 0 
                    ? "bg-cs-black text-white hover:bg-cs-gray-700" 
                    : "bg-cs-gray-100 text-cs-gray-400 cursor-not-allowed"
                )}
              >
                {pendingInvoices.length > 0 ? "Pay Now" : "Nothing to Pay"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <PaymentModal 
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        amount={pendingInvoices.reduce((acc, inv) => acc + inv.amount, 0)}
        onSuccess={() => {
          payInvoices(pendingInvoices.map(i => i.id));
          setIsPaymentModalOpen(false);
        }}
      />
    </div>
  );
}
