"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import {
  Sparkles,
  X,
  Send,
  Bot,
  Mail,
  RefreshCcw,
  LogIn,
  CornerDownLeft,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import {
  useAppState,
  useAppActions,
  useCurrentUser,
} from "@/lib/store";
import { buildChatSnapshot } from "@/lib/ai/snapshot";
import type { SuggestedAction } from "@/lib/ai/tools";
import type { UserRole } from "@/types";

interface AssistantPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  suggestions?: SuggestedAction[];
  /** When true, the message is a transient streaming placeholder. */
  pending?: boolean;
}

const STARTER_PROMPTS: Record<UserRole, string[]> = {
  owner: [
    "Which branch is performing best this month?",
    "Show me the top 5 at-risk members",
    "What's our occupancy across all branches?",
  ],
  operations: [
    "List all renewals due in the next 7 days",
    "Which invoices are most overdue?",
    "Where are we losing money this week?",
  ],
  branch_manager: [
    "How is my branch performing today?",
    "Who needs a renewal in the next 14 days?",
    "Any visitors overstaying right now?",
  ],
  community: [
    "Who's checked in right now?",
    "Any visitors overstaying?",
    "Recent notifications I should act on?",
  ],
};

export function AssistantPanel({ open, onOpenChange }: AssistantPanelProps) {
  const router = useRouter();
  const state = useAppState();
  const currentUser = useCurrentUser();
  const { renewMember } = useAppActions();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const idCounterRef = useRef(0);
  const nextId = (prefix: string) => `${prefix}-${++idCounterRef.current}`;

  // Scroll to bottom whenever messages change.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, isSending]);

  // ESC to close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onOpenChange]);

  const greeting = useMemo(() => {
    if (currentUser.role === "branch_manager" || currentUser.role === "community") {
      const branchName = state.branches.find((b) => b.id === currentUser.branchScope)?.name;
      return `Hi ${currentUser.name.split(" ")[0]}, here to help with ${branchName || "your branch"}.`;
    }
    return `Hi ${currentUser.name.split(" ")[0]}, ask me anything about OneSpace.`;
  }, [currentUser, state.branches]);

  const handleSend = async (textOverride?: string) => {
    const text = (textOverride ?? input).trim();
    if (!text || isSending) return;

    const userMsg: ChatMessage = {
      id: nextId("u"),
      role: "user",
      content: text,
    };
    const placeholderId = nextId("a");
    const placeholder: ChatMessage = {
      id: placeholderId,
      role: "assistant",
      content: "",
      pending: true,
    };

    setMessages((prev) => [...prev, userMsg, placeholder]);
    setInput("");
    setIsSending(true);

    try {
      const snapshot = buildChatSnapshot(state, currentUser.branchScope);
      const history = [...messages, userMsg].map(({ role, content }) => ({ role, content }));

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: history,
          user: {
            name: currentUser.name,
            role: currentUser.role,
            branchScope: currentUser.branchScope,
          },
          snapshot,
        }),
      });

      if (!res.ok) {
        const errBody = await res.json().catch(() => ({ error: "Request failed" }));
        throw new Error(errBody.error || "Request failed");
      }

      const data = (await res.json()) as {
        message: { role: "assistant"; content: string };
        suggestions?: SuggestedAction[];
      };

      setMessages((prev) =>
        prev.map((m) =>
          m.id === placeholderId
            ? {
                id: placeholderId,
                role: "assistant",
                content: data.message.content || "(no response)",
                suggestions: data.suggestions,
              }
            : m,
        ),
      );
    } catch (err) {
      const errorText = err instanceof Error ? err.message : "Something went wrong.";
      setMessages((prev) =>
        prev.map((m) =>
          m.id === placeholderId
            ? {
                id: placeholderId,
                role: "assistant",
                content: `⚠ ${errorText}`,
              }
            : m,
        ),
      );
    } finally {
      setIsSending(false);
    }
  };

  const handleSuggestion = (action: SuggestedAction) => {
    if (action.kind === "renew") {
      const memberId = String(action.payload.memberId);
      const months = Number(action.payload.months) || 12;
      renewMember(memberId, months);
      toast.success(`Renewed for ${months} months`);
    } else if (action.kind === "email") {
      const memberId = String(action.payload.memberId);
      onOpenChange(false);
      router.push(`/members/${memberId}`);
    } else if (action.kind === "check_in") {
      onOpenChange(false);
      router.push(`/visitors`);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="fixed inset-0 z-40 bg-black/10 backdrop-blur-[2px]"
            onClick={() => onOpenChange(false)}
          />
          <motion.div
            initial={{ x: 60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 60, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="fixed top-3 right-3 bottom-3 z-50 w-[420px] max-w-[calc(100vw-1.5rem)] bg-white rounded-2xl shadow-[0_24px_64px_-12px_rgba(17,24,39,0.25)] ring-1 ring-cs-gray-300/60 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="relative px-4 py-3 border-b border-cs-gray-100">
              <div
                aria-hidden
                className="absolute inset-0 opacity-[0.04] pointer-events-none"
                style={{
                  background:
                    "linear-gradient(90deg, var(--cs-hero-from) 0%, var(--cs-hero-to) 100%)",
                }}
              />
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-cs-red-bg flex items-center justify-center">
                    <Sparkles className="w-4 h-4 text-cs-red" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-[14px] font-semibold text-cs-black font-heading">
                      OneSpace Assistant
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-cs-gray-500">
                      <ShieldCheck className="w-3 h-3 text-cs-gray-500" />
                      Scoped to <span className="text-cs-black font-medium">{currentUser.roleLabel}</span>
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => onOpenChange(false)}
                  className="p-1.5 rounded-md hover:bg-cs-gray-100 text-cs-gray-500 hover:text-cs-black transition-colors"
                  aria-label="Close assistant"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto px-4 py-4 space-y-3"
            >
              {messages.length === 0 && (
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-cs-red-bg flex items-center justify-center shrink-0">
                      <Bot className="w-4 h-4 text-cs-red" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="bg-cs-gray-50 border border-cs-gray-100 rounded-2xl rounded-tl-sm px-3.5 py-2.5 text-[13px] text-cs-black leading-relaxed">
                        {greeting}
                      </div>
                      <p className="text-[11px] text-cs-gray-500 mt-1 ml-1">
                        Try one of these to start:
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2 ml-11">
                    {STARTER_PROMPTS[currentUser.role].map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => handleSend(p)}
                        className="text-[12px] px-2.5 py-1.5 rounded-full bg-white border border-cs-gray-300/60 text-cs-gray-700 hover:bg-cs-gray-50 hover:border-cs-red/40 hover:text-cs-red transition-colors"
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((m) => (
                <MessageBubble
                  key={m.id}
                  message={m}
                  onSuggestionClick={handleSuggestion}
                />
              ))}
            </div>

            {/* Input */}
            <div className="px-3 py-3 border-t border-cs-gray-100 bg-white">
              <div className="flex items-end gap-2 bg-cs-gray-50 border border-cs-gray-200 focus-within:border-cs-red/50 focus-within:bg-white transition-colors rounded-xl px-3 py-2">
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  rows={1}
                  placeholder="Ask about renewals, occupancy, members…"
                  className="flex-1 resize-none bg-transparent text-[13px] text-cs-black placeholder:text-cs-gray-500 outline-none max-h-32 leading-snug"
                  disabled={isSending}
                />
                <button
                  type="button"
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isSending}
                  className={cn(
                    "shrink-0 w-7 h-7 rounded-md flex items-center justify-center transition-all",
                    input.trim() && !isSending
                      ? "bg-cs-red text-white hover:bg-cs-red-dark"
                      : "bg-cs-gray-200 text-cs-gray-500 cursor-not-allowed",
                  )}
                  aria-label="Send message"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
              <div className="flex items-center justify-between mt-1.5 px-1 text-[10px] text-cs-gray-500">
                <span className="flex items-center gap-1">
                  <CornerDownLeft className="w-3 h-3" /> send
                  <span className="text-cs-gray-300 mx-1">·</span>
                  Shift+↵ newline
                </span>
                <span>Powered by Gemini 2.5</span>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}

/* ───────── Message bubble + suggestion chip ───────── */

function MessageBubble({
  message,
  onSuggestionClick,
}: {
  message: ChatMessage;
  onSuggestionClick: (a: SuggestedAction) => void;
}) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex gap-3", isUser && "flex-row-reverse")}>
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-[11px] font-semibold",
          isUser ? "bg-cs-gray-100 text-cs-gray-700" : "bg-cs-red-bg text-cs-red",
        )}
      >
        {isUser ? "You" : <Bot className="w-4 h-4" />}
      </div>
      <div className={cn("flex-1 min-w-0", isUser && "flex flex-col items-end")}>
        <div
          className={cn(
            "rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed max-w-[90%] whitespace-pre-wrap",
            isUser
              ? "bg-cs-red text-white rounded-tr-sm"
              : "bg-cs-gray-50 border border-cs-gray-100 text-cs-black rounded-tl-sm",
          )}
        >
          {message.pending ? <PendingDots /> : message.content || "(empty response)"}
        </div>

        {message.suggestions && message.suggestions.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-2">
            {message.suggestions.map((s) => (
              <SuggestionChip key={s.id} suggestion={s} onClick={onSuggestionClick} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function SuggestionChip({
  suggestion,
  onClick,
}: {
  suggestion: SuggestedAction;
  onClick: (a: SuggestedAction) => void;
}) {
  const Icon =
    suggestion.kind === "renew" ? RefreshCcw : suggestion.kind === "email" ? Mail : LogIn;
  return (
    <button
      type="button"
      onClick={() => onClick(suggestion)}
      className="inline-flex items-center gap-2 px-2.5 py-1.5 rounded-full text-[12px] font-medium bg-white border border-cs-red/40 text-cs-red hover:bg-cs-red hover:text-white transition-colors"
      title={suggestion.description}
    >
      <Icon className="w-3 h-3" />
      {suggestion.label}
    </button>
  );
}

function PendingDots() {
  return (
    <span className="inline-flex items-center gap-1">
      <span className="w-1.5 h-1.5 rounded-full bg-cs-gray-300 animate-bounce" />
      <span
        className="w-1.5 h-1.5 rounded-full bg-cs-gray-300 animate-bounce"
        style={{ animationDelay: "0.15s" }}
      />
      <span
        className="w-1.5 h-1.5 rounded-full bg-cs-gray-300 animate-bounce"
        style={{ animationDelay: "0.3s" }}
      />
    </span>
  );
}
