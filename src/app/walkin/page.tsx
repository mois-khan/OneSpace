"use client";

import { useState } from "react";
import { useAppActions, useAllMembers, usePreRegistrations } from "@/lib/store";
import { CheckCircle2, QrCode, ArrowRight, ArrowLeft, Loader2, UserPlus, KeyRound, Ticket } from "lucide-react";
import { sendWhatsAppNotification } from "@/app/actions/whatsapp";
import { toast } from "sonner";
import Link from "next/link";

export default function WalkinPage() {
  const { addLead, checkInVisitor, convertPreRegistration } = useAppActions();
  const members = useAllMembers();
  const preRegs = usePreRegistrations("all");

  const [flow, setFlow] = useState<"select" | "invite" | "new">("select");
  const [inviteCode, setInviteCode] = useState("");
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [form, setForm] = useState({
    name: "",
    company: "",
    phone: "",
    email: "",
    purpose: "Enquiry",
    planType: "",
    hostName: "",
  });

  const [successDetails, setSuccessDetails] = useState({
    name: "",
    code: "",
    type: "walk-in" as "walk-in" | "pre-registered",
    hostName: "",
    purpose: "",
  });

  // Handle Invite Code Check-in
  const handleInviteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = inviteCode.trim().toUpperCase();
    if (!cleanCode) return;

    setIsSubmitting(true);
    
    // Find pre-registration
    const found = preRegs.find(
      (p) => p.inviteCode.toUpperCase() === cleanCode && p.status !== "cancelled"
    );

    if (!found) {
      setIsSubmitting(false);
      toast.error("Invite code not found. Please verify the code or contact reception.");
      return;
    }

    try {
      // 1. Convert Pre-Registration in Store (handles visitor and lead auto-creation)
      convertPreRegistration(found.id);

      // 2. Dispatch WhatsApp Notification
      const welcomeMsg = `Hi ${found.visitorName},\n\nWelcome back to CS Coworking! Your invite code ${found.inviteCode} has been verified and checked in.\n\nMessage: As a registered user, entry is allowed.`;
      await sendWhatsAppNotification(found.phone, welcomeMsg);

      setSuccessDetails({
        name: found.visitorName,
        code: found.inviteCode,
        type: "pre-registered",
        hostName: found.hostName,
        purpose: found.purpose,
      });

      setIsSubmitted(true);
    } catch (err) {
      console.error("Invite check-in failed", err);
      toast.error("Verification failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle New Walk-in Submit
  const handleWalkinSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.email) {
      toast.error("Name, phone, and email are required.");
      return;
    }

    setIsSubmitting(true);
    const passId = Math.random().toString(36).substring(2, 8).toUpperCase();
    const isMeeting = form.purpose === "Meeting" || form.purpose === "Interview";

    try {
      // 1. Add to Visitors Log (This will auto-add to Leads in our store reducer if not a meeting/interview)
      checkInVisitor({
        branchId: "b2",
        name: form.name,
        phone: "+91 " + form.phone.replace(/\s+/g, ""),
        purpose: form.purpose,
        hostName: isMeeting ? form.hostName : undefined,
      });

      // 2. Dispatch WhatsApp Notification
      const passCode = `PASS-${passId}`;
      const welcomeMsg = `Hi ${form.name},\n\nWelcome to CS Coworking! Your entry pass is: ${passCode}.\n\nMessage: As a registered user, entry is allowed.`;
      await sendWhatsAppNotification("+91 " + form.phone, welcomeMsg);

      // 3. Dispatch WhatsApp Notification to Host (if meeting)
      if (isMeeting && form.hostName) {
        const host = members.find((m) => m.name === form.hostName);
        if (host) {
          await sendWhatsAppNotification(
            host.phone,
            `Hi ${host.name}, your visitor ${form.name} has arrived at the front desk for a ${form.purpose}.`
          );
        }
      }

      setSuccessDetails({
        name: form.name,
        code: passCode,
        type: "walk-in",
        hostName: isMeeting ? form.hostName : "Reception Desk",
        purpose: form.purpose,
      });

      setIsSubmitted(true);
    } catch (err) {
      console.error("New walk-in registration failed", err);
      toast.error("Registration failed. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setForm({
      name: "",
      company: "",
      phone: "",
      email: "",
      purpose: "Enquiry",
      planType: "",
      hostName: "",
    });
    setInviteCode("");
    setFlow("select");
    setIsSubmitted(false);
  };

  // SUCCESS SCREEN
  if (isSubmitted) {
    const firstName = successDetails.name.split(" ")[0];
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-white bg-cs-black">
        <div className="w-16 h-16 bg-status-green/20 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-300">
          <CheckCircle2 className="w-9 h-9 text-status-green" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Welcome, {firstName}!</h1>
        <p className="text-cs-gray-400 mb-8 max-w-xs text-sm">
          Your check-in is complete. Please display this pass at the front desk.
        </p>

        {/* Premium Digital Entry Ticket Pass */}
        <div className="w-full max-w-sm bg-white text-cs-black rounded-2xl overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)] relative border border-cs-gray-200">
          
          {/* Top Pass Header */}
          <div className="bg-cs-black text-white p-4 text-left flex justify-between items-center border-b border-white/10">
            <div className="flex items-center gap-1.5">
              <div className="w-5 h-5 bg-cs-red flex items-center justify-center font-bold text-[10px] text-white rounded">CS</div>
              <span className="text-[12px] font-bold tracking-wider uppercase font-heading">OneSpace</span>
            </div>
            <span className="inline-flex items-center gap-1 bg-status-green/10 text-status-green px-2 py-0.5 rounded text-[10px] font-semibold border border-status-green/25 uppercase">
              Verified
            </span>
          </div>

          {/* Ticket Body */}
          <div className="p-6 text-left space-y-5">
            
            {/* The Registered Entry Message - Critical Rule */}
            <div className="bg-[#16A34A0D] border border-status-green/20 rounded-xl p-3.5 text-center flex flex-col items-center gap-1">
              <Ticket className="w-5 h-5 text-status-green animate-pulse" />
              <div className="text-[14px] font-bold text-status-green leading-snug">
                As a registered user, entry is allowed.
              </div>
              <div className="text-[10px] text-cs-gray-500">Front desk entry clearance code activated</div>
            </div>

            {/* QR Code Container */}
            <div className="flex justify-center py-2">
              <div className="bg-cs-gray-50 p-3 rounded-xl border border-cs-gray-200 relative">
                <svg width="140" height="140" xmlns="http://www.w3.org/2000/svg">
                  <defs>
                    <pattern id="qr-success" width="8" height="8" patternUnits="userSpaceOnUse">
                      <rect width="4" height="4" fill="#0D1B2A" />
                      <rect x="4" y="4" width="4" height="4" fill="#0D1B2A" />
                    </pattern>
                  </defs>
                  <rect width="100%" height="100%" fill="url(#qr-success)" />
                  <rect x="30%" y="30%" width="40%" height="40%" fill="white" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white p-2 rounded-lg shadow-md border border-cs-gray-100">
                    <QrCode className="w-7 h-7 text-cs-red" />
                  </div>
                </div>
              </div>
            </div>

            {/* Code identifier */}
            <div className="text-center">
              <div className="text-[9px] uppercase tracking-[0.2em] text-cs-gray-500 font-medium">Entry ticket pass id</div>
              <div className="text-xl font-bold font-mono tracking-widest text-cs-black mt-0.5">
                {successDetails.code}
              </div>
            </div>

            {/* Meta details list */}
            <div className="border-t border-cs-gray-100 pt-4 grid grid-cols-2 gap-y-3 gap-x-2 text-[12px]">
              <div>
                <div className="text-cs-gray-500 uppercase tracking-wider text-[9px] font-medium">Guest Name</div>
                <div className="font-semibold text-cs-black truncate mt-0.5">{successDetails.name}</div>
              </div>
              <div>
                <div className="text-cs-gray-500 uppercase tracking-wider text-[9px] font-medium">Visit Purpose</div>
                <div className="font-semibold text-cs-black truncate mt-0.5">{successDetails.purpose}</div>
              </div>
              <div className="col-span-2">
                <div className="text-cs-gray-500 uppercase tracking-wider text-[9px] font-medium">Host / Meeting With</div>
                <div className="font-semibold text-cs-black truncate mt-0.5">{successDetails.hostName}</div>
              </div>
            </div>

          </div>

          {/* Ticket bottom jagged border styling */}
          <div className="h-2 bg-cs-gray-100 flex justify-between overflow-hidden">
            {Array.from({ length: 18 }).map((_, i) => (
              <div key={i} className="w-3 h-3 bg-white rounded-full -mt-1.5 shrink-0" />
            ))}
          </div>
        </div>

        <p className="text-[12px] text-cs-gray-500 mt-6 max-w-xs leading-relaxed">
          We&apos;ve sent a digital copy of this pass to your WhatsApp.
        </p>

        <button 
          onClick={handleReset}
          className="mt-8 text-sm text-cs-gray-400 hover:text-white transition-colors underline underline-offset-4"
        >
          Check in another guest / Go Back
        </button>
      </div>
    );
  }

  // 1. SELECT FLOW (Entrance option screen)
  if (flow === "select") {
    return (
      <div className="flex-1 flex flex-col p-6 max-w-md mx-auto w-full justify-center">
        <div className="mb-10 text-center">
          <div className="w-12 h-12 bg-cs-red flex items-center justify-center font-black text-xl text-white rounded-xl mx-auto mb-4 shadow-[0_0_15px_rgba(232,25,44,0.3)]">
            CS
          </div>
          <div className="text-cs-red font-bold text-lg tracking-widest uppercase font-heading">OneSpace</div>
          <h1 className="text-white text-3xl font-extrabold tracking-tight mt-4">Welcome to CS Coworking</h1>
          <p className="text-cs-gray-400 mt-2 text-sm">Please select how you would like to register your visit today.</p>
        </div>

        <div className="space-y-4">
          {/* Option A: Invite Code (Pre-registered) */}
          <button
            onClick={() => setFlow("invite")}
            className="w-full text-left bg-white/5 border border-white/10 hover:border-cs-red/50 hover:bg-white/10 transition-all p-5 rounded-2xl flex gap-4 items-start group shadow-sm"
          >
            <div className="p-3 bg-cs-red-bg text-cs-red rounded-xl group-hover:scale-110 transition-transform">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-white text-lg font-bold flex items-center gap-1.5">
                I have an Invite Code <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </h2>
              <p className="text-cs-gray-400 text-xs mt-1 leading-relaxed">
                My host pre-registered me and sent me an invite code or link via WhatsApp.
              </p>
            </div>
          </button>

          {/* Option B: New Walk-in */}
          <button
            onClick={() => setFlow("new")}
            className="w-full text-left bg-white/5 border border-white/10 hover:border-cs-red/50 hover:bg-white/10 transition-all p-5 rounded-2xl flex gap-4 items-start group shadow-sm"
          >
            <div className="p-3 bg-white/5 text-white rounded-xl group-hover:scale-110 transition-transform">
              <UserPlus className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-white text-lg font-bold flex items-center gap-1.5">
                I am a New Visitor <ArrowRight className="w-4 h-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </h2>
              <p className="text-cs-gray-400 text-xs mt-1 leading-relaxed">
                I do not have an invitation. I would like to register my details for a new visit.
              </p>
            </div>
          </button>
        </div>
      </div>
    );
  }

  // 2. INVITE FLOW (Enter Code)
  if (flow === "invite") {
    return (
      <div className="flex-1 flex flex-col p-6 max-w-md mx-auto w-full justify-center">
        <button 
          onClick={() => setFlow("select")}
          className="inline-flex items-center gap-1 text-sm text-cs-gray-400 hover:text-white transition-colors self-start mb-8"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="mb-8">
          <h1 className="text-white text-2xl font-bold tracking-tight">Enter Invite Code</h1>
          <p className="text-cs-gray-400 mt-1.5 text-sm">Please input the code you received via WhatsApp.</p>
        </div>

        <form onSubmit={handleInviteSubmit} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-cs-gray-400 mb-2 uppercase tracking-wider">Invite Code</label>
            <input 
              required
              autoFocus
              type="text" 
              value={inviteCode} 
              onChange={(e) => setInviteCode(e.target.value)} 
              placeholder="e.g. OS-A1B2"
              autoCapitalize="characters"
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-4 text-center text-white text-2xl font-mono tracking-widest placeholder:text-cs-gray-600 focus:outline-none focus:border-cs-red focus:ring-1 focus:ring-cs-red transition-all" 
            />
          </div>

          <button 
            disabled={isSubmitting || !inviteCode.trim()} 
            type="submit" 
            className="w-full bg-cs-red hover:bg-cs-red-dark text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-[0_0_20px_rgba(232,25,44,0.3)] disabled:opacity-50"
          >
            {isSubmitting ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Verifying...</>
            ) : (
              <>Verify & Check In <ArrowRight className="w-5 h-5" /></>
            )}
          </button>
        </form>
      </div>
    );
  }

  // 3. NEW WALKIN FORM FLOW
  return (
    <div className="flex-1 flex flex-col p-6 max-w-md mx-auto w-full py-8">
      <button 
        onClick={() => setFlow("select")}
        className="inline-flex items-center gap-1 text-sm text-cs-gray-400 hover:text-white transition-colors self-start mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back
      </button>

      <div className="mb-6">
        <h1 className="text-white text-2xl font-bold tracking-tight">Visitor Details</h1>
        <p className="text-cs-gray-400 mt-1.5 text-xs">Fill in your details to register your visit and generate your entry pass.</p>
      </div>

      <form onSubmit={handleWalkinSubmit} className="space-y-4 flex-1">
        <div>
          <label className="block text-[10px] font-semibold text-cs-gray-400 mb-1.5 uppercase tracking-wider">Full Name *</label>
          <input required type="text" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-cs-gray-600 focus:outline-none focus:border-cs-red transition-colors" placeholder="John Doe" />
        </div>
        
        <div>
          <label className="block text-[10px] font-semibold text-cs-gray-400 mb-1.5 uppercase tracking-wider">Mobile Number *</label>
          <div className="flex">
            <span className="inline-flex items-center px-3.5 rounded-l-lg border border-r-0 border-white/10 bg-white/5 text-cs-gray-400 text-sm">
              +91
            </span>
            <input required type="tel" pattern="[6789][0-9]{9}" title="Enter a valid 10-digit Indian phone number" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-r-lg px-4 py-2.5 text-white text-sm placeholder:text-cs-gray-600 focus:outline-none focus:border-cs-red transition-colors" placeholder="9876543210" />
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-semibold text-cs-gray-400 mb-1.5 uppercase tracking-wider">Email Address *</label>
          <input required type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-cs-gray-600 focus:outline-none focus:border-cs-red transition-colors" placeholder="john@example.com" />
        </div>

        <div>
          <label className="block text-[10px] font-semibold text-cs-gray-400 mb-1.5 uppercase tracking-wider">Company (Optional)</label>
          <input type="text" value={form.company} onChange={(e) => setForm({...form, company: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm placeholder:text-cs-gray-600 focus:outline-none focus:border-cs-red transition-colors" placeholder="Where do you work?" />
        </div>

        <div>
          <label className="block text-[10px] font-semibold text-cs-gray-400 mb-1.5 uppercase tracking-wider">Purpose of Visit *</label>
          <select value={form.purpose} onChange={(e) => setForm({...form, purpose: e.target.value, hostName: e.target.value !== "Meeting" && e.target.value !== "Interview" ? "" : form.hostName})} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cs-red transition-colors appearance-none bg-cs-black">
            <option value="Enquiry">Workspace Enquiry / Tour</option>
            <option value="Meeting">Meeting a Member</option>
            <option value="Event">Attending an Event</option>
            <option value="Interview">Interview</option>
          </select>
        </div>

        {form.purpose === "Enquiry" && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300">
            <label className="block text-[10px] font-semibold text-cs-gray-400 mb-1.5 uppercase tracking-wider">Interested In (Optional)</label>
            <select value={form.planType} onChange={(e) => setForm({...form, planType: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cs-red transition-colors appearance-none bg-cs-black">
              <option value="">Select a plan...</option>
              <option value="Flexi">Flexi Desk</option>
              <option value="Dedicated">Dedicated Desk</option>
              <option value="Cabin">Private Cabin</option>
              <option value="Day Pass">Day Pass</option>
            </select>
          </div>
        )}

        {(form.purpose === "Meeting" || form.purpose === "Interview") && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300">
            <label className="block text-[10px] font-semibold text-cs-gray-400 mb-1.5 uppercase tracking-wider">Who are you meeting? *</label>
            <select required value={form.hostName} onChange={(e) => setForm({...form, hostName: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cs-red transition-colors appearance-none bg-cs-black">
              <option value="">Select a host...</option>
              {members.map(m => (
                <option key={m.id} value={m.name}>{m.name}</option>
              ))}
            </select>
            <p className="text-[10px] text-cs-gray-500 mt-1">We will notify them of your arrival instantly.</p>
          </div>
        )}

        <div className="pt-6">
          <button disabled={isSubmitting} type="submit" className="w-full bg-cs-red hover:bg-cs-red-dark text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-[0_0_20px_rgba(232,25,44,0.3)] disabled:opacity-70 disabled:cursor-not-allowed">
            {isSubmitting ? (
              <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
            ) : (
              <>Register & Generate Pass <ArrowRight className="w-5 h-5" /></>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
