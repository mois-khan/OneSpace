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
        <div className="absolute top-full right-0 mt-2 w-96 bg-cs-black text-white rounded-2xl shadow-2xl overflow-hidden border border-white/10 z-50 flex flex-col animate-in fade-in slide-in-from-top-4 duration-300">
          {/* Header */}
          <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-white/5 shrink-0">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cs-red" />
              <h3 className="font-bold font-heading tracking-wide">JARVIS</h3>
            </div>
            <button 
              onClick={toggleAgent}
              className="p-1 rounded-full hover:bg-white/10 transition-colors text-white/50 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* History */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4 flex flex-col-reverse min-h-[200px] max-h-[400px]">
            {chatHistory.length === 0 && !transcript && (
              <div className="text-center text-white/40 my-auto text-sm">
                Press the mic or say something to begin.
              </div>
            )}
            
            {transcript && (
              <div className="self-end max-w-[85%] bg-white/10 rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm">
                {transcript} <span className="animate-pulse">...</span>
              </div>
            )}
            
            {chatHistory.map((msg, i) => (
              <div 
                key={i} 
                className={cn(
                  "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm",
                  msg.role === "user" 
                    ? "self-end bg-white/10 rounded-tr-sm" 
                    : "self-start bg-cs-red text-white rounded-tl-sm"
                )}
              >
                {msg.text}
              </div>
            )).reverse()}
          </div>

          {/* Controls */}
          <div className="p-6 pt-2 bg-gradient-to-t from-cs-black to-transparent shrink-0 flex flex-col items-center">
            {isSpeaking ? (
              <div className="flex items-center gap-2 text-cs-red font-medium text-sm mb-4 animate-pulse">
                <Volume2 className="w-4 h-4" /> Speaking...
              </div>
            ) : isListening ? (
              <div className="flex items-center gap-2 text-white/70 font-medium text-sm mb-4">
                <Loader2 className="w-4 h-4 animate-spin" /> Listening...
              </div>
            ) : (
              <div className="h-9" /> // spacer
            )}
            
            <button
              onClick={isListening ? stopListening : startListening}
              disabled={isSpeaking}
              className={cn(
                "w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 shadow-lg",
                isSpeaking ? "bg-white/10 text-white/30 cursor-not-allowed" :
                isListening 
                  ? "bg-white text-cs-red scale-110 shadow-[0_0_30px_rgba(255,255,255,0.3)] animate-pulse" 
                  : "bg-cs-red text-white hover:scale-105 hover:bg-cs-red-dark"
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
