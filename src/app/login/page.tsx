"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building2, ArrowRight } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate network delay for effect
    setTimeout(() => {
      router.push("/dashboard");
    }, 600);
  };

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      router.push("/onboarding");
    }, 600);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-cs-hero-from via-[#1a0a0a] to-cs-hero-to px-4">
      <div className="w-full max-w-[420px] p-8 bg-white rounded-2xl shadow-2xl animate-in fade-in zoom-in-95 duration-500">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-2">
            <div className="w-10 h-10 bg-cs-red text-white font-bold flex items-center justify-center rounded-xl shadow-sm">
              <Building2 className="w-5 h-5" />
            </div>
            <h1 className="text-3xl font-bold font-heading text-cs-black tracking-tight">OneSpace</h1>
          </div>
          <p className="text-cs-gray-500 text-sm">The operating system for modern workspaces.</p>
        </div>
        
        <form className="space-y-5">
          <div>
            <label className="block text-[11px] font-bold text-cs-gray-600 uppercase tracking-wider mb-2">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-cs-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cs-red/20 focus:border-cs-red transition-all"
              placeholder="you@company.com"
              required
            />
          </div>
          <div>
            <label className="block text-[11px] font-bold text-cs-gray-600 uppercase tracking-wider mb-2">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-cs-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-cs-red/20 focus:border-cs-red transition-all"
              placeholder="••••••••"
              required
            />
          </div>
          
          <div className="pt-2 flex flex-col gap-3">
            <button 
              type="button"
              onClick={handleLogin}
              disabled={isLoading}
              className="w-full bg-cs-black text-white py-3 rounded-xl font-semibold text-sm hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
            >
              Log In
            </button>
            <div className="relative flex items-center py-2">
              <div className="flex-grow border-t border-cs-gray-200"></div>
              <span className="flex-shrink-0 mx-4 text-cs-gray-400 text-xs font-medium">New to OneSpace?</span>
              <div className="flex-grow border-t border-cs-gray-200"></div>
            </div>
            <button 
              type="button"
              onClick={handleSignup}
              disabled={isLoading}
              className="w-full bg-white border-2 border-cs-gray-200 text-cs-black py-3 rounded-xl font-semibold text-sm hover:bg-cs-gray-50 hover:border-cs-gray-300 transition-all flex items-center justify-center gap-2 group"
            >
              Start Free Trial
              <ArrowRight className="w-4 h-4 text-cs-gray-400 group-hover:text-cs-black transition-colors" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
