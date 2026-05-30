"use client";

import { useState } from "react";
import { useTickets, useAppActions, useAllMembers } from "@/lib/store";
import { Ticket, TicketCategory, TicketPriority } from "@/types";
import { format } from "date-fns";
import { 
  MessageSquare, 
  AlertCircle,
  Clock,
  CheckCircle2,
  MoreVertical,
  Send,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function SupportPage() {
  const allTickets = useTickets();
  const members = useAllMembers();
  const { updateTicketStatus, addTicketComment } = useAppActions();
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [newComment, setNewComment] = useState("");

  const openTickets = allTickets.filter(t => t.status === "open");
  const inProgressTickets = allTickets.filter(t => t.status === "in_progress");
  const resolvedTickets = allTickets.filter(t => t.status === "resolved" || t.status === "closed");

  const selectedTicket = allTickets.find(t => t.id === selectedTicketId);
  const selectedMember = selectedTicket ? members.find(m => m.id === selectedTicket.memberId) : null;

  const handleStatusChange = (status: Ticket["status"]) => {
    if (selectedTicketId) {
      updateTicketStatus(selectedTicketId, status);
    }
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !selectedTicketId) return;
    
    addTicketComment(selectedTicketId, {
      author: "Admin Team", // Ideally comes from currentUser
      text: newComment,
      isStaff: true
    });
    setNewComment("");
  };

  const getPriorityColor = (priority: TicketPriority) => {
    switch (priority) {
      case "urgent": return "bg-red-100 text-red-700 border-red-200";
      case "high": return "bg-orange-100 text-orange-700 border-orange-200";
      case "medium": return "bg-amber-100 text-amber-700 border-amber-200";
      default: return "bg-cs-gray-100 text-cs-gray-700 border-cs-gray-200";
    }
  };

  const getCategoryColor = (category: TicketCategory) => {
    switch (category) {
      case "IT": return "bg-blue-100 text-blue-700";
      case "Maintenance": return "bg-emerald-100 text-emerald-700";
      case "Housekeeping": return "bg-purple-100 text-purple-700";
      case "Billing": return "bg-pink-100 text-pink-700";
      default: return "bg-cs-gray-100 text-cs-gray-700";
    }
  };

  const renderTicketCard = (ticket: Ticket) => {
    const member = members.find(m => m.id === ticket.memberId);
    return (
      <div 
        key={ticket.id} 
        onClick={() => setSelectedTicketId(ticket.id)}
        className={cn(
          "bg-white p-4 rounded-xl border cursor-pointer hover:shadow-md transition-all",
          selectedTicketId === ticket.id ? "border-cs-red ring-1 ring-cs-red shadow-sm" : "border-cs-gray-200"
        )}
      >
        <div className="flex justify-between items-start mb-3">
          <span className={cn("text-xs font-bold px-2 py-0.5 rounded-full", getCategoryColor(ticket.category))}>
            {ticket.category}
          </span>
          <span className={cn("text-[10px] uppercase font-bold px-2 py-0.5 rounded border", getPriorityColor(ticket.priority))}>
            {ticket.priority}
          </span>
        </div>
        <h4 className="font-bold text-cs-black text-sm mb-1 leading-tight">{ticket.title}</h4>
        <p className="text-xs text-cs-gray-500 mb-3 line-clamp-2">{ticket.description}</p>
        
        <div className="flex justify-between items-center text-xs text-cs-gray-500 border-t border-cs-gray-100 pt-3">
          <div className="flex items-center gap-1.5 font-medium text-cs-black">
             <div className="w-5 h-5 rounded-full bg-cs-gray-100 border border-cs-gray-200 flex items-center justify-center text-[9px]">
               {member?.name.substring(0,2).toUpperCase()}
             </div>
             {member?.name}
          </div>
          <div className="flex items-center gap-1">
            <MessageSquare className="w-3.5 h-3.5" /> {ticket.comments.length}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col p-8 bg-cs-gray-50/50">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold font-heading text-cs-black">Helpdesk</h1>
          <p className="text-cs-gray-500">Manage and resolve member issues across the workspace.</p>
        </div>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
        {/* Kanban Board */}
        <div className={cn("flex gap-6 overflow-x-auto transition-all duration-300", selectedTicketId ? "w-2/3 pr-6" : "w-full")}>
          {/* Column: Open */}
          <div className="flex-1 min-w-[300px] flex flex-col">
            <div className="flex items-center gap-2 mb-4 px-2">
              <AlertCircle className="w-5 h-5 text-cs-red" />
              <h2 className="font-bold text-cs-black">Open</h2>
              <span className="ml-auto bg-cs-gray-200 text-cs-gray-700 text-xs font-bold px-2 py-0.5 rounded-full">{openTickets.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-4 pb-4">
              {openTickets.map(renderTicketCard)}
            </div>
          </div>

          {/* Column: In Progress */}
          <div className="flex-1 min-w-[300px] flex flex-col">
            <div className="flex items-center gap-2 mb-4 px-2">
              <Clock className="w-5 h-5 text-amber-500" />
              <h2 className="font-bold text-cs-black">In Progress</h2>
              <span className="ml-auto bg-cs-gray-200 text-cs-gray-700 text-xs font-bold px-2 py-0.5 rounded-full">{inProgressTickets.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-4 pb-4">
              {inProgressTickets.map(renderTicketCard)}
            </div>
          </div>

          {/* Column: Resolved */}
          <div className="flex-1 min-w-[300px] flex flex-col">
            <div className="flex items-center gap-2 mb-4 px-2">
              <CheckCircle2 className="w-5 h-5 text-green-500" />
              <h2 className="font-bold text-cs-black">Resolved</h2>
              <span className="ml-auto bg-cs-gray-200 text-cs-gray-700 text-xs font-bold px-2 py-0.5 rounded-full">{resolvedTickets.length}</span>
            </div>
            <div className="flex-1 overflow-y-auto space-y-4 pb-4">
              {resolvedTickets.map(renderTicketCard)}
            </div>
          </div>
        </div>

        {/* Ticket Detail Panel */}
        {selectedTicket && (
          <div className="w-1/3 bg-white border border-cs-gray-200 rounded-2xl flex flex-col shadow-lg overflow-hidden animate-in slide-in-from-right-4 duration-300">
            {/* Header */}
            <div className="px-6 py-4 border-b border-cs-gray-200 bg-cs-gray-50 flex justify-between items-center">
              <div>
                <div className="text-xs font-bold text-cs-gray-500 mb-1">{selectedTicket.id.toUpperCase()}</div>
                <h3 className="font-bold text-cs-black text-lg leading-tight">{selectedTicket.title}</h3>
              </div>
              <button onClick={() => setSelectedTicketId(null)} className="p-2 text-cs-gray-400 hover:text-cs-black rounded-lg hover:bg-cs-gray-200 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <div className="text-xs font-semibold text-cs-gray-500 uppercase mb-1">Status</div>
                  <select 
                    value={selectedTicket.status}
                    onChange={(e) => handleStatusChange(e.target.value as Ticket["status"])}
                    className="w-full text-sm font-semibold border-cs-gray-300 rounded-lg bg-cs-gray-50 focus:ring-cs-red"
                  >
                    <option value="open">Open</option>
                    <option value="in_progress">In Progress</option>
                    <option value="resolved">Resolved</option>
                  </select>
                </div>
                <div className="flex-1">
                  <div className="text-xs font-semibold text-cs-gray-500 uppercase mb-1">Priority</div>
                  <div className={cn("inline-flex items-center text-xs uppercase font-bold px-3 py-2 rounded-lg border w-full", getPriorityColor(selectedTicket.priority))}>
                    {selectedTicket.priority}
                  </div>
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold text-cs-gray-500 uppercase mb-2">Member</div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-cs-red-bg text-cs-red font-bold flex items-center justify-center">
                     {selectedMember?.name.substring(0,2).toUpperCase()}
                  </div>
                  <div>
                    <div className="font-bold text-cs-black">{selectedMember?.name}</div>
                    <div className="text-xs text-cs-gray-500">{selectedMember?.company || "Independent"}</div>
                  </div>
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold text-cs-gray-500 uppercase mb-2">Description</div>
                <p className="text-sm text-cs-gray-700 bg-cs-gray-50 p-4 rounded-xl border border-cs-gray-100 whitespace-pre-wrap leading-relaxed">
                  {selectedTicket.description}
                </p>
              </div>

              <div className="flex-1 flex flex-col">
                <div className="text-xs font-semibold text-cs-gray-500 uppercase mb-3">Conversation</div>
                <div className="flex-1 space-y-4">
                  {selectedTicket.comments.length === 0 ? (
                    <div className="text-center text-cs-gray-400 text-sm py-4">No comments yet.</div>
                  ) : (
                    selectedTicket.comments.map(c => (
                      <div key={c.id} className={cn("flex flex-col max-w-[85%]", c.isStaff ? "ml-auto items-end" : "mr-auto items-start")}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-semibold text-cs-black">{c.author}</span>
                          <span className="text-[10px] text-cs-gray-400">{format(new Date(c.timestamp), "MMM d, h:mm a")}</span>
                        </div>
                        <div className={cn(
                          "px-4 py-2.5 rounded-2xl text-sm border",
                          c.isStaff ? "bg-cs-black text-white border-cs-black rounded-tr-sm" : "bg-white text-cs-black border-cs-gray-200 rounded-tl-sm"
                        )}>
                          {c.text}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Comment Input */}
            <div className="p-4 border-t border-cs-gray-200 bg-white">
              <form onSubmit={handleAddComment} className="relative">
                <input
                  type="text"
                  placeholder="Type your reply..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="w-full pl-4 pr-12 py-3 bg-cs-gray-50 border border-cs-gray-200 rounded-full text-sm focus:ring-cs-red focus:border-cs-red"
                />
                <button 
                  type="submit"
                  disabled={!newComment.trim()}
                  className="absolute right-2 top-2 p-1.5 bg-cs-red text-white rounded-full hover:bg-cs-red-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
