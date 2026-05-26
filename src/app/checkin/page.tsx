"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowRight, MapPin, QrCode } from "lucide-react";
import { useBranches } from "@/lib/store";

export default function CheckinLandingPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const branchId = searchParams.get("branch") || "b2";
  const branches = useBranches();
  const branch = branches.find((b) => b.id === branchId);
  const [code, setCode] = useState("");

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = code.trim().toUpperCase();
    if (!clean) return;
    router.push(`/checkin/${clean}`);
  };

  return (
    <div className="min-h-screen bg-cs-gray-50 flex flex-col">
      <header className="px-5 py-4 border-b border-cs-gray-200 bg-white flex items-center gap-2">
        <div className="w-6 h-6 bg-cs-red flex items-center justify-center font-bold text-xs text-white rounded">
          CS
        </div>
        <span className="text-[14px] font-semibold text-cs-black font-heading">OneSpace</span>
        <span className="ml-auto inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-cs-gray-500">
          <MapPin className="w-3 h-3" />
          {branch ? branch.name : "Front desk"}
        </span>
      </header>

      <main className="flex-1 px-5 py-8 max-w-md mx-auto w-full">
        <div className="text-center mb-8">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-cs-red-bg flex items-center justify-center mb-3">
            <QrCode className="w-7 h-7 text-cs-red" />
          </div>
          <div className="text-[10px] uppercase tracking-[0.2em] text-cs-gray-500">
            Welcome to {branch ? branch.name : "CS Coworking"}
          </div>
          <h1 className="text-[24px] font-bold font-heading text-cs-black mt-1">
            Tap to check in
          </h1>
          <p className="text-[13px] text-cs-gray-500 mt-1.5">
            Enter the invite code your host sent you on WhatsApp.
          </p>
        </div>

        <form onSubmit={submit} className="space-y-3">
          <div className="space-y-1.5">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-cs-gray-500">
              Invite code
            </label>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="e.g. OS-V8K2"
              autoCapitalize="characters"
              className="w-full px-4 py-3 border border-cs-gray-200 rounded-xl text-[18px] font-mono tracking-[0.15em] text-center text-cs-black focus:outline-none focus:ring-2 focus:ring-cs-red/30 focus:border-cs-red transition-all bg-white"
            />
          </div>

          <button
            type="submit"
            disabled={!code.trim()}
            className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-cs-red text-white text-[15px] font-semibold hover:bg-cs-red-dark transition-colors disabled:opacity-50"
          >
            Continue <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-cs-gray-200 text-center">
          <p className="text-[12px] text-cs-gray-500">
            No invite? Walk up to reception — we&apos;ll get you sorted in 30 seconds.
          </p>
        </div>
      </main>
    </div>
  );
}
