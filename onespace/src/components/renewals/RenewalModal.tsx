"use client";

import React, { useState } from "react";
import { Member } from "@/types";
import { X, CheckCircle2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface RenewalModalProps {
  member: Member | null;
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (memberId: string) => void;
}

export function RenewalModal({ member, isOpen, onClose, onConfirm }: RenewalModalProps) {
  const [isProcessing, setIsProcessing] = useState(false);

  if (!isOpen || !member) return null;

  const handleConfirm = () => {
    setIsProcessing(true);
    setTimeout(() => {
      onConfirm(member.id);
      setIsProcessing(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-cs-gray-200 flex items-center justify-between bg-cs-gray-50">
          <h2 className="text-lg font-bold font-heading text-cs-black">Process Renewal</h2>
          <button onClick={onClose} className="p-1.5 text-cs-gray-500 hover:bg-cs-gray-200 rounded-md transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <p className="text-sm text-cs-gray-600 mb-6">
            You are extending the contract for <strong>{member.name}</strong> ({member.company || "Independent"}).
          </p>

          <div className="bg-cs-gray-50 border border-cs-gray-200 rounded-lg p-4 mb-6 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-cs-gray-500">Current Plan</span>
              <span className="font-semibold text-cs-black capitalize">{member.planType.replace("_", " ")}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-cs-gray-500">Monthly Fee</span>
              <span className="font-semibold text-cs-black">{formatCurrency(member.monthlyFee)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-cs-gray-500">New Contract End</span>
              <span className="font-semibold text-green-600">
                {new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </span>
            </div>
          </div>

          <p className="text-xs text-cs-gray-500 italic mb-6">
            * This action will reset the member's risk score to 0 and clear any expiring alerts.
          </p>

          <div className="flex gap-3">
            <button 
              onClick={onClose}
              disabled={isProcessing}
              className="flex-1 px-4 py-2 bg-white border border-cs-gray-200 text-cs-gray-700 rounded-lg text-sm font-medium hover:bg-cs-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button 
              onClick={handleConfirm}
              disabled={isProcessing}
              className="flex-1 px-4 py-2 bg-cs-red text-white rounded-lg text-sm font-medium hover:bg-cs-red-dark transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              {isProcessing ? "Processing..." : <><CheckCircle2 className="w-4 h-4" /> Confirm Renewal</>}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
