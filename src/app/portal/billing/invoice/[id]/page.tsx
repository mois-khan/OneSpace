"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { useInvoices, useAllMembers } from "@/lib/store";
import { format } from "date-fns";

export default function InvoicePrintPage() {
  const params = useParams();
  const id = params.id as string;
  const invoices = useInvoices();
  const members = useAllMembers();
  
  const [isReady, setIsReady] = useState(false);

  const invoice = invoices.find(inv => inv.id === id);
  const member = invoice ? members.find(m => m.id === invoice.memberId) : null;

  useEffect(() => {
    if (invoice && member) {
      // Small delay to ensure styles are loaded before printing
      const timer = setTimeout(() => {
        setIsReady(true);
        window.print();
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [invoice, member]);

  if (!invoice || !member) {
    return <div className="p-8 text-center">Invoice not found.</div>;
  }

  return (
    <div className="min-h-screen bg-white text-black p-8 sm:p-12 md:p-20 font-sans max-w-4xl mx-auto">
      {/* Auto-print overlay */}
      {!isReady && (
        <div className="fixed inset-0 bg-white z-50 flex items-center justify-center print:hidden">
          Generating PDF...
        </div>
      )}

      {/* Header */}
      <div className="flex justify-between items-start mb-16">
        <div>
          <h1 className="text-4xl font-bold tracking-tight mb-2">OneSpace</h1>
          <p className="text-gray-500 text-sm">Premium Workspace Solutions</p>
          <div className="mt-6 text-sm text-gray-600 space-y-1">
            <p>123 Innovation Drive</p>
            <p>Tech District, City 10010</p>
            <p>contact@onespace.com</p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-3xl font-light text-gray-400 mb-6 uppercase tracking-widest">Invoice</h2>
          <div className="space-y-1 text-sm">
            <p><span className="font-semibold text-gray-600 mr-4">Invoice No:</span> {invoice.id.toUpperCase()}</p>
            <p><span className="font-semibold text-gray-600 mr-4">Date Issued:</span> {format(new Date(invoice.issuedAt), "MMM d, yyyy")}</p>
            <p><span className="font-semibold text-gray-600 mr-4">Due Date:</span> {format(new Date(invoice.dueAt), "MMM d, yyyy")}</p>
          </div>
        </div>
      </div>

      {/* Bill To */}
      <div className="mb-12">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Bill To</h3>
        <p className="font-bold text-lg">{member.name}</p>
        <p className="text-gray-600">{member.company || "Independent Professional"}</p>
        <p className="text-gray-600">{member.email}</p>
      </div>

      {/* Items Table */}
      <div className="mb-12">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b-2 border-black">
              <th className="pb-3 font-semibold w-2/3">Description</th>
              <th className="pb-3 font-semibold text-right">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            <tr>
              <td className="py-4">Monthly Workspace Membership - {member.planType.toUpperCase()} Plan</td>
              <td className="py-4 text-right">₹{invoice.amount.toLocaleString()}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="flex justify-end mb-16">
        <div className="w-1/2 md:w-1/3 space-y-3">
          <div className="flex justify-between text-sm text-gray-600">
            <span>Subtotal</span>
            <span>₹{invoice.amount.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-600">
            <span>Tax (18% GST)</span>
            <span>Included</span>
          </div>
          <div className="flex justify-between text-lg font-bold border-t-2 border-black pt-3">
            <span>Total Due</span>
            <span>₹{invoice.amount.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-200 pt-8 mt-16 text-center text-xs text-gray-400">
        <p className="mb-1">Thank you for your business!</p>
        <p>If you have any questions regarding this invoice, please contact billing@onespace.com.</p>
      </div>
    </div>
  );
}
