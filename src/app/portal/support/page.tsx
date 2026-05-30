"use client";

import { useState } from "react";
import { useTickets, useAppActions, usePortalMember } from "@/lib/store";
import { Ticket, TicketCategory, TicketPriority } from "@/types";
import { format } from "date-fns";
import { 
  Plus, 
  MessageSquare,
  AlertCircle,
  X,
  Send,
  Ticket as TicketIcon
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function PortalSupportPage() {
  const allTickets = useTickets();
  const member = usePortalMember();
  const { createTicket, addTicketComment } = useAppActions();
  
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [newComment, setNewComment] = useState("");

  // New ticket form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<TicketCategory>("Maintenance");
  const [priority, setPriority] = useState<TicketPriority>("medium");

  if (!member) return null;

  const myTickets = allTickets.filter(t => t.memberId === member.id);
  const selectedTicket = myTickets.find(t => t.id === selectedTicketId);

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTicket({
      memberId: member.id,
      branchId: member.branchId,
      title,
      description,
      category,
      priority,
      status: "open",
    });
    setIsCreating(false);
    setTitle("");
    setDescription("");
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !selectedTicketId) return;
    
    addTicketComment(selectedTicketId, {
      author: member.name,
      text: newComment,
      isStaff: false
    });
    setNewComment("");
  };

  const getPriorityColor = (p: TicketPriority) => {
    switch (p) {
      case "urgent": return "bg-red-100 text-red-700 border-red-200";
      case "high": return "bg-orange-100 text-orange-700 border-orange-200";
      case "medium": return "bg-amber-100 text-amber-700 border-amber-200";
      default: return "bg-cs-gray-100 text-cs-gray-700 border-cs-gray-200";
    }
  };

  const getCategoryColor = (cat: TicketCategory) => {
    switch (cat) {
      case "IT": return "bg-blue-100 text-blue-700";
      case "Maintenance": return "bg-emerald-100 text-emerald-700";
      case "Housekeeping": return "bg-purple-100 text-purple-700";
      case "Billing": return "bg-pink-100 text-pink-700";
      default: return "bg-cs-gray-100 text-cs-gray-700";
    }
  };

  const getStatusColor = (status: Ticket["status"]) => {
    switch (status) {
      case "open": return "bg-cs-red-bg text-cs-red border-cs-red/20";
      case "in_progress": return "bg-amber-100 text-amber-700 border-amber-200";
      case "resolved": 
      case "closed": return "bg-green-100 text-green-700 border-green-200";
    }
  };

  return (
    <div className="animate-in fade-in duration-300">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold font-heading text-cs-black">Support Tickets</h1>
          <p className="text-cs-gray-500 mt-2 text-lg">Report issues and track their resolution status.</p>
        </div>
        <button 
          onClick={() => { setIsCreating(true); setSelectedTicketId(null); }}
          className="bg-cs-black text-white px-5 py-2.5 rounded-xl font-bold hover:bg-cs-gray-700 transition-all shadow-sm flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> New Ticket
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Ticket List */}
        <div className={cn("flex flex-col gap-4", (selectedTicketId || isCreating) ? "lg:col-span-1" : "lg:col-span-3")}>
          {myTickets.length === 0 ? (
            <div className="bg-white border border-cs-gray-200 rounded-2xl p-12 text-center text-cs-gray-500 shadow-sm col-span-3">
              <TicketIcon className="w-12 h-12 mx-auto mb-4 text-cs-gray-300" />
              <h3 className="text-lg font-bold text-cs-black mb-1">No Tickets Found</h3>
              <p>You haven't reported any issues yet.</p>
            </div>
          ) : (
            <div className={cn((selectedTicketId || isCreating) ? "space-y-4" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6")}>
              {myTickets.map(ticket => (
                <div 
                  key={ticket.id}
                  onClick={() => { setSelectedTicketId(ticket.id); setIsCreating(false); }}
                  className={cn(
                    "bg-white rounded-2xl border p-5 cursor-pointer hover:shadow-md transition-all flex flex-col h-[180px]",
                    selectedTicketId === ticket.id ? "border-cs-red ring-1 ring-cs-red shadow-sm" : "border-cs-gray-200"
                  )}
                >
                  <div className="flex justify-between items-start mb-3">
                    <span className={cn("text-[10px] uppercase font-bold px-2 py-0.5 rounded border", getStatusColor(ticket.status))}>
                      {ticket.status.replace("_", " ")}
                    </span>
                    <span className={cn("text-[10px] uppercase font-bold px-2 py-0.5 rounded border", getPriorityColor(ticket.priority))}>
                      {ticket.priority}
                    </span>
                  </div>
                  <h3 className="font-bold text-cs-black line-clamp-1 mb-1">{ticket.title}</h3>
                  <p className="text-sm text-cs-gray-500 line-clamp-2 mb-auto">{ticket.description}</p>
                  
                  <div className="flex justify-between items-center text-xs text-cs-gray-400 mt-4 pt-3 border-t border-cs-gray-100">
                    <span>{format(new Date(ticket.createdAt), "MMM d, yyyy")}</span>
                    <span className="flex items-center gap-1"><MessageSquare className="w-3.5 h-3.5"/> {ticket.comments.length}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Ticket Detail / Create Form */}
        {(selectedTicketId || isCreating) && (
          <div className="lg:col-span-2">
            {isCreating ? (
              <div className="bg-white rounded-2xl border border-cs-gray-200 p-8 shadow-sm animate-in slide-in-from-right-4 duration-300">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="font-bold text-cs-black text-xl flex items-center gap-2">
                    <AlertCircle className="w-6 h-6 text-cs-red" /> Report an Issue
                  </h2>
                  <button onClick={() => setIsCreating(false)} className="text-cs-gray-400 hover:text-cs-black">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <form onSubmit={handleCreateSubmit} className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-cs-black mb-2">Title</label>
                    <input 
                      type="text" 
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Brief summary of the issue..."
                      className="w-full px-4 py-3 rounded-xl border border-cs-gray-200 focus:ring-cs-red focus:border-cs-red bg-cs-gray-50/50"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold text-cs-black mb-2">Category</label>
                      <select 
                        value={category}
                        onChange={(e) => setCategory(e.target.value as TicketCategory)}
                        className="w-full px-4 py-3 rounded-xl border border-cs-gray-200 focus:ring-cs-red focus:border-cs-red bg-cs-gray-50/50"
                      >
                        <option value="IT">IT & Network</option>
                        <option value="Maintenance">Maintenance & Repairs</option>
                        <option value="Housekeeping">Housekeeping</option>
                        <option value="Billing">Billing</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-cs-black mb-2">Priority</label>
                      <select 
                        value={priority}
                        onChange={(e) => setPriority(e.target.value as TicketPriority)}
                        className="w-full px-4 py-3 rounded-xl border border-cs-gray-200 focus:ring-cs-red focus:border-cs-red bg-cs-gray-50/50"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                        <option value="urgent">Urgent</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-cs-black mb-2">Description</label>
                    <textarea 
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      rows={5}
                      placeholder="Please provide details about the issue..."
                      className="w-full px-4 py-3 rounded-xl border border-cs-gray-200 focus:ring-cs-red focus:border-cs-red bg-cs-gray-50/50 resize-none"
                      required
                    />
                  </div>

                  <button 
                    type="submit"
                    className="w-full py-4 bg-cs-red text-white rounded-xl font-bold hover:bg-cs-red-dark transition-all shadow-sm"
                  >
                    Submit Ticket
                  </button>
                </form>
              </div>
            ) : selectedTicket ? (
              <div className="bg-white rounded-2xl border border-cs-gray-200 shadow-sm overflow-hidden flex flex-col h-[700px] animate-in slide-in-from-right-4 duration-300">
                <div className="px-8 py-6 border-b border-cs-gray-200 bg-cs-gray-50 flex justify-between items-start">
                  <div>
                    <div className="flex gap-2 mb-3">
                      <span className={cn("text-[10px] uppercase font-bold px-2 py-0.5 rounded border", getStatusColor(selectedTicket.status))}>
                        {selectedTicket.status.replace("_", " ")}
                      </span>
                      <span className={cn("text-[10px] font-bold px-2 py-0.5 rounded", getCategoryColor(selectedTicket.category))}>
                        {selectedTicket.category}
                      </span>
                    </div>
                    <h2 className="text-2xl font-bold text-cs-black leading-tight">{selectedTicket.title}</h2>
                    <div className="text-sm text-cs-gray-500 mt-2">
                      Ticket #{selectedTicket.id.split("-")[1].toUpperCase()} · Opened {format(new Date(selectedTicket.createdAt), "MMM d, yyyy")}
                    </div>
                  </div>
                  <button onClick={() => setSelectedTicketId(null)} className="p-2 text-cs-gray-400 hover:text-cs-black rounded-lg hover:bg-cs-gray-200 transition-colors">
                    <X className="w-6 h-6" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto p-8 flex flex-col gap-8 bg-cs-gray-50/30">
                  <div className="bg-white p-6 rounded-2xl border border-cs-gray-100 shadow-sm">
                    <h4 className="text-xs font-bold text-cs-gray-400 uppercase tracking-wider mb-3">Original Issue</h4>
                    <p className="text-sm text-cs-black whitespace-pre-wrap leading-relaxed">{selectedTicket.description}</p>
                  </div>

                  <div className="flex-1 space-y-6">
                    {selectedTicket.comments.map(c => (
                      <div key={c.id} className={cn("flex flex-col max-w-[80%]", !c.isStaff ? "ml-auto items-end" : "mr-auto items-start")}>
                        <div className="flex items-center gap-2 mb-1.5 px-1">
                          <span className="text-xs font-bold text-cs-black">{c.author} {c.isStaff && "(Admin)"}</span>
                          <span className="text-[10px] text-cs-gray-400">{format(new Date(c.timestamp), "MMM d, h:mm a")}</span>
                        </div>
                        <div className={cn(
                          "px-5 py-3 rounded-2xl text-sm border shadow-sm",
                          !c.isStaff ? "bg-cs-black text-white border-cs-black rounded-tr-sm" : "bg-white text-cs-black border-cs-gray-200 rounded-tl-sm"
                        )}>
                          {c.text}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedTicket.status !== "closed" && selectedTicket.status !== "resolved" && (
                  <div className="p-6 border-t border-cs-gray-200 bg-white">
                    <form onSubmit={handleAddComment} className="relative">
                      <input
                        type="text"
                        placeholder="Reply to this ticket..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="w-full pl-6 pr-14 py-4 bg-cs-gray-50 border border-cs-gray-200 rounded-full text-sm focus:ring-cs-red focus:border-cs-red shadow-inner"
                      />
                      <button 
                        type="submit"
                        disabled={!newComment.trim()}
                        className="absolute right-2 top-2 bottom-2 aspect-square flex items-center justify-center bg-cs-red text-white rounded-full hover:bg-cs-red-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </form>
                  </div>
                )}
              </div>
            ) : null}
          </div>
        )}
      </div>
    </div>
  );
}
