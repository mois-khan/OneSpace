"use client";

import { useEffect } from "react";
import { useVoiceAgent } from "@/hooks/useVoiceAgent";
import { useCurrentUser } from "@/lib/store";
import { Mic, X, Loader2, Sparkles, Volume2 } from "lucide-react";
import { cn } from "@/lib/utils";

export function VoiceAgent() {
  const {
    isOpen,
    isListening,
    isSpeaking,
    transcript,
    chatHistory,
    toggleAgent,
    startListening,
    stopListening
  } = useVoiceAgent();
  const user = useCurrentUser();

  // Ctrl + A keyboard listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.key.toLowerCase() === "a") {
        e.preventDefault(); // Prevent select all
        toggleAgent();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleAgent]);

  if (user.role !== "owner") return null;

  return (
    <div className="relative">
      <button
        onClick={toggleAgent}
        className={cn(
          "relative p-2 rounded-md transition-colors flex items-center justify-center gap-2",
          isOpen ? "bg-cs-red text-white" : "text-cs-gray-700 hover:text-cs-black hover:bg-cs-gray-50",
          isSpeaking && !isOpen && "text-cs-red animate-pulse",
          isListening && !isOpen && "text-blue-500 animate-pulse"
        )}
        title="Owner AI Assistant (Ctrl+A)"
      >
        <Sparkles className="w-4 h-4" />
        <span className="hidden lg:inline text-xs font-semibold">JARVIS</span>
      </button>

      {isOpen && (
        <div className="absolute top-full right-0 mt-4 w-[420px] h-[550px] bg-cs-black/85 backdrop-blur-2xl text-white rounded-3xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] overflow-hidden border border-white/20 z-50 flex flex-col animate-in fade-in slide-in-from-top-4 duration-300">
          {/* Header */}
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/5 shrink-0 shadow-sm">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cs-red animate-pulse" />
              <h3 className="font-bold font-heading tracking-widest text-sm text-white/90">JARVIS</h3>
            </div>
            <button 
              onClick={toggleAgent}
              className="p-1 rounded-full hover:bg-white/10 transition-colors text-white/50 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* History */}
          <div className="flex-1 overflow-y-auto p-6 space-y-5 flex flex-col-reverse scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
            {chatHistory.length === 0 && !transcript && (
              <div className="flex flex-col items-center justify-center text-white/40 my-auto pb-8 gap-3">
                <Mic className="w-8 h-8 text-white/20" />
                <span className="text-sm font-medium tracking-wide">Awaiting your command...</span>
              </div>
            )}
            
            {transcript && (
              <div className="self-end max-w-[85%] bg-white/10 rounded-2xl rounded-tr-sm px-5 py-3 text-[14px] leading-relaxed shadow-sm">
                {transcript} <span className="animate-pulse opacity-50">...</span>
              </div>
            )}
            
            {chatHistory.map((msg, i) => (
              <div 
                key={i} 
                className={cn(
                  "max-w-[85%] rounded-2xl px-5 py-3 text-[14px] leading-relaxed shadow-md",
                  msg.role === "user" 
                    ? "self-end bg-white/10 rounded-tr-sm" 
                    : "self-start bg-gradient-to-br from-cs-red to-rose-700 text-white rounded-tl-sm font-medium"
                )}
              >
                {msg.text}
              </div>
            )).reverse()}
          </div>

          {/* Controls */}
          <div className="p-6 bg-gradient-to-t from-black/80 via-black/40 to-transparent shrink-0 flex flex-col items-center border-t border-white/5">
            {isSpeaking ? (
              <div className="flex items-center gap-2 text-rose-400 font-semibold text-xs tracking-wider mb-5 animate-pulse uppercase">
                <Volume2 className="w-4 h-4" /> Synthesizing...
              </div>
            ) : isListening ? (
              <div className="flex items-center gap-2 text-white/70 font-semibold text-xs tracking-wider mb-5 uppercase">
                <Loader2 className="w-4 h-4 animate-spin" /> Listening...
              </div>
            ) : (
              <div className="h-9 mb-1" /> // spacer
            )}
            
            <button
              onClick={isListening ? stopListening : startListening}
              disabled={isSpeaking}
              className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-xl border-4",
                isSpeaking ? "bg-white/5 border-transparent text-white/20 cursor-not-allowed" :
                isListening 
                  ? "bg-white border-white text-cs-red scale-110 shadow-[0_0_40px_rgba(255,255,255,0.4)] animate-pulse" 
                  : "bg-cs-red border-cs-red text-white hover:scale-105 hover:bg-cs-red-dark hover:border-cs-red-dark shadow-[0_0_20px_rgba(220,38,38,0.4)]"
              )}
            >
              <Mic className={cn("w-7 h-7", isListening && "animate-bounce")} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
