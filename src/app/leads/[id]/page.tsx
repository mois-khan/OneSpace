"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { useLeads, useAppActions } from "@/lib/store";
import { generateAiDraft } from "@/app/actions/ai";
import { 
  ArrowLeft, Phone, MessageCircle, Mail, MapPin, 
  Calendar, User, AlertCircle, Plus, CheckCircle2, Sparkles, Copy
} from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import { LogInteractionModal } from "@/components/leads/LogInteractionModal";
import Link from "next/link";
import { toast } from "sonner";

export default function LeadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const leads = useLeads();
  const { updateLead, moveLead, addLeadNote, logLeadInteraction } = useAppActions();
  const lead = leads.find((l) => l.id === id);

  const [activeTab, setActiveTab] = useState<"activity" | "details" | "notes">("activity");
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [newNote, setNewNote] = useState("");
  
  // AI Editor States
  const [generatedMessage, setGeneratedMessage] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiMode, setAiMode] = useState<"template" | "custom">("template");
  const [customPrompt, setCustomPrompt] = useState("");
  const [isAiBoxOpen, setIsAiBoxOpen] = useState(false);

  if (!lead) {
    return (
      <div className="p-8 text-center text-cs-gray-500">
        Lead not found. <Link href="/leads" className="text-cs-red underline">Return to leads</Link>
      </div>
    );
  }

  const handleSaveNote = () => {
    if (!newNote.trim()) return;
    addLeadNote(lead.id, newNote);
    setNewNote("");
    toast.success("Internal note added");
  };

  const getSourceColor = (source: string) => {
    const s = source.toLowerCase();
    if (s.includes("whatsapp")) return "bg-status-green/10 text-status-green";
    if (s.includes("website")) return "bg-status-blue/10 text-status-blue";
    if (s.includes("referral")) return "bg-status-amber/10 text-status-amber";
    if (s.includes("walk-in")) return "bg-purple-500/10 text-purple-600";
    return "bg-cs-gray-100 text-cs-gray-700";
  };

  const STAGES = ["new", "toured", "proposal", "negotiating", "won", "lost"] as const;

  const handleGenerateAI = async () => {
    setIsGenerating(true);
    setIsAiBoxOpen(true);
    
    try {
      if (aiMode === "template") {
        setGeneratedMessage(`Hi ${lead.name.split(" ")[0]},\n\nHope you're having a great day! I wanted to follow up on your enquiry regarding a ${lead.planType} workspace at CS Coworking.\n\nSince you're looking within the ${formatCurrency(lead.mrr || 0)} budget, we have a few great options available right now at our Hitech City branch that I'd love to show you.\n\nWould you be open to a quick 10-minute tour sometime this week?\n\nBest,\nCS Coworking Spaces`);
      } else {
        // Try Live API first
        try {
          const liveDraft = await generateAiDraft(customPrompt || "Say hello and ask if they are still interested.", {
            leadName: lead.name.split(" ")[0],
            planType: lead.planType
          });
          setGeneratedMessage(liveDraft);
        } catch (apiErr) {
          console.warn("Falling back to local generator due to API error:", apiErr);
          // Fallback logic
          const lowerPrompt = customPrompt.toLowerCase();
          let intro = `Thanks for your interest in the ${lead.planType} workspace at CS Coworking!`;
          if (lowerPrompt.includes("book") || lowerPrompt.includes("discount") || lowerPrompt.includes("offer") || lowerPrompt.includes("credit")) {
            intro = `We noticed you're considering the ${lead.planType} workspace and we'd love to have you onboard.`;
          }
          
          let coreMessage = customPrompt;
          if (coreMessage && !coreMessage.endsWith(".") && !coreMessage.endsWith("!") && !coreMessage.endsWith("?")) {
              coreMessage += ".";
          }
          if (coreMessage.length > 0) {
            coreMessage = coreMessage.charAt(0).toUpperCase() + coreMessage.slice(1);
          }
          
          setGeneratedMessage(`Hi ${lead.name.split(" ")[0]},\n\n${intro}\n\n${coreMessage}\n\nLet me know if you're available for a quick chat today to discuss this further!\n\nCheers,\nCS Coworking Spaces`);
        }
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(generatedMessage);
    toast.success("Message copied to clipboard!");
  };

  const handleSendAndLog = (type: "whatsapp" | "email") => {
    // 1. Log to timeline
    logLeadInteraction(lead.id, {
      type,
      notes: `Sent via AI Draft:\n\n${generatedMessage}`,
      metadata: { source: "ai_draft_auto" }
    });
    toast.success(`Interaction logged automatically!`);

    // 2. Open client
    if (type === "whatsapp") {
      window.open(`https://wa.me/${lead.phone.replace(/\D/g, "")}?text=${encodeURIComponent(generatedMessage)}`, "_blank");
    } else {
      window.open(`mailto:${lead.email || ""}?subject=CS Coworking Spaces Follow-up&body=${encodeURIComponent(generatedMessage)}`);
    }
  };

  return (
    <div className="h-[calc(100vh-3.5rem)] flex flex-col bg-cs-gray-50/50">
      <div className="bg-white border-b border-cs-gray-200 px-6 py-4 flex items-center gap-4 sticky top-0 z-10 shrink-0">
        <button onClick={() => router.back()} className="p-2 hover:bg-cs-gray-100 rounded-full transition-colors text-cs-gray-500">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold font-heading text-cs-black flex items-center gap-3">
            {lead.name}
            <span className={cn("px-2.5 py-1 text-[11px] uppercase tracking-wider font-semibold rounded", getSourceColor(lead.source))}>
              {lead.source}
            </span>
          </h1>
          {lead.company && <p className="text-sm text-cs-gray-500">{lead.company}</p>}
        </div>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="max-w-6xl mx-auto flex gap-6 items-start h-full pb-10">
          
          {/* LEFT: Identity Card */}
          <div className="w-[340px] shrink-0 space-y-4">
            <div className="bg-white border border-cs-gray-200 rounded-xl shadow-sm p-5">
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3 text-sm text-cs-gray-700">
                  <Phone className="w-4 h-4 text-cs-gray-400" />
                  <span className="font-medium">{lead.phone}</span>
                </div>
                {lead.email && (
                  <div className="flex items-center gap-3 text-sm text-cs-gray-700">
                    <Mail className="w-4 h-4 text-cs-gray-400" />
                    <span>{lead.email}</span>
                  </div>
                )}
              </div>

              <div className="border-t border-cs-gray-100 pt-5 pb-5">
                <div className="text-[11px] font-semibold text-cs-gray-400 uppercase tracking-wider mb-3">Stage</div>
                <div className="flex flex-wrap gap-1.5">
                  {STAGES.map((s) => (
                    <button
                      key={s}
                      onClick={() => moveLead(lead.id, s)}
                      className={cn(
                        "px-2.5 py-1 text-xs font-medium rounded capitalize border transition-all",
                        lead.stage === s
                          ? "bg-cs-red border-cs-red text-white shadow-sm"
                          : "bg-white border-cs-gray-200 text-cs-gray-500 hover:border-cs-gray-300"
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-cs-gray-100 pt-5 space-y-4">
                <div>
                  <div className="text-[11px] font-semibold text-cs-gray-400 uppercase tracking-wider mb-1">Follow-up Date</div>
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-cs-gray-400" />
                    <input 
                      type="date"
                      value={lead.followUpDate ? lead.followUpDate.split("T")[0] : ""}
                      onChange={(e) => updateLead(lead.id, { followUpDate: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
                      className="text-sm font-medium text-cs-black bg-transparent border-none p-0 focus:ring-0 cursor-pointer"
                    />
                  </div>
                  {lead.followUpDate && new Date(lead.followUpDate).getTime() < Date.now() && (
                    <div className="mt-1 text-xs text-status-red flex items-center gap-1 font-medium">
                      <AlertCircle className="w-3.5 h-3.5" /> Overdue
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t border-cs-gray-100 mt-5 pt-5 flex flex-col gap-2">
                <div className="text-[11px] font-semibold text-cs-gray-400 uppercase tracking-wider mb-2">Direct Contact</div>
                <div className="flex gap-2">
                  <a href={`tel:${lead.phone}`} className="flex-1 flex items-center justify-center gap-1.5 bg-cs-gray-100 hover:bg-cs-gray-200 text-cs-black py-2 rounded-lg text-xs font-medium transition-colors">
                    <Phone className="w-3.5 h-3.5" /> Call
                  </a>
                  <a href={`https://wa.me/${lead.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="flex-1 flex items-center justify-center gap-1.5 bg-[#16A34A1A] hover:bg-[#16A34A2A] text-status-green py-2 rounded-lg text-xs font-medium transition-colors">
                    <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                  </a>
                  <a href={`mailto:${lead.email || ""}`} className="flex-1 flex items-center justify-center gap-1.5 bg-status-blue/10 hover:bg-status-blue/20 text-status-blue py-2 rounded-lg text-xs font-medium transition-colors">
                    <Mail className="w-3.5 h-3.5" /> Email
                  </a>
                </div>
              </div>

              <div className="border-t border-cs-gray-100 mt-5 pt-5 flex flex-col gap-2">
                <div className="text-[11px] font-semibold text-cs-gray-400 uppercase tracking-wider mb-1">Quick Actions</div>
                <button onClick={() => setIsLogModalOpen(true)} className="w-full flex items-center justify-center gap-2 bg-cs-gray-100 hover:bg-cs-gray-200 text-cs-black py-2 rounded-lg text-sm font-medium transition-colors">
                  <Plus className="w-4 h-4" /> Log Interaction
                </button>
                {lead.stage === "won" && (
                  <button className="w-full flex items-center justify-center gap-2 bg-[#16A34A1A] hover:bg-[#16A34A2A] text-status-green py-2 rounded-lg text-sm font-medium transition-colors mt-2">
                    <CheckCircle2 className="w-4 h-4" /> Convert to Member
                  </button>
                )}
              </div>
            </div>
            
            <div className="bg-white border border-cs-gray-200 rounded-xl shadow-sm p-4 text-xs text-cs-gray-500 text-center">
              Created: {new Date(lead.createdAt).toLocaleDateString()}
            </div>
          </div>

          {/* RIGHT: Tabs & Content */}
          <div className="flex-1 min-w-0 bg-white border border-cs-gray-200 rounded-xl shadow-sm overflow-hidden flex flex-col h-full">
            <div className="flex border-b border-cs-gray-200 px-2 shrink-0">
              <TabButton active={activeTab === "activity"} onClick={() => setActiveTab("activity")}>Activity Log</TabButton>
              <TabButton active={activeTab === "details"} onClick={() => setActiveTab("details")}>Enquiry Details</TabButton>
              <TabButton active={activeTab === "notes"} onClick={() => setActiveTab("notes")}>Internal Notes</TabButton>
            </div>

            <div className="flex-1 overflow-auto p-6">
              {activeTab === "activity" && (
                <div className="max-w-2xl">
                  <div className="mb-6 flex justify-between items-center bg-cs-gray-50 border border-cs-gray-200 p-4 rounded-xl">
                    <div className="text-sm">
                      <div className="font-semibold text-cs-black flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-status-blue" />
                        AI Message Generator
                      </div>
                      <div className="text-cs-gray-500 mt-0.5 text-xs">Instantly draft an editable outreach message.</div>
                    </div>
                    <button 
                      onClick={() => setIsAiBoxOpen(!isAiBoxOpen)}
                      className="text-sm font-medium text-cs-black bg-white border border-cs-gray-200 hover:bg-cs-gray-50 px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                    >
                      {isAiBoxOpen ? "Close Generator" : "Open Generator"}
                    </button>
                  </div>
                  
                  {isAiBoxOpen && (
                    <div className="mb-6 p-5 bg-white border border-status-blue/30 shadow-sm rounded-xl relative group animate-in slide-in-from-top-2 duration-200">
                      <div className="absolute -top-2.5 left-4 bg-white px-2 text-[10px] font-bold text-status-blue uppercase tracking-wider">Draft Editor</div>
                      
                      {/* Mode Toggles */}
                      <div className="flex gap-4 mb-4 border-b border-cs-gray-100 pb-3">
                        <label className="flex items-center gap-2 text-sm text-cs-gray-700 cursor-pointer">
                          <input type="radio" checked={aiMode === "template"} onChange={() => setAiMode("template")} className="text-cs-red focus:ring-cs-red" />
                          Standard Template
                        </label>
                        <label className="flex items-center gap-2 text-sm text-cs-gray-700 cursor-pointer">
                          <input type="radio" checked={aiMode === "custom"} onChange={() => setAiMode("custom")} className="text-cs-red focus:ring-cs-red" />
                          Custom AI Prompt
                        </label>
                      </div>

                      {aiMode === "custom" && (
                        <div className="mb-4">
                          <input 
                            type="text"
                            placeholder="E.g., Offer them a 10% discount if they book today..."
                            value={customPrompt}
                            onChange={(e) => setCustomPrompt(e.target.value)}
                            className="w-full px-3 py-2 border border-cs-gray-200 rounded-lg text-sm focus:outline-none focus:border-cs-red mb-2"
                          />
                        </div>
                      )}

                      <button 
                        onClick={handleGenerateAI}
                        disabled={isGenerating || (aiMode === "custom" && !customPrompt)}
                        className="w-full mb-4 text-sm font-medium text-white bg-cs-black hover:bg-cs-gray-700 py-2 rounded-lg transition-colors disabled:opacity-50"
                      >
                        {isGenerating ? "Drafting..." : "Generate Draft"}
                      </button>

                      {generatedMessage && (
                        <>
                          <textarea 
                            value={generatedMessage}
                            onChange={(e) => setGeneratedMessage(e.target.value)}
                            className="w-full h-32 p-3 text-sm text-cs-gray-700 border border-cs-gray-200 rounded-lg focus:outline-none focus:border-cs-red resize-none mb-3"
                          />
                          <div className="flex gap-2 items-center flex-wrap">
                            <button onClick={copyToClipboard} className="flex items-center gap-1.5 text-xs font-medium bg-cs-gray-100 hover:bg-cs-gray-200 text-cs-black px-3 py-1.5 rounded transition-colors">
                              <Copy className="w-3.5 h-3.5" /> Copy Text
                            </button>
                            <button onClick={() => handleSendAndLog("whatsapp")} className="flex items-center gap-1.5 text-xs font-medium bg-[#16A34A1A] hover:bg-[#16A34A2A] text-status-green px-3 py-1.5 rounded transition-colors">
                              <MessageCircle className="w-3.5 h-3.5" /> Send & Log (WhatsApp)
                            </button>
                            <button onClick={() => handleSendAndLog("email")} className="flex items-center gap-1.5 text-xs font-medium bg-status-blue/10 hover:bg-status-blue/20 text-status-blue px-3 py-1.5 rounded transition-colors">
                              <Mail className="w-3.5 h-3.5" /> Send & Log (Email)
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  <div className="mb-6 flex justify-end border-b border-cs-gray-200 pb-4">
                    <button onClick={() => setIsLogModalOpen(true)} className="text-sm font-medium text-cs-red hover:text-cs-red-dark flex items-center gap-1">
                      <Plus className="w-4 h-4" /> Log new activity
                    </button>
                  </div>
                  
                  {(!lead.interactions || lead.interactions.length === 0) ? (
                    <div className="text-center py-12 text-cs-gray-500 bg-cs-gray-50 rounded-lg border border-dashed border-cs-gray-200">
                      No interactions logged yet.
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {lead.interactions.map((int) => (
                        <div key={int.id} className="flex gap-4">
                          <div className="shrink-0 mt-1">
                            <div className="w-8 h-8 rounded-full bg-cs-gray-100 flex items-center justify-center border border-cs-gray-200">
                              {int.type === "call" && <Phone className="w-4 h-4 text-cs-gray-600" />}
                              {int.type === "whatsapp" && <MessageCircle className="w-4 h-4 text-status-green" />}
                              {int.type === "email" && <Mail className="w-4 h-4 text-status-blue" />}
                              {int.type === "visit" && <MapPin className="w-4 h-4 text-status-amber" />}
                              {int.type === "note" && <Plus className="w-4 h-4 text-cs-gray-600" />}
                            </div>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <span className="font-semibold text-cs-black text-sm capitalize">{int.type}</span>
                              <span className="text-xs text-cs-gray-400">•</span>
                              <span className="text-xs text-cs-gray-500">{new Date(int.timestamp).toLocaleString([], { dateStyle: "medium", timeStyle: "short" })}</span>
                            </div>
                            <div className="text-xs text-cs-gray-500 mb-2">Logged by {int.author}</div>
                            <div className="text-sm text-cs-gray-700 bg-cs-gray-50 p-3 rounded-lg border border-cs-gray-100 whitespace-pre-wrap">
                              {int.notes}
                            </div>
                            {int.metadata && Object.keys(int.metadata).length > 0 && (
                              <div className="mt-2 flex gap-2">
                                {Object.entries(int.metadata).map(([k, v]) => (
                                  <span key={k} className="inline-flex text-[10px] font-medium uppercase tracking-wider bg-cs-gray-100 text-cs-gray-600 px-2 py-0.5 rounded">
                                    {k}: {String(v)}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "details" && (
                <div className="max-w-2xl space-y-8">
                  <div>
                    <h3 className="text-sm font-bold text-cs-black mb-4">What They're Looking For</h3>
                    <div className="grid grid-cols-2 gap-y-4 gap-x-8 text-sm">
                      <div>
                        <div className="text-cs-gray-500 mb-1">Interested In</div>
                        <div className="font-medium text-cs-black">{lead.planType}</div>
                      </div>
                      <div>
                        <div className="text-cs-gray-500 mb-1">Budget</div>
                        <div className="font-medium text-cs-black">{formatCurrency(lead.mrr || 0)}/mo</div>
                      </div>
                      <div>
                        <div className="text-cs-gray-500 mb-1">Preferred Branch</div>
                        <div className="font-medium text-cs-black">Hitech City</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "notes" && (
                <div className="max-w-2xl flex flex-col h-full">
                  <div className="mb-6 flex gap-3 shrink-0">
                    <input 
                      type="text" 
                      value={newNote}
                      onChange={(e) => setNewNote(e.target.value)}
                      placeholder="Type an internal note..."
                      className="flex-1 px-4 py-2 border border-cs-gray-200 rounded-lg text-sm focus:outline-none focus:border-cs-red"
                      onKeyDown={(e) => e.key === "Enter" && handleSaveNote()}
                    />
                    <button onClick={handleSaveNote} className="px-4 py-2 bg-cs-black text-white text-sm font-medium rounded-lg hover:bg-cs-gray-700 transition-colors shrink-0">
                      Save Note
                    </button>
                  </div>

                  {(!lead.notes || lead.notes.length === 0) ? (
                    <div className="text-center py-12 text-cs-gray-500">No internal notes.</div>
                  ) : (
                    <div className="space-y-4 flex-1 overflow-auto">
                      {lead.notes.map((note) => (
                        <div key={note.id} className="bg-[#FEF9C3] p-4 rounded-lg shadow-sm border border-[#FDE047]">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-semibold text-sm text-cs-black">{note.author}</div>
                            <div className="text-xs text-yellow-700">{new Date(note.timestamp).toLocaleString()}</div>
                          </div>
                          <div className="text-sm text-yellow-900">{note.text}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <LogInteractionModal isOpen={isLogModalOpen} onClose={() => setIsLogModalOpen(false)} leadId={lead.id} />
    </div>
  );
}

function TabButton({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-5 py-4 text-sm font-medium transition-colors border-b-2",
        active ? "text-cs-red border-cs-red" : "text-cs-gray-500 border-transparent hover:text-cs-black"
      )}
    >
      {children}
    </button>
  );
}
