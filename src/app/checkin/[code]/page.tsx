"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { CheckCircle2, QrCode, Loader2, MapPin } from "lucide-react";
import {
  usePreRegistrations,
  useBranches,
  useAppActions,
} from "@/lib/store";
import { toast } from "sonner";

export default function CheckinByCodePage() {
  const params = useParams();
  const router = useRouter();
  const code = (params.code as string).toUpperCase();

  const preRegs = usePreRegistrations("all");
  const branches = useBranches();
  const { convertPreRegistration } = useAppActions();

  const preReg = useMemo(
    () => preRegs.find((p) => p.inviteCode.toUpperCase() === code),
    [preRegs, code],
  );

  const [isChecking, setIsChecking] = useState(false);
  const [done, setDone] = useState(false);

  if (!preReg) {
    return (
      <Shell>
        <div className="text-center py-12">
          <div className="w-14 h-14 mx-auto rounded-full bg-cs-gray-100 flex items-center justify-center mb-3">
            <QrCode className="w-7 h-7 text-cs-gray-500" />
          </div>
          <h1 className="text-[18px] font-bold font-heading text-cs-black">Invite not found</h1>
          <p className="text-[13px] text-cs-gray-500 mt-1 max-w-xs mx-auto">
            The code <code className="bg-cs-gray-100 px-1.5 py-0.5 rounded">{code}</code> isn&apos;t
            recognised. Please check with reception.
          </p>
        </div>
      </Shell>
    );
  }

  const branch = branches.find((b) => b.id === preReg.branchId);

  if (done || preReg.status === "arrived") {
    return (
      <Shell>
        <div className="text-center py-10 space-y-5 animate-in zoom-in-95 duration-300">
          <div className="w-16 h-16 mx-auto rounded-full bg-[#16A34A1A] text-status-green flex items-center justify-center">
            <CheckCircle2 className="w-9 h-9" />
          </div>
          <div>
            <h1 className="text-[20px] font-bold font-heading text-cs-black">
              Welcome, {preReg.visitorName.split(" ")[0]}
            </h1>
            <p className="text-[13px] text-cs-gray-500 mt-1">
              Show this badge at reception. {preReg.hostName} has been notified.
            </p>
          </div>

          <div className="p-3 bg-white border border-cs-gray-200 rounded-2xl inline-block">
            <QRCodeSVG
              value={`onespace://visitor/${preReg.id}`}
              size={180}
              fgColor="#0D1B2A"
              level="M"
            />
          </div>

          <div className="text-left bg-cs-gray-50 border border-cs-gray-100 rounded-xl p-3 mx-auto max-w-xs space-y-1.5">
            <KvRow k="Host" v={preReg.hostName} />
            <KvRow k="Purpose" v={preReg.purpose} />
            <KvRow k="Branch" v={branch?.name || preReg.branchId} />
            <KvRow k="Code" v={preReg.inviteCode} mono />
          </div>

          <button
            type="button"
            onClick={() => router.push("/")}
            className="text-[12px] text-cs-gray-500 hover:text-cs-black hover:underline"
          >
            Done
          </button>
        </div>
      </Shell>
    );
  }

  const handleConfirm = () => {
    setIsChecking(true);
    setTimeout(() => {
      convertPreRegistration(preReg.id);
      toast.success("Checked in");
      setDone(true);
      setIsChecking(false);
    }, 700);
  };

  return (
    <Shell>
      <div className="space-y-5">
        <div className="text-center">
          <div className="text-[10px] uppercase tracking-[0.2em] text-cs-gray-500">
            Pre-registered invite
          </div>
          <h1 className="text-[22px] font-bold font-heading text-cs-black mt-1">
            Confirm check-in
          </h1>
          <p className="text-[13px] text-cs-gray-500 mt-1">
            Tap below to let reception know you&apos;ve arrived.
          </p>
        </div>

        <div className="bg-cs-gray-50 border border-cs-gray-100 rounded-2xl p-4 space-y-2">
          <KvRow k="Name" v={preReg.visitorName} large />
          <KvRow k="Phone" v={preReg.phone} />
          <KvRow k="Visiting" v={preReg.hostName} />
          <KvRow k="Purpose" v={preReg.purpose} />
          <KvRow
            k="Branch"
            v={branch ? `${branch.name}, ${branch.location}` : preReg.branchId}
          />
          <KvRow k="Invite code" v={preReg.inviteCode} mono />
        </div>

        <button
          type="button"
          onClick={handleConfirm}
          disabled={isChecking}
          className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-xl bg-cs-red text-white text-[15px] font-semibold hover:bg-cs-red-dark transition-colors disabled:opacity-60"
        >
          {isChecking ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" /> Checking in…
            </>
          ) : (
            <>
              <CheckCircle2 className="w-4 h-4" /> Confirm check-in
            </>
          )}
        </button>

        <p className="text-[11px] text-cs-gray-500 text-center">
          By tapping confirm, you agree to be photographed and to abide by visitor guidelines.
        </p>
      </div>
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-cs-gray-50 flex flex-col">
      <header className="px-5 py-4 border-b border-cs-gray-200 bg-white flex items-center gap-2">
        <div className="w-6 h-6 bg-cs-red flex items-center justify-center font-bold text-xs text-white rounded">
          CS
        </div>
        <span className="text-[14px] font-semibold text-cs-black font-heading">OneSpace</span>
        <span className="ml-auto inline-flex items-center gap-1 text-[10px] uppercase tracking-wider text-cs-gray-500">
          <MapPin className="w-3 h-3" />
          Front desk
        </span>
      </header>
      <main className="flex-1 px-5 py-6 max-w-md mx-auto w-full">{children}</main>
    </div>
  );
}

function KvRow({
  k,
  v,
  large,
  mono,
}: {
  k: string;
  v: string;
  large?: boolean;
  mono?: boolean;
}) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-[11px] uppercase tracking-wider text-cs-gray-500 shrink-0">{k}</span>
      <span
        className={`text-cs-black font-semibold truncate ${large ? "text-[15px]" : "text-[13px]"} ${
          mono ? "font-mono tracking-wider" : ""
        }`}
      >
        {v}
      </span>
    </div>
  );
}
