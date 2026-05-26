"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import {
  ArrowRight,
  Building2,
  CheckCircle2,
  Mail,
  Sparkles,
  UserPlus,
  X,
  Zap,
} from "lucide-react";
import { useAppActions } from "@/lib/store";
import { toast } from "sonner";

const HIGHLIGHTS = [
  "Unified multi-branch dashboard",
  "Smart QR visitor management",
  "AI assistant scoped by role",
  "Bulk retention outreach",
];

export default function LoginPage() {
  const router = useRouter();
  const { setUser } = useAppActions();
  const [registerOpen, setRegisterOpen] = useState(false);

  const handleDemoLogin = () => {
    setUser({
      name: "Avinash Kumar",
      email: "avinash.kumar@furdial.com",
      role: "owner",
      roleLabel: "Owner",
      initials: "A",
      branchScope: "all",
    });
    toast.success("Signed in as CS Coworking Owner");
    router.push("/dashboard");
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row bg-cs-gray-50">
      {/* Left — brand panel */}
      <aside className="lg:w-[44%] relative overflow-hidden text-white flex flex-col">
        <div
          aria-hidden
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(135deg, var(--cs-hero-from) 0%, #1A2B45 50%, var(--cs-hero-to) 100%)",
          }}
        />
        <div
          aria-hidden
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(255,255,255,0.08) 0%, transparent 40%), radial-gradient(circle at 80% 80%, rgba(232,25,44,0.18) 0%, transparent 50%)",
          }}
        />
        <div className="relative z-10 flex-1 p-8 lg:p-12 flex flex-col">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-cs-red flex items-center justify-center font-bold text-sm rounded">
              CS
            </div>
            <span className="text-lg font-semibold font-heading">OneSpace</span>
            <span className="ml-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-white/10 text-[10px] font-semibold uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-status-green animate-pulse" />
              Live demo
            </span>
          </div>

          <div className="mt-16 max-w-md">
            <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-white/60 mb-3">
              Operational intelligence
            </div>
            <h1 className="text-[40px] font-bold font-heading leading-[1.05]">
              The command center for{" "}
              <span className="text-cs-red">coworking operators</span>.
            </h1>
            <p className="mt-4 text-[15px] text-white/75 leading-relaxed">
              Replace spreadsheets, WhatsApp tracking, and disconnected tools with one
              unified platform. Visitors, bookings, members, renewals, and revenue —
              live, multi-branch, AI-aware.
            </p>
          </div>

          <ul className="mt-8 space-y-2.5 max-w-md">
            {HIGHLIGHTS.map((h) => (
              <li key={h} className="flex items-center gap-2.5 text-[13px] text-white/80">
                <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-3 h-3 text-status-green" />
                </span>
                {h}
              </li>
            ))}
          </ul>

          <div className="mt-auto pt-12 flex items-center gap-3 text-[11px] text-white/50">
            <span className="inline-flex items-center gap-1">
              <Building2 className="w-3 h-3" />
              6 branches
            </span>
            <span className="w-1 h-1 rounded-full bg-white/30" />
            <span className="inline-flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Powered by Gemini
            </span>
            <span className="w-1 h-1 rounded-full bg-white/30" />
            <span>India · 2026</span>
          </div>
        </div>
      </aside>

      {/* Right — sign-in card */}
      <main className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl border border-cs-gray-200 shadow-[0_24px_64px_-16px_rgba(17,24,39,0.12)] p-8">
            <div className="text-[11px] font-semibold uppercase tracking-[0.12em] text-cs-red mb-1.5">
              Welcome back
            </div>
            <h2 className="text-2xl font-bold font-heading text-cs-black">
              Sign in to OneSpace
            </h2>
            <p className="text-[13px] text-cs-gray-500 mt-1.5">
              Step in as the CS Coworking owner to explore the full platform.
            </p>

            <div className="mt-6 space-y-2.5">
              <button
                type="button"
                onClick={handleDemoLogin}
                className="w-full group inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-cs-red text-white text-[14px] font-semibold hover:bg-cs-red-dark transition-all shadow-sm hover:shadow-md"
              >
                <Building2 className="w-4 h-4" />
                Login as CS Coworking Space
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </button>
              <p className="text-[11px] text-cs-gray-500 text-center px-2">
                One-click access to the live demo workspace.
              </p>
            </div>

            <div className="my-6 flex items-center gap-3">
              <span className="flex-1 h-px bg-cs-gray-200" />
              <span className="text-[10px] font-semibold uppercase tracking-wider text-cs-gray-500">
                or
              </span>
              <span className="flex-1 h-px bg-cs-gray-200" />
            </div>

            <button
              type="button"
              onClick={() => setRegisterOpen(true)}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-cs-gray-200 text-cs-gray-700 text-[13px] font-medium hover:bg-cs-gray-50 hover:border-cs-gray-300 transition-colors"
            >
              <UserPlus className="w-3.5 h-3.5" />
              New registration
            </button>

            <div className="mt-5 pt-5 border-t border-cs-gray-100">
              <p className="text-[11px] text-cs-gray-500 text-center leading-relaxed">
                Switch between 14 role × branch personas from the topbar after sign-in
                to see role-based access in action.
              </p>
            </div>
          </div>

          <p className="text-[11px] text-cs-gray-500 text-center mt-5">
            By signing in you agree to OneSpace&apos;s demo terms. No data leaves your
            session.
          </p>
        </div>
      </main>

      <RegistrationDialog open={registerOpen} onOpenChange={setRegisterOpen} />
    </div>
  );
}

function RegistrationDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitted(true);
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0 duration-150" />
        <DialogPrimitive.Popup className="fixed top-1/2 left-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl bg-white shadow-[0_24px_64px_-12px_rgba(17,24,39,0.25)] ring-1 ring-cs-gray-300/60 p-6 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 duration-150">
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="absolute top-3 right-3 p-1.5 rounded-md hover:bg-cs-gray-50 text-cs-gray-500"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>

          {!submitted ? (
            <>
              <div className="w-12 h-12 rounded-2xl bg-cs-red-bg flex items-center justify-center mb-3">
                <Zap className="w-5 h-5 text-cs-red" />
              </div>
              <DialogPrimitive.Title className="text-[18px] font-semibold text-cs-black font-heading">
                New registration is under development
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="text-[13px] text-cs-gray-500 mt-1.5 leading-relaxed">
                Self-serve signup launches with OneSpace V2. Until then, leave your
                email and we&apos;ll reach out personally to set up your workspace.
              </DialogPrimitive.Description>

              <form onSubmit={handleSubmit} className="mt-5 space-y-2.5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-semibold uppercase tracking-wider text-cs-gray-500">
                    Work email
                  </label>
                  <div className="relative">
                    <Mail className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-cs-gray-500" />
                    <input
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@yourbrand.com"
                      className="w-full pl-9 pr-3 py-2.5 border border-cs-gray-200 rounded-lg text-[13px] focus:outline-none focus:ring-2 focus:ring-cs-red/20 focus:border-cs-red transition-all"
                    />
                  </div>
                </div>
                <button
                  type="submit"
                  disabled={!email}
                  className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg bg-cs-red text-white text-[13px] font-medium hover:bg-cs-red-dark transition-colors disabled:opacity-50"
                >
                  Request access
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>

              <p className="text-[11px] text-cs-gray-500 mt-3 text-center">
                Or just click <strong>Login as CS Coworking Space</strong> to explore
                the demo workspace right now.
              </p>
            </>
          ) : (
            <div className="text-center py-2">
              <div className="w-14 h-14 mx-auto rounded-full bg-[#16A34A1A] text-status-green flex items-center justify-center mb-3">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <DialogPrimitive.Title className="text-[16px] font-semibold text-cs-black font-heading">
                We&apos;ll be in touch
              </DialogPrimitive.Title>
              <DialogPrimitive.Description className="text-[13px] text-cs-gray-500 mt-1.5">
                Thanks. We&apos;ll reach out at <strong>{email}</strong> within 24 hours
                to set up your workspace.
              </DialogPrimitive.Description>
              <button
                type="button"
                onClick={() => onOpenChange(false)}
                className="mt-5 text-[12px] text-cs-gray-500 hover:text-cs-black hover:underline"
              >
                Done
              </button>
            </div>
          )}
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
