"use client";

import React, { useState } from "react";
import { Member } from "@/types";
import { X, Sparkles, Send, Copy, Mail } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AIEmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member;
}

export function AIEmailModal({ isOpen, onClose, member }: AIEmailModalProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [isGenerated, setIsGenerated] = useState(false);

  const handleGenerate = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/ai/retention-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          memberName: member.name,
          company: member.company,
          monthsAsMember: member.monthsAsMember,
          daysSinceLastVisit: member.daysSinceLastVisit,
          planType: member.planType
        }),
      });

      if (!res.ok) throw new Error("Failed to generate");
      
      const data = await res.json();
      setSubject(data.subject);
      setBody(data.body);
      setIsGenerated(true);
    } catch (error) {
      console.error(error);
      // Fallback for demo if API fails
      setSubject(`We value you, ${member.name.split(" ")[0]} — let's talk about your space`);
      setBody(`Hi ${member.name.split(" ")[0]},\n\nI hope you're having a great week at ${member.company || 'work'}.\n\nI noticed we haven't seen you around the space for a few weeks. Since you've been with us for ${member.monthsAsMember} months now, you're a valued part of our community and we want to make sure you're getting the most out of your membership.\n\nI'd love to invite you back with 4 free hours of conference room credits for your next team meeting. We also have a community lunch this Friday if you're around!\n\nBest,\nAbhijeet\nCommunity Manager`);
      setIsGenerated(true);
    } finally {
      setIsLoading(false);
    }
  };

  // Generate on mount if opening for the first time
  React.useEffect(() => {
    if (isOpen && !isGenerated && !isLoading) {
      handleGenerate();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        className="bg-white rounded-xl shadow-xl w-full max-w-[560px] overflow-hidden flex flex-col max-h-[90vh]"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-cs-gray-100 flex items-center justify-between bg-gradient-to-r from-red-50 to-white">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-cs-red/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-cs-red" />
            </div>
            <h2 className="font-semibold text-cs-black">AI Retention Email</h2>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-cs-gray-100 rounded-md transition-colors text-cs-gray-500">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex flex-col items-center justify-center py-16 space-y-4"
              >
                <div className="relative w-12 h-12">
                  <div className="absolute inset-0 rounded-full border-2 border-cs-red/20"></div>
                  <div className="absolute inset-0 rounded-full border-2 border-cs-red border-t-transparent animate-spin"></div>
                  <Sparkles className="absolute inset-0 m-auto w-5 h-5 text-cs-red animate-pulse" />
                </div>
                <p className="text-sm font-medium text-cs-gray-600 animate-pulse">
                  OneSpace AI is personalising a message for {member.name}...
                </p>
              </motion.div>
            ) : (
              <motion.div
                key="content"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="space-y-4"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold px-2 py-1 bg-green-100 text-green-700 rounded-full flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Warm & Personal
                  </span>
                  <button onClick={handleGenerate} className="text-xs text-cs-red hover:underline font-medium">
                    Regenerate ↺
                  </button>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-cs-gray-500 uppercase">Subject</label>
                  <input
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3 py-2 border border-cs-gray-200 rounded-lg text-sm font-medium text-cs-black focus:outline-none focus:ring-2 focus:ring-cs-red/20 focus:border-cs-red"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-cs-gray-500 uppercase">Message Body</label>
                  <textarea
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                    rows={10}
                    className="w-full px-3 py-2 border border-cs-gray-200 rounded-lg text-sm text-cs-gray-700 focus:outline-none focus:ring-2 focus:ring-cs-red/20 focus:border-cs-red resize-none"
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Footer */}
        {!isLoading && (
          <div className="p-4 border-t border-cs-gray-100 bg-cs-gray-50 flex items-center justify-end gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-cs-gray-200 rounded-lg text-sm font-medium text-cs-gray-700 hover:bg-cs-gray-50 transition-colors">
              <Copy className="w-4 h-4" /> Copy
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-cs-gray-200 rounded-lg text-sm font-medium text-cs-gray-700 hover:bg-cs-gray-50 transition-colors">
              <Mail className="w-4 h-4" /> Send Email
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-[#25D366] text-white rounded-lg text-sm font-medium hover:bg-[#20bd5a] transition-colors shadow-sm">
              <Send className="w-4 h-4" /> Send via WhatsApp
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
