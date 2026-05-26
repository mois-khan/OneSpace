"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Mail, RefreshCcw, Sparkles, X } from "lucide-react";
import { formatCurrency } from "@/lib/utils";
import type { Member } from "@/types";

interface SelectionToolbarProps {
  selectedMembers: Member[];
  onBulkEmail: () => void;
  onBulkRenew: () => void;
  onClear: () => void;
}

export function SelectionToolbar({
  selectedMembers,
  onBulkEmail,
  onBulkRenew,
  onClear,
}: SelectionToolbarProps) {
  const count = selectedMembers.length;
  const totalMrr = selectedMembers.reduce((acc, m) => acc + m.monthlyFee, 0);

  return (
    <AnimatePresence>
      {count > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 12 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="fixed bottom-5 left-1/2 -translate-x-1/2 z-30"
        >
          <div className="flex items-center gap-3 bg-cs-black text-white px-3 py-2.5 rounded-2xl shadow-[0_20px_48px_-12px_rgba(0,0,0,0.5)] ring-1 ring-white/10">
            <div className="flex items-center gap-2 px-2">
              <div className="w-2 h-2 rounded-full bg-cs-red animate-pulse" />
              <span className="text-[13px] font-semibold tabular-nums">{count} selected</span>
              <span className="text-[11px] text-white/60 tabular-nums">
                · {formatCurrency(totalMrr)} MRR
              </span>
            </div>

            <div className="w-px h-6 bg-white/15" />

            <button
              type="button"
              onClick={onBulkEmail}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium bg-cs-red hover:bg-cs-red-dark transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              AI Email all
            </button>
            <button
              type="button"
              onClick={onBulkRenew}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium bg-white/10 hover:bg-white/20 transition-colors"
            >
              <RefreshCcw className="w-3.5 h-3.5" />
              Renew all
            </button>
            <button
              type="button"
              onClick={() => alert("WhatsApp blast — coming in V2")}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[13px] font-medium bg-white/10 hover:bg-white/20 transition-colors"
              title="WhatsApp blast (V2)"
            >
              <Mail className="w-3.5 h-3.5" />
              WhatsApp
            </button>

            <div className="w-px h-6 bg-white/15" />

            <button
              type="button"
              onClick={onClear}
              className="p-1.5 rounded-md text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              aria-label="Clear selection"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
