"use client";

import { useState } from "react";
import { X, Phone, MessageCircle, Mail, MapPin, FileText } from "lucide-react";
import { useAppActions } from "@/lib/store";
import { toast } from "sonner";
import { LeadInteraction } from "@/types";

interface LogInteractionModalProps {
  isOpen: boolean;
  onClose: () => void;
  leadId: string;
}

type InteractionType = "call" | "whatsapp" | "email" | "visit" | "note";

export function LogInteractionModal({ isOpen, onClose, leadId }: LogInteractionModalProps) {
  const { logLeadInteraction } = useAppActions();
  const [type, setType] = useState<InteractionType>("call");
  
  // Form states
  const [notes, setNotes] = useState("");
  const [duration, setDuration] = useState("");
  const [outcome, setOutcome] = useState("Interested");
  const [direction, setDirection] = useState("Outgoing");
  const [subject, setSubject] = useState("");
  const [branch, setBranch] = useState("Hitech City");

  if (!isOpen) return null;

  const handleSave = () => {
    if (!notes.trim() && type !== "email") {
      toast.error("Please enter some notes.");
      return;
    }

    const metadata: any = {};
    if (type === "call") {
      metadata.duration = duration;
      metadata.outcome = outcome;
    } else if (type === "whatsapp") {
      metadata.direction = direction;
    } else if (type === "email") {
      metadata.subject = subject;
    } else if (type === "visit") {
      metadata.branch = branch;
      metadata.outcome = outcome;
    }

    logLeadInteraction(leadId, {
      type,
      notes,
      metadata,
    });

    toast.success(`${type} interaction logged successfully!`);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-cs-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between p-5 border-b border-cs-gray-200">
          <h2 className="text-lg font-bold font-heading text-cs-black">Log Interaction</h2>
          <button onClick={onClose} className="p-1 rounded-md text-cs-gray-500 hover:bg-cs-gray-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5">
          <div className="flex items-center gap-2 mb-5 overflow-x-auto pb-1 scrollbar-none">
            <TypePill active={type === "call"} onClick={() => setType("call")} icon={Phone} label="Call" />
            <TypePill active={type === "whatsapp"} onClick={() => setType("whatsapp")} icon={MessageCircle} label="WhatsApp" />
            <TypePill active={type === "email"} onClick={() => setType("email")} icon={Mail} label="Email" />
            <TypePill active={type === "visit"} onClick={() => setType("visit")} icon={MapPin} label="Visit" />
            <TypePill active={type === "note"} onClick={() => setType("note")} icon={FileText} label="Note" />
          </div>

          <div className="space-y-4">
            {type === "call" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-cs-gray-700 mb-1">Duration (min)</label>
                  <input type="number" value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full px-3 py-2 border border-cs-gray-200 rounded-md text-sm focus:outline-none focus:border-cs-red" placeholder="e.g. 15" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-cs-gray-700 mb-1">Outcome</label>
                  <select value={outcome} onChange={(e) => setOutcome(e.target.value)} className="w-full px-3 py-2 border border-cs-gray-200 rounded-md text-sm focus:outline-none focus:border-cs-red">
                    <option>Interested</option>
                    <option>Not interested</option>
                    <option>Callback requested</option>
                    <option>No answer</option>
                  </select>
                </div>
              </div>
            )}

            {type === "whatsapp" && (
              <div>
                <label className="block text-xs font-medium text-cs-gray-700 mb-1">Direction</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-2 text-sm text-cs-gray-700">
                    <input type="radio" checked={direction === "Outgoing"} onChange={() => setDirection("Outgoing")} className="text-cs-red focus:ring-cs-red" />
                    Outgoing
                  </label>
                  <label className="flex items-center gap-2 text-sm text-cs-gray-700">
                    <input type="radio" checked={direction === "Incoming"} onChange={() => setDirection("Incoming")} className="text-cs-red focus:ring-cs-red" />
                    Incoming
                  </label>
                </div>
              </div>
            )}

            {type === "email" && (
              <div>
                <label className="block text-xs font-medium text-cs-gray-700 mb-1">Subject</label>
                <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} className="w-full px-3 py-2 border border-cs-gray-200 rounded-md text-sm focus:outline-none focus:border-cs-red" placeholder="Email subject..." />
              </div>
            )}

            {type === "visit" && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-cs-gray-700 mb-1">Branch</label>
                  <select value={branch} onChange={(e) => setBranch(e.target.value)} className="w-full px-3 py-2 border border-cs-gray-200 rounded-md text-sm focus:outline-none focus:border-cs-red">
                    <option>Hitech City</option>
                    <option>Gachibowli</option>
                    <option>Raidurg</option>
                    <option>Kondapur</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-cs-gray-700 mb-1">Reaction</label>
                  <select value={outcome} onChange={(e) => setOutcome(e.target.value)} className="w-full px-3 py-2 border border-cs-gray-200 rounded-md text-sm focus:outline-none focus:border-cs-red">
                    <option>Very interested</option>
                    <option>Interested</option>
                    <option>Neutral</option>
                    <option>Unlikely</option>
                  </select>
                </div>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-cs-gray-700 mb-1">
                {type === "email" ? "Email Summary" : "Notes"} *
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full px-3 py-2 border border-cs-gray-200 rounded-md text-sm focus:outline-none focus:border-cs-red min-h-[100px] resize-y"
                placeholder="What was discussed?"
              />
            </div>
          </div>
        </div>

        <div className="p-4 bg-cs-gray-50 border-t border-cs-gray-200 flex justify-end gap-3">
          <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-cs-gray-700 hover:bg-cs-gray-200 rounded-lg transition-colors">
            Cancel
          </button>
          <button onClick={handleSave} className="px-5 py-2 text-sm font-medium text-white bg-cs-red hover:bg-cs-red-dark rounded-lg transition-colors shadow-sm">
            Save Interaction
          </button>
        </div>
      </div>
    </div>
  );
}

function TypePill({ active, onClick, icon: Icon, label }: { active: boolean; onClick: () => void; icon: any; label: string }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-1.5 px-4 py-2.5 rounded-lg border transition-all ${
        active
          ? "border-cs-red bg-[#E8192C0A] text-cs-red"
          : "border-cs-gray-200 bg-white text-cs-gray-500 hover:border-cs-gray-300 hover:bg-cs-gray-50"
      }`}
    >
      <Icon className="w-5 h-5" />
      <span className="text-[11px] font-medium leading-none">{label}</span>
    </button>
  );
}
