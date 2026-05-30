"use client";

import { useState } from "react";
import { useAppActions, useAllMembers, usePreRegistrations } from "@/lib/store";
import { CheckCircle2, QrCode, ArrowRight, ArrowLeft, Loader2, UserPlus, KeyRound, Ticket, Home } from "lucide-react";
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
      // 1. Convert Pre-Registration
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
      // 1. Add to Visitors Log
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

  return (
    <div className="flex-1 flex flex-col min-h-screen">
      {/* Top Header */}
      <div className="w-full bg-white border-b border-cs-gray-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-cs-red flex items-center justify-center font-bold text-sm text-white rounded">
            CS
          </div>
          <span className="text-cs-black font-bold tracking-widest uppercase font-heading text-sm">
            OneSpace Walk-In
          </span>
        </div>
        <Link 
          href="/"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-cs-gray-500 hover:text-cs-black bg-cs-gray-50 hover:bg-cs-gray-100 px-3 py-1.5 rounded-lg border border-cs-gray-200 transition-colors"
        >
          <Home className="w-4 h-4" /> Back to Dashboard
        </Link>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 w-full max-w-lg mx-auto relative">
        
        {/* SUCCESS SCREEN */}
        {isSubmitted ? (
          <div className="w-full flex flex-col items-center animate-in zoom-in-95 duration-300 py-10">
            <div className="w-16 h-16 bg-status-green/10 rounded-full flex items-center justify-center mb-6 shadow-sm ring-1 ring-status-green/20">
              <CheckCircle2 className="w-8 h-8 text-status-green" />
            </div>
            <h1 className="text-3xl font-extrabold text-cs-black tracking-tight mb-2">Welcome, {successDetails.name.split(" ")[0]}!</h1>
            <p className="text-cs-gray-500 mb-8 max-w-sm text-center text-sm leading-relaxed">
              Your check-in is complete. Please display this pass at the front desk.
            </p>

            {/* Premium Digital Entry Ticket Pass */}
            <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden border border-cs-gray-200 relative mb-8">
              
              {/* Ticket Header */}
              <div className="bg-cs-gray-50 p-4 text-left flex justify-between items-center border-b border-cs-gray-200">
                <div className="flex items-center gap-2">
                  <div className="w-5 h-5 bg-cs-red flex items-center justify-center font-bold text-[10px] text-white rounded shadow-sm">CS</div>
                  <span className="text-xs font-bold text-cs-black tracking-wider uppercase font-heading">OneSpace</span>
                </div>
                <span className="inline-flex items-center gap-1 bg-status-green/10 text-status-green px-2 py-0.5 rounded text-[10px] font-semibold border border-status-green/20 uppercase tracking-wide">
                  Verified
                </span>
              </div>

              {/* Ticket Body */}
              <div className="p-6 text-left space-y-6">
                
                {/* Entry Message */}
                <div className="bg-status-green/5 border border-status-green/20 rounded-xl p-4 text-center flex flex-col items-center gap-1.5 shadow-sm">
                  <Ticket className="w-5 h-5 text-status-green animate-pulse" />
                  <div className="text-sm font-bold text-status-green">
                    As a registered user, entry is allowed.
                  </div>
                  <div className="text-[10px] text-cs-gray-500 font-medium">Front desk entry clearance active</div>
                </div>

                {/* QR Code Container */}
                <div className="flex justify-center py-2">
                  <div className="bg-white p-3 rounded-xl border border-cs-gray-200 shadow-sm relative">
                    <svg width="120" height="120" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <pattern id="qr-success" width="8" height="8" patternUnits="userSpaceOnUse">
                          <rect width="4" height="4" fill="#0F172A" />
                          <rect x="4" y="4" width="4" height="4" fill="#0F172A" />
                        </pattern>
                      </defs>
                      <rect width="100%" height="100%" fill="url(#qr-success)" />
                      <rect x="35%" y="35%" width="30%" height="30%" fill="white" />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-white p-1.5 rounded-lg shadow-sm border border-cs-gray-100">
                        <QrCode className="w-6 h-6 text-cs-red" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pass ID */}
                <div className="text-center">
                  <div className="text-[10px] uppercase tracking-[0.15em] text-cs-gray-400 font-bold">Entry Pass ID</div>
                  <div className="text-2xl font-bold font-mono tracking-widest text-cs-black mt-1">
                    {successDetails.code}
                  </div>
                </div>

                {/* Meta details list */}
                <div className="border-t border-cs-gray-100 pt-5 grid grid-cols-2 gap-y-4 gap-x-3 text-sm">
                  <div>
                    <div className="text-cs-gray-400 uppercase tracking-wider text-[10px] font-bold">Guest Name</div>
                    <div className="font-semibold text-cs-black truncate mt-1">{successDetails.name}</div>
                  </div>
                  <div>
                    <div className="text-cs-gray-400 uppercase tracking-wider text-[10px] font-bold">Visit Purpose</div>
                    <div className="font-semibold text-cs-black truncate mt-1">{successDetails.purpose}</div>
                  </div>
                  <div className="col-span-2">
                    <div className="text-cs-gray-400 uppercase tracking-wider text-[10px] font-bold">Host / Meeting With</div>
                    <div className="font-semibold text-cs-black truncate mt-1">{successDetails.hostName}</div>
                  </div>
                </div>
              </div>

              {/* Ticket jagged edge */}
              <div className="h-2.5 bg-[#F8F6F4] flex justify-between overflow-hidden border-t border-cs-gray-200">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div key={i} className="w-2.5 h-2.5 bg-[#F8F6F4] rounded-full -mt-1.5 shrink-0 border border-cs-gray-200" />
                ))}
              </div>
            </div>

            <p className="text-xs text-cs-gray-500 max-w-xs text-center leading-relaxed font-medium">
              We&apos;ve sent a digital copy of this pass to your WhatsApp.
            </p>

            <button 
              onClick={handleReset}
              className="mt-8 text-sm font-semibold text-cs-red hover:text-cs-red-dark transition-colors"
            >
              Register another guest
            </button>
          </div>
        ) : flow === "select" ? (
          /* SELECT FLOW */
          <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-300">
            <div className="text-center mb-10">
              <h1 className="text-cs-black text-3xl font-extrabold tracking-tight mt-4">Welcome to CS Coworking</h1>
              <p className="text-cs-gray-500 mt-2 text-base">Please select how you would like to register your visit today.</p>
            </div>

            <div className="space-y-4">
              <button
                onClick={() => setFlow("invite")}
                className="w-full text-left bg-white border border-cs-gray-200 hover:border-cs-red hover:shadow-md transition-all p-5 rounded-2xl flex gap-4 items-start group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cs-red/0 via-cs-red/5 to-cs-red/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="p-3 bg-cs-red-bg text-cs-red rounded-xl group-hover:scale-110 transition-transform shadow-sm relative z-10">
                  <KeyRound className="w-6 h-6" />
                </div>
                <div className="relative z-10 flex-1">
                  <h2 className="text-cs-black text-lg font-bold flex items-center justify-between">
                    I have an Invite Code 
                    <ArrowRight className="w-5 h-5 text-cs-red opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </h2>
                  <p className="text-cs-gray-500 text-sm mt-1 leading-relaxed pr-6">
                    My host pre-registered me and sent me an invite code or link via WhatsApp.
                  </p>
                </div>
              </button>

              <button
                onClick={() => setFlow("new")}
                className="w-full text-left bg-white border border-cs-gray-200 hover:border-cs-gray-300 hover:shadow-md transition-all p-5 rounded-2xl flex gap-4 items-start group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cs-gray-100/0 via-cs-gray-100/50 to-cs-gray-100/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="p-3 bg-cs-gray-50 text-cs-gray-700 rounded-xl group-hover:scale-110 transition-transform shadow-sm relative z-10 border border-cs-gray-200">
                  <UserPlus className="w-6 h-6" />
                </div>
                <div className="relative z-10 flex-1">
                  <h2 className="text-cs-black text-lg font-bold flex items-center justify-between">
                    I am a New Visitor 
                    <ArrowRight className="w-5 h-5 text-cs-gray-600 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </h2>
                  <p className="text-cs-gray-500 text-sm mt-1 leading-relaxed pr-6">
                    I do not have an invitation. I would like to register my details for a new visit.
                  </p>
                </div>
              </button>
            </div>
          </div>
        ) : flow === "invite" ? (
          /* INVITE FLOW */
          <div className="w-full animate-in fade-in slide-in-from-right-4 duration-300">
            <button 
              onClick={() => setFlow("select")}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-cs-gray-500 hover:text-cs-black transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4" /> Back to selection
            </button>

            <div className="mb-8">
              <h1 className="text-cs-black text-3xl font-extrabold tracking-tight">Enter Invite Code</h1>
              <p className="text-cs-gray-500 mt-2 text-sm">Please input the code you received via WhatsApp from your host.</p>
            </div>

            <form onSubmit={handleInviteSubmit} className="space-y-6">
              <div>
                <label className="block text-xs font-bold text-cs-gray-500 mb-2 uppercase tracking-widest">Invite Code</label>
                <input 
                  required
                  autoFocus
                  type="text" 
                  value={inviteCode} 
                  onChange={(e) => setInviteCode(e.target.value)} 
                  placeholder="e.g. OS-A1B2"
                  autoCapitalize="characters"
                  className="w-full bg-white border border-cs-gray-300 rounded-xl px-5 py-5 text-center text-cs-black text-3xl font-mono font-bold tracking-widest placeholder:text-cs-gray-300 placeholder:font-normal focus:outline-none focus:border-cs-red focus:ring-2 focus:ring-cs-red/20 transition-all shadow-sm uppercase" 
                />
              </div>

              <button 
                disabled={isSubmitting || !inviteCode.trim()} 
                type="submit" 
                className="w-full bg-cs-red hover:bg-cs-red-dark text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:shadow-none"
              >
                {isSubmitting ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Verifying...</>
                ) : (
                  <>Verify & Check In <ArrowRight className="w-5 h-5" /></>
                )}
              </button>
            </form>
          </div>
        ) : (
          /* NEW WALKIN FLOW */
          <div className="w-full animate-in fade-in slide-in-from-right-4 duration-300 pb-12">
            <button 
              onClick={() => setFlow("select")}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-cs-gray-500 hover:text-cs-black transition-colors mb-6"
            >
              <ArrowLeft className="w-4 h-4" /> Back to selection
            </button>

            <div className="mb-8">
              <h1 className="text-cs-black text-3xl font-extrabold tracking-tight">Visitor Details</h1>
              <p className="text-cs-gray-500 mt-2 text-sm">Fill in your details to register your visit and generate your entry pass.</p>
            </div>

            <form onSubmit={handleWalkinSubmit} className="space-y-5 bg-white p-6 rounded-2xl border border-cs-gray-200 shadow-sm">
              <div>
                <label className="block text-[11px] font-bold text-cs-gray-500 mb-1.5 uppercase tracking-wider">Full Name *</label>
                <input required type="text" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="w-full bg-white border border-cs-gray-300 rounded-lg px-4 py-3 text-cs-black text-sm placeholder:text-cs-gray-400 focus:outline-none focus:border-cs-red focus:ring-1 focus:ring-cs-red transition-all" placeholder="John Doe" />
              </div>
              
              <div>
                <label className="block text-[11px] font-bold text-cs-gray-500 mb-1.5 uppercase tracking-wider">Mobile Number *</label>
                <div className="flex shadow-sm rounded-lg">
                  <span className="inline-flex items-center px-4 rounded-l-lg border border-r-0 border-cs-gray-300 bg-cs-gray-50 text-cs-gray-600 text-sm font-medium">
                    +91
                  </span>
                  <input required type="tel" pattern="[6789][0-9]{9}" title="Enter a valid 10-digit Indian phone number" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} className="w-full bg-white border border-cs-gray-300 rounded-r-lg px-4 py-3 text-cs-black text-sm placeholder:text-cs-gray-400 focus:outline-none focus:border-cs-red focus:ring-1 focus:ring-cs-red transition-all" placeholder="9876543210" />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-cs-gray-500 mb-1.5 uppercase tracking-wider">Email Address *</label>
                <input required type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} className="w-full bg-white border border-cs-gray-300 rounded-lg px-4 py-3 text-cs-black text-sm placeholder:text-cs-gray-400 focus:outline-none focus:border-cs-red focus:ring-1 focus:ring-cs-red transition-all" placeholder="john@example.com" />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-cs-gray-500 mb-1.5 uppercase tracking-wider">Company (Optional)</label>
                <input type="text" value={form.company} onChange={(e) => setForm({...form, company: e.target.value})} className="w-full bg-white border border-cs-gray-300 rounded-lg px-4 py-3 text-cs-black text-sm placeholder:text-cs-gray-400 focus:outline-none focus:border-cs-red focus:ring-1 focus:ring-cs-red transition-all" placeholder="Where do you work?" />
              </div>

              <div className="pt-2">
                <label className="block text-[11px] font-bold text-cs-gray-500 mb-1.5 uppercase tracking-wider">Purpose of Visit *</label>
                <select value={form.purpose} onChange={(e) => setForm({...form, purpose: e.target.value, hostName: e.target.value !== "Meeting" && e.target.value !== "Interview" ? "" : form.hostName})} className="w-full bg-white border border-cs-gray-300 rounded-lg px-4 py-3 text-cs-black text-sm focus:outline-none focus:border-cs-red focus:ring-1 focus:ring-cs-red transition-all shadow-sm font-medium">
                  <option value="Enquiry">Workspace Enquiry / Tour</option>
                  <option value="Meeting">Meeting a Member</option>
                  <option value="Event">Attending an Event</option>
                  <option value="Interview">Interview</option>
                </select>
              </div>

              {form.purpose === "Enquiry" && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="block text-[11px] font-bold text-cs-gray-500 mb-1.5 uppercase tracking-wider">Interested In (Optional)</label>
                  <select value={form.planType} onChange={(e) => setForm({...form, planType: e.target.value})} className="w-full bg-white border border-cs-gray-300 rounded-lg px-4 py-3 text-cs-black text-sm focus:outline-none focus:border-cs-red focus:ring-1 focus:ring-cs-red transition-all shadow-sm font-medium">
                    <option value="" disabled>Select a plan...</option>
                    <option value="Flexi">Flexi Desk</option>
                    <option value="Dedicated">Dedicated Desk</option>
                    <option value="Cabin">Private Cabin</option>
                    <option value="Day Pass">Day Pass</option>
                  </select>
                </div>
              )}

              {(form.purpose === "Meeting" || form.purpose === "Interview") && (
                <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                  <label className="block text-[11px] font-bold text-cs-gray-500 mb-1.5 uppercase tracking-wider">Who are you meeting? *</label>
                  <select required value={form.hostName} onChange={(e) => setForm({...form, hostName: e.target.value})} className="w-full bg-white border border-cs-gray-300 rounded-lg px-4 py-3 text-cs-black text-sm focus:outline-none focus:border-cs-red focus:ring-1 focus:ring-cs-red transition-all shadow-sm font-medium">
                    <option value="" disabled>Select a host...</option>
                    {members.map(m => (
                      <option key={m.id} value={m.name}>{m.name}</option>
                    ))}
                  </select>
                  <p className="text-xs text-cs-gray-500 mt-2 font-medium">We will notify them of your arrival instantly.</p>
                </div>
              )}

              <div className="pt-6">
                <button disabled={isSubmitting} type="submit" className="w-full bg-cs-red hover:bg-cs-red-dark text-white font-bold py-4 rounded-xl flex items-center justify-center gap-2 transition-all shadow-md hover:shadow-lg disabled:opacity-70 disabled:shadow-none">
                  {isSubmitting ? (
                    <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>
                  ) : (
                    <>Register & Generate Pass <ArrowRight className="w-5 h-5" /></>
                  )}
                </button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}
