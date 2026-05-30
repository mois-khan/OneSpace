"use client";

import { useState } from "react";
import { usePortalMember } from "@/lib/store";
import { 
  User, 
  Building2, 
  Mail, 
  Phone,
  CreditCard,
  Lock,
  Save,
  CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function PortalSettingsPage() {
  const member = usePortalMember();
  
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  
  if (!member) return null;

  // In a real app we'd bind these to state and submit an update action.
  // For the UI mockup, we'll just show the form populated with member data.

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    }, 800);
  };

  return (
    <div className="max-w-4xl mx-auto animate-in fade-in duration-300 space-y-6">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold font-heading text-cs-black">Profile Settings</h1>
          <p className="text-cs-gray-500 mt-2 text-lg">Manage your personal information and preferences.</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        {/* Personal Info */}
        <div className="bg-white border border-cs-gray-200 rounded-2xl p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <User className="w-5 h-5 text-cs-red" />
            <h2 className="text-xl font-bold text-cs-black">Personal Information</h2>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-8 mb-8">
            <div className="shrink-0 flex flex-col items-center gap-3">
              <div className="w-24 h-24 rounded-full bg-cs-red-bg text-cs-red flex items-center justify-center font-bold text-3xl border border-cs-red/20 shadow-sm">
                {member.name.substring(0,2).toUpperCase()}
              </div>
              <button type="button" className="text-xs font-bold text-cs-gray-500 hover:text-cs-black transition-colors">
                Change Avatar
              </button>
            </div>
            
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-cs-black mb-2">Full Name</label>
                <input 
                  type="text" 
                  defaultValue={member.name}
                  className="w-full px-4 py-3 bg-cs-gray-50 border border-cs-gray-200 rounded-xl text-sm focus:ring-cs-red focus:border-cs-red"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-cs-black mb-2">Company (Optional)</label>
                <input 
                  type="text" 
                  defaultValue={member.company || ""}
                  className="w-full px-4 py-3 bg-cs-gray-50 border border-cs-gray-200 rounded-xl text-sm focus:ring-cs-red focus:border-cs-red"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-cs-black mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cs-gray-400" />
                  <input 
                    type="email" 
                    defaultValue={member.email}
                    className="w-full pl-11 pr-4 py-3 bg-cs-gray-50 border border-cs-gray-200 rounded-xl text-sm focus:ring-cs-red focus:border-cs-red"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-cs-black mb-2">Phone Number</label>
                <div className="relative">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-cs-gray-400" />
                  <input 
                    type="tel" 
                    defaultValue={member.phone}
                    className="w-full pl-11 pr-4 py-3 bg-cs-gray-50 border border-cs-gray-200 rounded-xl text-sm focus:ring-cs-red focus:border-cs-red"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Security */}
        <div className="bg-white border border-cs-gray-200 rounded-2xl p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Lock className="w-5 h-5 text-cs-red" />
            <h2 className="text-xl font-bold text-cs-black">Security</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
            <div>
              <label className="block text-sm font-semibold text-cs-black mb-2">Current Password</label>
              <input 
                type="password" 
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-cs-gray-50 border border-cs-gray-200 rounded-xl text-sm focus:ring-cs-red focus:border-cs-red"
              />
            </div>
            <div></div>
            <div>
              <label className="block text-sm font-semibold text-cs-black mb-2">New Password</label>
              <input 
                type="password" 
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-cs-gray-50 border border-cs-gray-200 rounded-xl text-sm focus:ring-cs-red focus:border-cs-red"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-cs-black mb-2">Confirm New Password</label>
              <input 
                type="password" 
                placeholder="••••••••"
                className="w-full px-4 py-3 bg-cs-gray-50 border border-cs-gray-200 rounded-xl text-sm focus:ring-cs-red focus:border-cs-red"
              />
            </div>
          </div>
        </div>

        {/* Account Details (Readonly) */}
        <div className="bg-white border border-cs-gray-200 rounded-2xl p-8 shadow-sm">
          <div className="flex items-center gap-2 mb-6">
            <Building2 className="w-5 h-5 text-cs-red" />
            <h2 className="text-xl font-bold text-cs-black">Membership Details</h2>
          </div>
          
          <div className="bg-cs-gray-50/50 border border-cs-gray-100 rounded-xl p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <div className="text-xs font-bold text-cs-gray-400 uppercase tracking-wider mb-1">Plan Type</div>
                <div className="font-semibold text-cs-black capitalize">{member.planType.replace("_", " ")}</div>
              </div>
              <div>
                <div className="text-xs font-bold text-cs-gray-400 uppercase tracking-wider mb-1">Status</div>
                <div className="font-semibold text-green-600 capitalize">{member.status}</div>
              </div>
              <div>
                <div className="text-xs font-bold text-cs-gray-400 uppercase tracking-wider mb-1">Contract End</div>
                <div className="font-semibold text-cs-black">{new Date(member.contractEnd).toLocaleDateString()}</div>
              </div>
              <div>
                <div className="text-xs font-bold text-cs-gray-400 uppercase tracking-wider mb-1">Seat Assignment</div>
                <div className="font-semibold text-cs-black">{member.seatId || "Unassigned"}</div>
              </div>
            </div>
          </div>
          <p className="text-xs text-cs-gray-500 mt-4">
            To change your membership plan or seat assignment, please contact the workspace team via the Messages tab.
          </p>
        </div>

        <div className="flex justify-end pt-4 pb-12">
          <button 
            type="submit"
            disabled={isSaving || saved}
            className={cn(
              "flex items-center gap-2 px-8 py-3.5 rounded-xl font-bold transition-all shadow-sm",
              saved 
                ? "bg-green-500 text-white" 
                : "bg-cs-black text-white hover:bg-cs-gray-700"
            )}
          >
            {saved ? (
              <><CheckCircle2 className="w-5 h-5" /> Saved Successfully</>
            ) : isSaving ? (
              "Saving..."
            ) : (
              <><Save className="w-5 h-5" /> Save Changes</>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
