"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, MapPin, CheckCircle2, ChevronRight, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function OnboardingPage() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [orgName, setOrgName] = useState("");
  const [branchCount, setBranchCount] = useState("1");
  const [branches, setBranches] = useState([{ name: "", city: "" }]);
  const [isLoading, setIsLoading] = useState(false);

  const handleNextStep = () => {
    if (step === 1 && !orgName) {
      toast.error("Please enter your organization name");
      return;
    }
    setStep(step + 1);
  };

  const handleBranchCountChange = (count: string) => {
    setBranchCount(count);
    const num = parseInt(count) || 1;
    // Adjust branches array length
    if (num > branches.length) {
      setBranches([...branches, ...Array(num - branches.length).fill({ name: "", city: "" })]);
    } else if (num < branches.length) {
      setBranches(branches.slice(0, num));
    }
  };

  const updateBranch = (index: number, field: 'name' | 'city', value: string) => {
    const newBranches = [...branches];
    newBranches[index] = { ...newBranches[index], [field]: value };
    setBranches(newBranches);
  };

  const handleComplete = () => {
    setIsLoading(true);
    // Simulate setting up the database
    setTimeout(() => {
      toast.success("Workspace configured successfully!");
      router.push("/dashboard");
    }, 1500);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-cs-gray-50 px-4">
      <div className="w-full max-w-[600px] bg-white rounded-2xl shadow-xl overflow-hidden animate-in slide-in-from-bottom-4 duration-500">
        
        {/* Progress Bar */}
        <div className="flex bg-cs-gray-50 border-b border-cs-gray-100">
          {[1, 2, 3].map((s) => (
            <div key={s} className="flex-1 flex flex-col relative">
              <div className={`h-1.5 w-full transition-colors duration-500 ${step >= s ? 'bg-cs-red' : 'bg-transparent'}`} />
              <div className="py-4 text-center">
                <span className={`text-xs font-bold uppercase tracking-wider transition-colors ${step >= s ? 'text-cs-black' : 'text-cs-gray-400'}`}>
                  {s === 1 ? 'Organization' : s === 2 ? 'Branches' : 'Finish'}
                </span>
              </div>
              {s !== 3 && <ChevronRight className="w-4 h-4 text-cs-gray-300 absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10" />}
            </div>
          ))}
        </div>

        <div className="p-10 min-h-[400px] flex flex-col justify-center">
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
              <div className="text-center mb-8">
                <div className="w-12 h-12 bg-red-50 text-cs-red rounded-full flex items-center justify-center mx-auto mb-4">
                  <Building2 className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold font-heading text-cs-black">Welcome to OneSpace!</h2>
                <p className="text-cs-gray-500 mt-2">Let's set up your coworking management platform.</p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-cs-gray-700 mb-2">What is your organization name?</label>
                <input 
                  type="text" 
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="e.g. Acme Coworking"
                  className="w-full px-4 py-3 border-2 border-cs-gray-200 rounded-xl text-base focus:outline-none focus:ring-4 focus:ring-cs-red/10 focus:border-cs-red transition-all"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-cs-gray-700 mb-2">How many branches/locations do you have?</label>
                <select 
                  value={branchCount}
                  onChange={(e) => handleBranchCountChange(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-cs-gray-200 rounded-xl text-base focus:outline-none focus:ring-4 focus:ring-cs-red/10 focus:border-cs-red transition-all appearance-none bg-white"
                >
                  {[1,2,3,4,5, "6+"].map(num => (
                    <option key={num} value={num}>{num} {num === 1 ? 'Location' : 'Locations'}</option>
                  ))}
                </select>
              </div>

              <button 
                onClick={handleNextStep}
                className="w-full bg-cs-black text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition-all flex items-center justify-center gap-2 mt-4"
              >
                Continue Setup
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6 animate-in slide-in-from-right-8 duration-300">
              <div className="text-center mb-6">
                <div className="w-12 h-12 bg-red-50 text-cs-red rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold font-heading text-cs-black">Configure Locations</h2>
                <p className="text-cs-gray-500 mt-2">Where are your {branchCount} spaces located?</p>
              </div>

              <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2 pb-2">
                {branches.map((branch, idx) => (
                  <div key={idx} className="p-4 bg-cs-gray-50 border border-cs-gray-200 rounded-xl flex gap-4">
                    <div className="flex-1">
                      <label className="block text-[10px] font-bold text-cs-gray-500 uppercase tracking-wider mb-1">Branch Name</label>
                      <input 
                        type="text" 
                        value={branch.name}
                        onChange={(e) => updateBranch(idx, 'name', e.target.value)}
                        placeholder={`e.g. ${orgName || 'HQ'} Downtown`}
                        className="w-full px-3 py-2 border border-cs-gray-200 rounded-lg text-sm focus:outline-none focus:border-cs-red"
                      />
                    </div>
                    <div className="flex-1">
                      <label className="block text-[10px] font-bold text-cs-gray-500 uppercase tracking-wider mb-1">City</label>
                      <input 
                        type="text" 
                        value={branch.city}
                        onChange={(e) => updateBranch(idx, 'city', e.target.value)}
                        placeholder="e.g. New York"
                        className="w-full px-3 py-2 border border-cs-gray-200 rounded-lg text-sm focus:outline-none focus:border-cs-red"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 mt-8">
                <button 
                  onClick={() => setStep(1)}
                  className="px-6 py-4 bg-white border-2 border-cs-gray-200 text-cs-gray-600 rounded-xl font-bold hover:bg-cs-gray-50 transition-all"
                >
                  Back
                </button>
                <button 
                  onClick={handleNextStep}
                  className="flex-1 bg-cs-black text-white py-4 rounded-xl font-bold hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
                >
                  Final Step
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6 text-center animate-in zoom-in-95 duration-500">
              <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-3xl font-bold font-heading text-cs-black">You're all set!</h2>
              <p className="text-cs-gray-500 max-w-sm mx-auto">
                We're configuring {orgName}'s workspace environment with {branchCount} locations.
              </p>

              <div className="bg-cs-gray-50 border border-cs-gray-200 rounded-xl p-4 text-left mx-auto max-w-sm my-6 space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-cs-gray-500">Organization:</span>
                  <span className="font-semibold text-cs-black">{orgName}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-cs-gray-500">Locations:</span>
                  <span className="font-semibold text-cs-black">{branchCount}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-cs-gray-500">Plan:</span>
                  <span className="font-semibold text-cs-red bg-red-50 px-2 py-0.5 rounded-full">Pro Trial</span>
                </div>
              </div>

              <button 
                onClick={handleComplete}
                disabled={isLoading}
                className="w-full bg-cs-red text-white py-4 rounded-xl font-bold text-lg hover:bg-cs-red-dark transition-all shadow-lg hover:shadow-cs-red/20 flex justify-center items-center gap-2 disabled:opacity-70"
              >
                {isLoading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Setting up...
                  </>
                ) : (
                  "Go to Dashboard"
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
