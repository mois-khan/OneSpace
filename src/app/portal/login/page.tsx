"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAllMembers, useAppActions } from "@/lib/store/hooks";
import { Building2, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export default function PortalLogin() {
  const members = useAllMembers();
  const { portalLogin } = useAppActions();
  const router = useRouter();
  
  const [selectedMemberId, setSelectedMemberId] = useState("");

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMemberId) return;
    portalLogin(selectedMemberId);
    router.push("/portal");
  };

  return (
    <div className="min-h-screen bg-cs-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <div className="mx-auto w-12 h-12 rounded bg-cs-red flex items-center justify-center text-white font-bold text-2xl mb-4 shadow-sm">
          O
        </div>
        <h2 className="mt-2 text-3xl font-extrabold font-heading text-cs-black">
          Member Portal
        </h2>
        <p className="mt-2 text-sm text-cs-gray-500">
          Sign in to manage your workspace and bookings
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-4 shadow-sm sm:rounded-xl sm:px-10 border border-cs-gray-200">
          <form className="space-y-6" onSubmit={handleLogin}>
            <div>
              <label htmlFor="member" className="block text-sm font-medium text-cs-gray-700">
                Select Member (Mock Login)
              </label>
              <div className="mt-2 relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Building2 className="h-4 w-4 text-cs-gray-400" />
                </div>
                <select
                  id="member"
                  className="block w-full pl-10 pr-3 py-2.5 border border-cs-gray-300 rounded-lg focus:ring-cs-red focus:border-cs-red sm:text-sm text-cs-black cursor-pointer bg-white"
                  value={selectedMemberId}
                  onChange={(e) => setSelectedMemberId(e.target.value)}
                  required
                >
                  <option value="" disabled>Select a member...</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name} {m.company ? `(${m.company})` : ""}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={!selectedMemberId}
                className={cn(
                  "w-full flex justify-center py-2.5 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cs-red group",
                  selectedMemberId
                    ? "bg-cs-red hover:bg-cs-red-dark"
                    : "bg-cs-gray-300 cursor-not-allowed"
                )}
              >
                Continue to Portal
                <ArrowRight className="ml-2 w-4 h-4 opacity-70 group-hover:opacity-100 transition-opacity group-hover:translate-x-1 duration-200" />
              </button>
            </div>
          </form>
          
          <div className="mt-6 text-center text-xs text-cs-gray-400">
            Internal Dev Tool: Use this dropdown to simulate logging in as any active member.
          </div>
        </div>
      </div>
    </div>
  );
}
