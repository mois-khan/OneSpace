"use client";

import React, { useState } from "react";
import { X, CheckCircle2, ChevronRight, UploadCloud, FileText, CreditCard, MapPin } from "lucide-react";

interface OnboardingWizardProps {
  isOpen: boolean;
  onClose: () => void;
}

export function OnboardingWizard({ isOpen, onClose }: OnboardingWizardProps) {
  const [step, setStep] = useState(1);
  const [isSimulatingPayment, setIsSimulatingPayment] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  // Form states
  const [name, setName] = useState("");
  const [plan, setPlan] = useState("");
  const [seat, setSeat] = useState("");

  if (!isOpen) return null;

  const handleNext = () => setStep(s => Math.min(s + 1, 4));
  const handlePrev = () => setStep(s => Math.max(s - 1, 1));

  const handleComplete = () => {
    setIsSimulatingPayment(true);
    setTimeout(() => {
      setIsSimulatingPayment(false);
      setIsComplete(true);
    }, 1500);
  };

  const handleFinish = () => {
    setStep(1);
    setIsComplete(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col h-[600px] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-cs-gray-200 flex items-center justify-between">
          <h2 className="text-xl font-bold font-heading text-cs-black">Onboard New Member</h2>
          <button onClick={onClose} className="p-2 text-cs-gray-500 hover:bg-cs-gray-100 rounded-md">
            <X className="w-5 h-5" />
          </button>
        </div>

        {isComplete ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold text-cs-black mb-2">Member Onboarded!</h3>
            <p className="text-cs-gray-600 mb-8 max-w-sm">
              {name || "The member"} has been successfully added to {seat || "their seat"} and their first invoice is paid.
            </p>
            <button 
              onClick={handleFinish}
              className="px-6 py-3 bg-cs-black text-white rounded-lg font-medium hover:bg-cs-gray-700 transition-colors"
            >
              Go to Profile
            </button>
          </div>
        ) : (
          <>
            {/* Step Progress */}
            <div className="bg-cs-gray-50 border-b border-cs-gray-200 px-6 py-4">
              <div className="flex items-center justify-between">
                {[
                  { num: 1, label: "Details" },
                  { num: 2, label: "Plan & Seat" },
                  { num: 3, label: "Docs" },
                  { num: 4, label: "Payment" }
                ].map((s, i) => (
                  <React.Fragment key={s.num}>
                    <div className={`flex items-center gap-2 ${step >= s.num ? 'text-cs-red' : 'text-cs-gray-400'}`}>
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold border-2 ${step >= s.num ? 'border-cs-red bg-cs-red-bg' : 'border-cs-gray-300'}`}>
                        {s.num}
                      </div>
                      <span className="text-sm font-semibold hidden sm:inline">{s.label}</span>
                    </div>
                    {i < 3 && <div className={`flex-1 h-0.5 mx-4 ${step > s.num ? 'bg-cs-red' : 'bg-cs-gray-200'}`} />}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Content Body */}
            <div className="flex-1 overflow-y-auto p-8">
              {step === 1 && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                  <h3 className="text-lg font-semibold text-cs-black">Personal Details</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-cs-gray-500 uppercase">Full Name *</label>
                      <input value={name} onChange={e => setName(e.target.value)} type="text" className="w-full px-3 py-2 border border-cs-gray-200 rounded-lg focus:ring-2 focus:ring-cs-red/20 outline-none" placeholder="John Doe" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-semibold text-cs-gray-500 uppercase">Phone *</label>
                      <input type="tel" className="w-full px-3 py-2 border border-cs-gray-200 rounded-lg focus:ring-2 focus:ring-cs-red/20 outline-none" placeholder="+91 98765 43210" />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <label className="text-xs font-semibold text-cs-gray-500 uppercase">Email *</label>
                      <input type="email" className="w-full px-3 py-2 border border-cs-gray-200 rounded-lg focus:ring-2 focus:ring-cs-red/20 outline-none" placeholder="john@example.com" />
                    </div>
                    <div className="col-span-2 space-y-1">
                      <label className="text-xs font-semibold text-cs-gray-500 uppercase">Company Name</label>
                      <input type="text" className="w-full px-3 py-2 border border-cs-gray-200 rounded-lg focus:ring-2 focus:ring-cs-red/20 outline-none" placeholder="Acme Corp (Optional)" />
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                  <h3 className="text-lg font-semibold text-cs-black">Plan & Seat Assignment</h3>
                  <div className="grid grid-cols-3 gap-3">
                    {["Flexi Desk", "Dedicated Desk", "Private Cabin"].map(p => (
                      <button 
                        key={p} 
                        onClick={() => setPlan(p)}
                        className={`p-4 border rounded-xl text-left transition-colors ${plan === p ? 'border-cs-red bg-cs-red-bg shadow-sm' : 'border-cs-gray-200 hover:border-cs-gray-300'}`}
                      >
                        <div className={`w-4 h-4 rounded-full border mb-3 flex items-center justify-center ${plan === p ? 'border-cs-red' : 'border-cs-gray-300'}`}>
                          {plan === p && <div className="w-2 h-2 rounded-full bg-cs-red" />}
                        </div>
                        <p className={`text-sm font-semibold ${plan === p ? 'text-cs-red' : 'text-cs-gray-700'}`}>{p}</p>
                      </button>
                    ))}
                  </div>

                  <div className="pt-4 border-t border-cs-gray-100">
                    <label className="text-xs font-semibold text-cs-gray-500 uppercase mb-2 block">Seat Assignment</label>
                    <div className="flex items-center gap-3">
                      <input 
                        readOnly 
                        value={seat} 
                        placeholder="No seat assigned" 
                        className="flex-1 bg-cs-gray-50 border border-cs-gray-200 px-3 py-2 rounded-lg text-sm outline-none"
                      />
                      <button 
                        onClick={() => setSeat("DD-05")} 
                        className="px-4 py-2 bg-white border border-cs-gray-200 rounded-lg text-sm font-medium hover:bg-cs-gray-50 flex items-center gap-2"
                      >
                        <MapPin className="w-4 h-4" /> Auto-assign from Map
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                  <h3 className="text-lg font-semibold text-cs-black">Documentation</h3>
                  
                  <div className="border-2 border-dashed border-cs-gray-300 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-cs-gray-50 cursor-pointer transition-colors">
                    <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-3">
                      <UploadCloud className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-semibold text-cs-black">Upload ID Proof (Aadhaar/PAN)</p>
                    <p className="text-xs text-cs-gray-500 mt-1">Drag and drop or click to browse</p>
                  </div>

                  <div className="bg-white border border-cs-gray-200 rounded-xl p-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="w-8 h-8 text-cs-gray-400" />
                      <div>
                        <p className="text-sm font-semibold text-cs-black">Membership Agreement</p>
                        <p className="text-xs text-cs-gray-500">Auto-generated PDF</p>
                      </div>
                    </div>
                    <button className="text-sm font-medium text-cs-red hover:underline">Preview</button>
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                  <h3 className="text-lg font-semibold text-cs-black">Initial Payment</h3>
                  
                  <div className="bg-cs-gray-50 border border-cs-gray-200 rounded-xl p-5">
                    <div className="flex justify-between items-center mb-4 pb-4 border-b border-cs-gray-200">
                      <span className="text-sm text-cs-gray-600">Plan: {plan || "Selected Plan"}</span>
                      <span className="font-semibold text-cs-black">₹12,000</span>
                    </div>
                    <div className="flex justify-between items-center mb-4 pb-4 border-b border-cs-gray-200">
                      <span className="text-sm text-cs-gray-600">Security Deposit (2 months)</span>
                      <span className="font-semibold text-cs-black">₹24,000</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-bold text-cs-black">Total Due Today</span>
                      <span className="text-xl font-bold text-cs-red">₹36,000</span>
                    </div>
                  </div>

                  <button className="w-full py-3 bg-white border border-cs-gray-200 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 hover:bg-cs-gray-50 transition-colors shadow-sm">
                    <CreditCard className="w-4 h-4 text-cs-gray-500" /> Send Payment Link (WhatsApp)
                  </button>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-cs-gray-200 bg-white flex items-center justify-between">
              <button 
                onClick={handlePrev}
                disabled={step === 1}
                className="px-4 py-2 text-sm font-medium text-cs-gray-500 hover:text-cs-black disabled:opacity-30 disabled:hover:text-cs-gray-500 transition-colors"
              >
                Back
              </button>
              
              {step < 4 ? (
                <button 
                  onClick={handleNext}
                  className="px-5 py-2 bg-cs-black text-white rounded-lg text-sm font-medium hover:bg-cs-gray-800 flex items-center gap-2 transition-colors"
                >
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button 
                  onClick={handleComplete}
                  disabled={isSimulatingPayment}
                  className="px-5 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 flex items-center gap-2 transition-colors shadow-sm"
                >
                  {isSimulatingPayment ? "Processing..." : "Activate Member"}
                </button>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
