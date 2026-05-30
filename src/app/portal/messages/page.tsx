"use client";

import { useState, useEffect, useRef } from "react";
import { useConversations, usePortalMember, useAppActions } from "@/lib/store";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { 
  Send,
  MessageSquare,
  Check,
  CheckCheck
} from "lucide-react";

export default function PortalMessagesPage() {
  const member = usePortalMember();
  const allConversations = useConversations();
  const { sendMessage, markConversationRead } = useAppActions();
  
  const [replyText, setReplyText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  if (!member) return null;

  const conversation = allConversations.find(c => c.memberId === member.id);

  // Auto-scroll
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [conversation]);

  // Mark as read
  useEffect(() => {
    if (conversation) {
      markConversationRead(conversation.id, member.id);
    }
  }, [conversation, member.id, markConversationRead]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    sendMessage({
      conversationId: conversation?.id,
      memberId: member.id,
      branchId: member.branchId,
      text: replyText,
      senderId: member.id
    });
    setReplyText("");
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-8rem)] flex flex-col bg-white border border-cs-gray-200 rounded-2xl shadow-sm overflow-hidden animate-in fade-in duration-300">
      {/* Header */}
      <div className="h-20 border-b border-cs-gray-200 px-6 sm:px-8 flex items-center justify-between shrink-0 bg-white">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-cs-black text-white flex items-center justify-center font-bold text-lg">
            CS
          </div>
          <div>
            <h2 className="font-bold text-cs-black text-lg leading-tight">Workspace Team</h2>
            <div className="text-xs text-cs-gray-500 flex items-center gap-2">
              <span className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500" /> Online
              </span>
              <span>•</span>
              <span>Typically replies in a few minutes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 sm:p-8 flex flex-col gap-6 bg-cs-gray-50/50">
        {!conversation || conversation.messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-cs-gray-500">
            <MessageSquare className="w-16 h-16 text-cs-gray-200 mb-4" />
            <h3 className="text-xl font-bold text-cs-black mb-2">How can we help?</h3>
            <p className="text-sm">Send us a message and we'll get right back to you.</p>
          </div>
        ) : (
          conversation.messages.map((msg, i) => {
            const isMe = msg.senderId === member.id;
            const showAvatar = !isMe && (i === 0 || conversation.messages[i-1].senderId !== msg.senderId);

            return (
              <div key={msg.id} className={cn("flex gap-3 max-w-[85%] sm:max-w-[75%]", isMe ? "ml-auto flex-row-reverse" : "mr-auto")}>
                {!isMe && (
                  <div className="w-8 shrink-0 hidden sm:block">
                    {showAvatar && (
                      <div className="w-8 h-8 rounded-full bg-cs-black flex items-center justify-center text-xs font-bold text-white">
                        CS
                      </div>
                    )}
                  </div>
                )}
                
                <div className={cn("flex flex-col", isMe ? "items-end" : "items-start")}>
                  <div className={cn(
                    "px-4 py-3 text-sm shadow-sm",
                    isMe 
                      ? "bg-cs-red text-white rounded-2xl rounded-tr-sm" 
                      : "bg-white text-cs-black border border-cs-gray-200 rounded-2xl rounded-tl-sm"
                  )}>
                    {msg.text}
                  </div>
                  <div className="flex items-center gap-1 mt-1 px-1">
                    <span className="text-[10px] text-cs-gray-400">{format(new Date(msg.timestamp), "h:mm a")}</span>
                    {isMe && (
                      msg.read ? <CheckCheck className="w-3 h-3 text-blue-500" /> : <Check className="w-3 h-3 text-cs-gray-400" />
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div className="p-4 sm:p-6 border-t border-cs-gray-200 bg-white shrink-0">
        <form onSubmit={handleSend} className="relative flex items-end gap-3">
          <textarea
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 max-h-32 min-h-[52px] bg-cs-gray-50 border border-cs-gray-200 rounded-2xl px-5 py-3.5 text-sm focus:ring-cs-red focus:border-cs-red resize-none"
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSend(e);
              }
            }}
          />
          <button 
            type="submit"
            disabled={!replyText.trim()}
            className="shrink-0 w-[52px] h-[52px] flex items-center justify-center bg-cs-red text-white rounded-full hover:bg-cs-red-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-sm"
          >
            <Send className="w-5 h-5 ml-1" />
          </button>
        </form>
      </div>
    </div>
  );
}
