"use client";

import { useState } from "react";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import {
  Sparkles,
  X,
  Send,
  CheckCircle2,
  Loader2,
  FileText,
  Wand2,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import type { Member } from "@/types";
import { cn, formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

interface BulkEmailModalProps {
  open: boolean;
  members: Member[];
  onClose: () => void;
  onSendComplete: () => void;
}

type Mode = "ai_personalized" | "template";

interface GeneratedEmail {
  memberId: string;
  status: "pending" | "loading" | "success" | "error";
  subject?: string;
  body?: string;
  error?: string;
}

const TEMPLATES: Array<{ id: string; label: string; subject: string; body: (m: Member) => string }> = [
  {
    id: "gentle-reminder",
    label: "Gentle renewal reminder",
    subject: "Quick note — your CS Coworking membership",
    body: (m) => `Hi ${m.name.split(" ")[0]},

A friendly reminder that your ${m.planType.replace("_", " ")} membership at CS Coworking comes up for renewal on ${new Date(m.contractEnd).toLocaleDateString("en-US", { day: "numeric", month: "long" })}.

We'd love to keep you with us. Reply to this email or drop by the front desk anytime — happy to walk through your options or just catch up.

Warmly,
Abhijeet — Community Manager, CS Coworking`,
  },
  {
    id: "loyalty-offer",
    label: "Loyalty offer",
    subject: "A small thank-you for your loyalty 🙏",
    body: (m) => `Hi ${m.name.split(" ")[0]},

You've been part of the CS Coworking community for ${m.monthsAsMember || 6}+ months, and we appreciate it.

As a thank-you, we'd like to offer you 1 month free if you renew your ${m.planType.replace("_", " ")} plan for the next 12 months. The offer's good until your contract ends on ${new Date(m.contractEnd).toLocaleDateString("en-US", { day: "numeric", month: "long" })}.

Hit reply or stop by the desk if you'd like to chat.

Warmly,
Abhijeet — Community Manager`,
  },
  {
    id: "we-miss-you",
    label: "We miss you",
    subject: "We miss seeing you at CS Coworking",
    body: (m) => `Hi ${m.name.split(" ")[0]},

I noticed it's been ${m.daysSinceLastVisit || 14}+ days since your last visit. Hope everything's well.

If there's anything we can do to make CS Coworking work better for you — different seating, a new branch, a quiet zone — please tell me. Your feedback shapes the space.

Coffee's on us next time.

Warmly,
Abhijeet — Community Manager`,
  },
];

export function BulkEmailModal({ open, members, onClose, onSendComplete }: BulkEmailModalProps) {
  // The parent passes a fresh `key` each time the modal opens, so the component
  // remounts with these initial values — no setState-in-effect reset needed.
  const [mode, setMode] = useState<Mode>("ai_personalized");
  const [templateId, setTemplateId] = useState<string>(TEMPLATES[0].id);
  const [emails, setEmails] = useState<GeneratedEmail[]>(() =>
    members.map((m) => ({ memberId: m.id, status: "pending" })),
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [hasSent, setHasSent] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const memberById = (id: string) => members.find((m) => m.id === id);

  const toggleExpand = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleGenerate = async () => {
    if (members.length === 0) return;

    if (mode === "template") {
      const tpl = TEMPLATES.find((t) => t.id === templateId)!;
      setEmails(
        members.map((m) => ({
          memberId: m.id,
          status: "success",
          subject: tpl.subject,
          body: tpl.body(m),
        })),
      );
      return;
    }

    // AI personalized — fire parallel calls to the existing retention-email endpoint
    setIsGenerating(true);
    setEmails(members.map((m) => ({ memberId: m.id, status: "loading" })));

    const results = await Promise.all(
      members.map(async (m): Promise<GeneratedEmail> => {
        try {
          const res = await fetch("/api/ai/retention-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              memberName: m.name,
              company: m.company,
              monthsAsMember: m.monthsAsMember,
              daysSinceLastVisit: m.daysSinceLastVisit,
              planType: m.planType,
            }),
          });
          if (!res.ok) throw new Error(`HTTP ${res.status}`);
          const data = (await res.json()) as { subject: string; body: string };
          return { memberId: m.id, status: "success", subject: data.subject, body: data.body };
        } catch (err) {
          return {
            memberId: m.id,
            status: "error",
            error: err instanceof Error ? err.message : "Failed",
          };
        }
      }),
    );

    setEmails(results);
    setIsGenerating(false);

    const failures = results.filter((r) => r.status === "error").length;
    if (failures > 0) {
      toast.warning(`${results.length - failures}/${results.length} drafts generated`);
    } else {
      toast.success(`Generated ${results.length} personalized drafts`);
    }
  };

  const handleSend = async () => {
    setIsSending(true);
    // Simulate a real send — for the demo this is mocked
    await new Promise((r) => setTimeout(r, 800));
    setIsSending(false);
    setHasSent(true);
    const successCount = emails.filter((e) => e.status === "success").length;
    toast.success(`Sent ${successCount} email${successCount === 1 ? "" : "s"}`);
    setTimeout(() => {
      onSendComplete();
    }, 1200);
  };

  const successCount = emails.filter((e) => e.status === "success").length;
  const totalMrr = members.reduce((acc, m) => acc + m.monthlyFee, 0);
  const hasDrafts = successCount > 0;

  return (
    <DialogPrimitive.Root open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0 duration-150" />
        <DialogPrimitive.Popup className="fixed top-[8%] left-1/2 z-50 w-full max-w-3xl -translate-x-1/2 max-h-[84vh] flex flex-col rounded-2xl bg-white shadow-[0_24px_64px_-12px_rgba(17,24,39,0.25)] ring-1 ring-cs-gray-300/60 overflow-hidden data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 duration-150">
          <DialogPrimitive.Title className="sr-only">Bulk email composer</DialogPrimitive.Title>

          {/* Header */}
          <div className="flex items-start justify-between p-5 border-b border-cs-gray-100">
            <div className="flex items-center gap-3 min-w-0">
              <span className="w-10 h-10 rounded-xl bg-cs-red-bg flex items-center justify-center shrink-0">
                <Wand2 className="w-5 h-5 text-cs-red" />
              </span>
              <div className="min-w-0">
                <div className="text-[15px] font-semibold text-cs-black font-heading">
                  Bulk retention outreach
                </div>
                <div className="text-[12px] text-cs-gray-500">
                  {members.length} recipient{members.length === 1 ? "" : "s"} ·{" "}
                  {formatCurrency(totalMrr)} MRR at stake
                </div>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-md hover:bg-cs-gray-50 text-cs-gray-500"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Mode picker */}
          <div className="px-5 pt-4">
            <div className="grid grid-cols-2 gap-2">
              <ModeCard
                active={mode === "ai_personalized"}
                onClick={() => setMode("ai_personalized")}
                icon={Sparkles}
                title="AI-personalized"
                description="One unique email per recipient, generated with Gemini."
              />
              <ModeCard
                active={mode === "template"}
                onClick={() => setMode("template")}
                icon={FileText}
                title="Template blast"
                description="Pick from 3 ready-made templates. Same message, name-merged."
              />
            </div>

            {mode === "template" && (
              <div className="mt-3 flex items-center gap-3">
                <label className="text-[12px] font-medium text-cs-gray-700">Template</label>
                <select
                  value={templateId}
                  onChange={(e) => setTemplateId(e.target.value)}
                  className="flex-1 px-3 py-2 border border-cs-gray-200 rounded-lg text-[13px] bg-white focus:outline-none focus:ring-2 focus:ring-cs-red/20 focus:border-cs-red"
                >
                  {TEMPLATES.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          {/* Action row */}
          <div className="px-5 py-3 flex items-center justify-between border-b border-cs-gray-100">
            <span className="text-[12px] text-cs-gray-500">
              {hasDrafts
                ? `${successCount} draft${successCount === 1 ? "" : "s"} ready`
                : isGenerating
                ? "Generating drafts…"
                : "No drafts yet — click Generate"}
            </span>
            <button
              type="button"
              onClick={handleGenerate}
              disabled={isGenerating || isSending}
              className={cn(
                "inline-flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition-colors",
                isGenerating
                  ? "bg-cs-gray-200 text-cs-gray-500 cursor-wait"
                  : "bg-cs-black text-white hover:bg-cs-gray-700",
              )}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Generating…
                </>
              ) : (
                <>
                  <Sparkles className="w-3.5 h-3.5" />
                  {hasDrafts ? "Regenerate" : "Generate drafts"}
                </>
              )}
            </button>
          </div>

          {/* Draft list */}
          <div className="flex-1 overflow-y-auto p-5 space-y-2">
            {emails.map((e) => {
              const m = memberById(e.memberId);
              if (!m) return null;
              const isOpen = expanded.has(e.memberId);
              return (
                <div
                  key={e.memberId}
                  className={cn(
                    "border rounded-lg overflow-hidden transition-colors",
                    e.status === "success"
                      ? "border-cs-gray-200 bg-white"
                      : e.status === "error"
                      ? "border-[#DC26261A] bg-[#DC26260A]"
                      : "border-cs-gray-200 bg-cs-gray-50/40",
                  )}
                >
                  <button
                    type="button"
                    onClick={() => e.status === "success" && toggleExpand(e.memberId)}
                    className="w-full text-left px-3 py-2.5 flex items-center gap-3"
                  >
                    <span
                      className={cn(
                        "w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold",
                        e.status === "success"
                          ? "bg-[#16A34A1A] text-status-green"
                          : e.status === "loading"
                          ? "bg-cs-gray-100 text-cs-gray-500"
                          : e.status === "error"
                          ? "bg-[#DC26261A] text-status-red"
                          : "bg-cs-gray-100 text-cs-gray-500",
                      )}
                    >
                      {e.status === "loading" ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : e.status === "success" ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : e.status === "error" ? (
                        "!"
                      ) : (
                        m.name.charAt(0)
                      )}
                    </span>
                    <span className="flex-1 min-w-0">
                      <div className="text-[13px] font-semibold text-cs-black truncate">
                        {m.name}{" "}
                        <span className="text-[11px] text-cs-gray-500 font-normal">
                          · {m.email}
                        </span>
                      </div>
                      <div className="text-[11px] text-cs-gray-500 truncate">
                        {e.status === "success" && e.subject
                          ? e.subject
                          : e.status === "loading"
                          ? "Generating…"
                          : e.status === "error"
                          ? `Generation failed: ${e.error}`
                          : "Waiting"}
                      </div>
                    </span>
                    {e.status === "success" && (
                      <span className="shrink-0 text-cs-gray-500">
                        {isOpen ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </span>
                    )}
                  </button>
                  {isOpen && e.status === "success" && (
                    <div className="px-3 pb-3 pt-1 text-[12.5px] text-cs-gray-700 whitespace-pre-line border-t border-cs-gray-100 bg-cs-gray-50/40">
                      {e.body}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-cs-gray-100 bg-cs-gray-50/40 flex items-center justify-between">
            <div className="text-[12px] text-cs-gray-500">
              {hasSent
                ? "Sent. You can close this window."
                : `Will send to ${successCount} address${successCount === 1 ? "" : "es"}.`}
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-1.5 rounded-lg text-[13px] font-medium text-cs-gray-700 hover:bg-cs-gray-100 transition-colors"
              >
                {hasSent ? "Close" : "Cancel"}
              </button>
              <button
                type="button"
                onClick={handleSend}
                disabled={!hasDrafts || isSending || hasSent}
                className={cn(
                  "inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-[13px] font-medium transition-colors",
                  hasDrafts && !isSending && !hasSent
                    ? "bg-cs-red text-white hover:bg-cs-red-dark"
                    : "bg-cs-gray-200 text-cs-gray-500 cursor-not-allowed",
                )}
              >
                {isSending ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" /> Sending…
                  </>
                ) : hasSent ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" /> Sent
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" /> Send {successCount}
                  </>
                )}
              </button>
            </div>
          </div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

function ModeCard({
  active,
  onClick,
  icon: Icon,
  title,
  description,
}: {
  active: boolean;
  onClick: () => void;
  icon: typeof Sparkles;
  title: string;
  description: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "text-left p-3 rounded-xl border transition-colors",
        active
          ? "border-cs-red bg-cs-red-bg/50"
          : "border-cs-gray-200 bg-white hover:border-cs-gray-300",
      )}
    >
      <div className="flex items-center gap-2 mb-1">
        <Icon className={cn("w-4 h-4", active ? "text-cs-red" : "text-cs-gray-500")} />
        <span className={cn("text-[13px] font-semibold", active ? "text-cs-red" : "text-cs-black")}>
          {title}
        </span>
      </div>
      <div className="text-[11px] text-cs-gray-500 leading-relaxed">{description}</div>
    </button>
  );
}
