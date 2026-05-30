"use client";

import { useState } from "react";
import { useAppActions } from "@/lib/store";
import { CheckCircle2, QrCode, ArrowRight } from "lucide-react";
import Link from "next/link";

export default function WalkinPage() {
  const { addLead, checkInVisitor } = useAppActions();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    company: "",
    phone: "",
    email: "",
    purpose: "Enquiry",
    planType: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // 1. Add to Leads
    addLead({
      name: form.name,
      company: form.company || undefined,
      email: form.email || undefined,
      phone: form.phone,
      planType: form.planType || "Flexi",
      source: "Walk-in",
      stage: "new",
      branchId: "b2", // Defaulting to Hitech City for walk-ins
    });

    // 2. Add to Visitors
    checkInVisitor({
      branchId: "b2",
      name: form.name,
      phone: form.phone,
      purpose: form.purpose,
    });

    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-white">
        <div className="w-16 h-16 bg-status-green/20 rounded-full flex items-center justify-center mb-6 animate-in zoom-in duration-300">
          <CheckCircle2 className="w-8 h-8 text-status-green" />
        </div>
        <h1 className="text-2xl font-bold mb-2">Welcome, {form.name.split(" ")[0]}!</h1>
        <p className="text-cs-gray-400 mb-8 max-w-xs">
          Your details have been registered. Please present this entry pass at the front desk.
        </p>
        
        <div className="bg-white p-4 rounded-xl shadow-2xl mb-8">
          {/* Simulated QR Code using SVG patterns */}
          <div className="w-48 h-48 bg-cs-gray-100 flex items-center justify-center relative overflow-hidden">
            <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="qr" width="10" height="10" patternUnits="userSpaceOnUse">
                  <rect width="5" height="5" fill="#0D1B2A" />
                  <rect x="5" y="5" width="5" height="5" fill="#0D1B2A" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#qr)" />
              <rect x="25%" y="25%" width="50%" height="50%" fill="white" />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <QrCode className="w-12 h-12 text-cs-black" />
            </div>
          </div>
          <div className="mt-3 text-xs font-bold text-cs-black tracking-[0.2em] uppercase">
            PASS-{Math.random().toString(36).substring(2, 8)}
          </div>
        </div>

        <p className="text-sm text-cs-gray-500 mb-6">
          We've also sent this pass to your WhatsApp.
        </p>

        <button 
          onClick={() => { setForm({name:"", company:"", phone:"", email:"", purpose:"Enquiry", planType:""}); setIsSubmitted(false); }}
          className="text-sm text-cs-gray-400 hover:text-white transition-colors"
        >
          Register another guest
        </button>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col p-6 max-w-md mx-auto w-full">
      <div className="mt-8 mb-10">
        <div className="text-cs-red font-bold text-2xl tracking-tight mb-2">CallShield<span className="text-white">.</span></div>
        <h1 className="text-white text-3xl font-bold tracking-tight">Welcome to <br/>CS Coworking</h1>
        <p className="text-cs-gray-400 mt-2 text-sm">Please register your visit to get your entry pass.</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 flex-1">
        <div>
          <label className="block text-xs font-medium text-cs-gray-400 mb-1.5 uppercase tracking-wider">Full Name *</label>
          <input required type="text" value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-cs-gray-600 focus:outline-none focus:border-cs-red transition-colors" placeholder="e.g. John Doe" />
        </div>
        
        <div>
          <label className="block text-xs font-medium text-cs-gray-400 mb-1.5 uppercase tracking-wider">Mobile Number *</label>
          <input required type="tel" value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-cs-gray-600 focus:outline-none focus:border-cs-red transition-colors" placeholder="+91 98765 43210" />
        </div>

        <div>
          <label className="block text-xs font-medium text-cs-gray-400 mb-1.5 uppercase tracking-wider">Email Address *</label>
          <input required type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-cs-gray-600 focus:outline-none focus:border-cs-red transition-colors" placeholder="john@example.com" />
        </div>

        <div>
          <label className="block text-xs font-medium text-cs-gray-400 mb-1.5 uppercase tracking-wider">Company (Optional)</label>
          <input type="text" value={form.company} onChange={(e) => setForm({...form, company: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white placeholder:text-cs-gray-600 focus:outline-none focus:border-cs-red transition-colors" placeholder="Where do you work?" />
        </div>

        <div>
          <label className="block text-xs font-medium text-cs-gray-400 mb-1.5 uppercase tracking-wider">Purpose of Visit *</label>
          <select value={form.purpose} onChange={(e) => setForm({...form, purpose: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cs-red transition-colors appearance-none">
            <option value="Enquiry" className="bg-cs-black">Workspace Enquiry / Tour</option>
            <option value="Meeting" className="bg-cs-black">Meeting a Member</option>
            <option value="Event" className="bg-cs-black">Attending an Event</option>
            <option value="Interview" className="bg-cs-black">Interview</option>
          </select>
        </div>

        {form.purpose === "Enquiry" && (
          <div className="animate-in fade-in slide-in-from-top-2 duration-300">
            <label className="block text-xs font-medium text-cs-gray-400 mb-1.5 uppercase tracking-wider">Interested In (Optional)</label>
            <select value={form.planType} onChange={(e) => setForm({...form, planType: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-cs-red transition-colors appearance-none">
              <option value="" className="bg-cs-black">Select a plan...</option>
              <option value="Flexi" className="bg-cs-black">Flexi Desk</option>
              <option value="Dedicated" className="bg-cs-black">Dedicated Desk</option>
              <option value="Cabin" className="bg-cs-black">Private Cabin</option>
              <option value="Day Pass" className="bg-cs-black">Day Pass</option>
            </select>
          </div>
        )}

        <div className="pt-6 pb-8">
          <button type="submit" className="w-full bg-cs-red hover:bg-cs-red-dark text-white font-semibold py-4 rounded-xl flex items-center justify-center gap-2 transition-colors shadow-[0_0_20px_rgba(232,25,44,0.3)]">
            Generate Entry Pass <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </form>
    </div>
  );
}
