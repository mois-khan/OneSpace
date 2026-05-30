"use client";

import { useState, useEffect, useRef } from "react";
import { useConversations, useAllMembers, useAppActions, useCurrentUser } from "@/lib/store";
import { Conversation, Message } from "@/types";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { 
  Search, 
  Send,
  MessageSquare,
  MoreVertical,
  User as UserIcon,
  Phone,
  Mail,
  Check,
  CheckCheck,
  Paperclip
} from "lucide-react";
import Link from "next/link";

export default function AdminInboxPage() {
  const allConversations = useConversations();
  const members = useAllMembers();
  const currentUser = useCurrentUser();
  const { sendMessage, markConversationRead } = useAppActions();
  
  const [selectedConvId, setSelectedConvId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [attachment, setAttachment] = useState<{url: string, name: string} | null>(null);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom of chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedConvId, allConversations]);

  // Mark as read when selected
  useEffect(() => {
    if (selectedConvId) {
      markConversationRead(selectedConvId, "admin");
    }
  }, [selectedConvId, markConversationRead]);

  const selectedConv = allConversations.find(c => c.id === selectedConvId);
  const selectedMember = selectedConv ? members.find(m => m.id === selectedConv.memberId) : null;

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if ((!replyText.trim() && !attachment) || !selectedConv || !selectedMember) return;

    sendMessage({
      conversationId: selectedConv.id,
      memberId: selectedMember.id,
      branchId: selectedConv.branchId,
      text: replyText,
      senderId: "admin",
      attachmentUrl: attachment?.url,
      attachmentName: attachment?.name
    });
    setReplyText("");
    setAttachment(null);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setAttachment({
        url: event.target?.result as string,
        name: file.name
      });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Filter conversations by search
  const filteredConvs = allConversations.filter(c => {
    const member = members.find(m => m.id === c.memberId);
    if (!member) return false;
    return member.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
           (member.company && member.company.toLowerCase().includes(searchQuery.toLowerCase()));
  });

  return (
    <div className="flex h-full bg-white animate-in fade-in duration-300">
      {/* Left Sidebar - Chat List */}
      <div className="w-[340px] border-r border-cs-gray-200 flex flex-col bg-cs-gray-50/30">
        <div className="p-6 pb-4 border-b border-cs-gray-200">
          <h1 className="text-2xl font-bold font-heading text-cs-black mb-4">Inbox</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cs-gray-400" />
            <input 
              type="text"
              placeholder="Search members or companies..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-cs-gray-200 rounded-lg text-sm focus:ring-cs-red focus:border-cs-red"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredConvs.length === 0 ? (
            <div className="p-6 text-center text-cs-gray-500 text-sm">
              No conversations found.
            </div>
          ) : (
            <div className="divide-y divide-cs-gray-100">
              {filteredConvs.map(conv => {
                const member = members.find(m => m.id === conv.memberId);
                if (!member) return null;
                
                const lastMessage = conv.messages[conv.messages.length - 1];
                const unreadCount = conv.messages.filter(m => !m.read && m.senderId !== "admin").length;
                const isSelected = selectedConvId === conv.id;

                return (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConvId(conv.id)}
                    className={cn(
                      "w-full text-left p-4 hover:bg-cs-gray-50 transition-colors relative flex gap-3",
                      isSelected && "bg-cs-red-bg/50 hover:bg-cs-red-bg/50"
                    )}
                  >
                    {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1 bg-cs-red" />}
                    
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-full bg-cs-gray-200 flex items-center justify-center font-bold text-cs-gray-600 border border-white">
                        {member.name.substring(0, 2).toUpperCase()}
                      </div>
                      {unreadCount > 0 && (
                        <div className="absolute -top-1 -right-1 w-5 h-5 bg-cs-red text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white">
                          {unreadCount}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <div className="font-bold text-sm text-cs-black truncate pr-2">{member.name}</div>
                        <div className="text-[10px] text-cs-gray-400 whitespace-nowrap">
                          {format(new Date(conv.lastMessageAt), "MMM d")}
                        </div>
                      </div>
                      <div className="text-xs text-cs-gray-500 truncate mb-1">
                        {member.company || "Independent"}
                      </div>
                      <div className={cn(
                        "text-xs truncate", 
                        unreadCount > 0 ? "font-bold text-cs-black" : "text-cs-gray-500"
                      )}>
                        {lastMessage.senderId === "admin" ? "You: " : ""}{lastMessage.text}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right Pane - Active Chat */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedConv && selectedMember ? (
          <>
            {/* Chat Header */}
            <div className="h-20 border-b border-cs-gray-200 px-6 flex items-center justify-between shrink-0 bg-white">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-cs-red-bg text-cs-red flex items-center justify-center font-bold text-lg">
                  {selectedMember.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <h2 className="font-bold text-cs-black text-lg leading-tight">{selectedMember.name}</h2>
                  <div className="text-xs text-cs-gray-500 flex items-center gap-2">
                    <span>{selectedMember.company || "Independent Professional"}</span>
                    <span>•</span>
                    <span className="capitalize">{selectedMember.planType.replace("_", " ")}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Link href={`/members/${selectedMember.id}`} className="p-2 text-cs-gray-400 hover:text-cs-black rounded-lg hover:bg-cs-gray-100 transition-colors">
                  <UserIcon className="w-5 h-5" />
                </Link>
                <a href={`tel:${selectedMember.phone}`} className="p-2 text-cs-gray-400 hover:text-cs-black rounded-lg hover:bg-cs-gray-100 transition-colors">
                  <Phone className="w-5 h-5" />
                </a>
              </div>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6 bg-cs-gray-50/50">
              {selectedConv.messages.map((msg, i) => {
                const isAdmin = msg.senderId === "admin";
                const showAvatar = !isAdmin && (i === 0 || selectedConv.messages[i-1].senderId !== msg.senderId);

                return (
                  <div key={msg.id} className={cn("flex gap-3 max-w-[75%]", isAdmin ? "ml-auto flex-row-reverse" : "mr-auto")}>
                    {!isAdmin && (
                      <div className="w-8 shrink-0">
                        {showAvatar && (
                          <div className="w-8 h-8 rounded-full bg-cs-gray-200 flex items-center justify-center text-xs font-bold text-cs-gray-600">
                            {selectedMember.name.substring(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>
                    )}
                    
                    <div className={cn("flex flex-col", isAdmin ? "items-end" : "items-start")}>
                      <div className={cn(
                        "px-4 py-2.5 text-sm shadow-sm",
                        isAdmin 
                          ? "bg-cs-black text-white rounded-2xl rounded-tr-sm" 
                          : "bg-white text-cs-black border border-cs-gray-200 rounded-2xl rounded-tl-sm"
                      )}>
                        {msg.text}
                        {msg.attachmentUrl && (
                          <div className="mt-2">
                            {msg.attachmentUrl.startsWith("data:image/") ? (
                              <img src={msg.attachmentUrl} alt={msg.attachmentName} className="max-w-full max-h-[200px] rounded-lg border border-black/10 object-contain" />
                            ) : (
                              <div className="flex items-center gap-2 p-2 bg-black/10 rounded-lg text-xs">
                                <Paperclip className="w-4 h-4" />
                                <span className="truncate max-w-[150px] font-medium">{msg.attachmentName}</span>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-1 mt-1 px-1">
                        <span className="text-[10px] text-cs-gray-400">{format(new Date(msg.timestamp), "h:mm a")}</span>
                        {isAdmin && (
                          msg.read ? <CheckCheck className="w-3 h-3 text-blue-500" /> : <Check className="w-3 h-3 text-cs-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-cs-gray-200 bg-cs-gray-50/50">
              {attachment && (
                <div className="mb-3 flex items-center gap-2 bg-white border border-cs-gray-200 rounded-lg p-2 max-w-sm mx-auto">
                  {attachment.url.startsWith("data:image/") ? (
                    <div className="w-8 h-8 rounded bg-cs-gray-100 bg-cover bg-center" style={{ backgroundImage: `url(${attachment.url})` }} />
                  ) : (
                    <Paperclip className="w-4 h-4 text-cs-gray-500 shrink-0" />
                  )}
                  <span className="text-xs text-cs-black font-medium truncate flex-1">{attachment.name}</span>
                  <button type="button" onClick={() => setAttachment(null)} className="text-cs-gray-400 hover:text-cs-red text-lg font-bold px-1">
                    ×
                  </button>
                </div>
              )}
              <form onSubmit={handleSend} className="relative max-w-4xl mx-auto flex items-end gap-3">
                <label className="shrink-0 w-[52px] h-[52px] flex items-center justify-center bg-white border-2 border-cs-gray-200 text-cs-gray-500 rounded-full hover:bg-cs-gray-50 hover:text-cs-black hover:border-cs-gray-300 transition-all cursor-pointer shadow-sm">
                  <Paperclip className="w-5 h-5" />
                  <input type="file" className="hidden" onChange={handleFileChange} />
                </label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={`Message ${selectedMember.name.split(" ")[0]}...`}
                  className="flex-1 max-h-32 min-h-[52px] bg-white border-2 border-cs-gray-200 rounded-2xl px-5 py-3.5 text-sm focus:ring-4 focus:ring-cs-red/10 focus:border-cs-red resize-none transition-all shadow-sm"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend(e);
                    }
                  }}
                />
                <button 
                  type="submit"
                  disabled={(!replyText.trim() && !attachment)}
                  className="shrink-0 w-[52px] h-[52px] flex items-center justify-center bg-cs-red text-white rounded-full hover:bg-cs-red-dark hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 transition-all shadow-md"
                >
                  <Send className="w-5 h-5 ml-1" />
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-cs-gray-500 bg-cs-gray-50/30">
            <MessageSquare className="w-16 h-16 text-cs-gray-200 mb-4" />
            <h3 className="text-xl font-bold text-cs-black mb-2">Your Messages</h3>
            <p className="text-sm">Select a conversation from the sidebar to start chatting.</p>
          </div>
        )}
      </div>
    </div>
  );
}
