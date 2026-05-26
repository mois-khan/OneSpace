"use client";

import { useEffect, useState } from "react";
import { Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { AssistantPanel } from "./AssistantPanel";
import { OPEN_ASSISTANT_EVENT } from "@/components/dashboard/AiInsightBanner";

export function AssistantRoot() {
  const [open, setOpen] = useState(false);

  // Global shortcut: Cmd/Ctrl + J
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "j") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Listen for the AI Insight banner (or any other component) to open the assistant
  useEffect(() => {
    const onOpen = () => setOpen(true);
    window.addEventListener(OPEN_ASSISTANT_EVENT, onOpen);
    return () => window.removeEventListener(OPEN_ASSISTANT_EVENT, onOpen);
  }, []);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Open OneSpace assistant"
        className={cn(
          "fixed bottom-5 right-5 z-30 group",
          "h-12 px-4 rounded-full flex items-center gap-2",
          "bg-cs-black text-white text-sm font-medium",
          "shadow-[0_8px_24px_-4px_rgba(17,24,39,0.35)]",
          "hover:bg-cs-red transition-colors",
          open && "scale-90 opacity-0 pointer-events-none",
        )}
      >
        <Sparkles className="w-4 h-4 text-cs-red group-hover:text-white transition-colors" />
        <span className="hidden sm:inline">Ask AI</span>
        <kbd className="hidden md:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium bg-white/10 text-white/70 border border-white/15">
          ⌘J
        </kbd>
      </button>
      <AssistantPanel open={open} onOpenChange={setOpen} />
    </>
  );
}
