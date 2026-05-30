"use client";

import { usePortalMember, useAppActions } from "@/lib/store/hooks";
import { useRouter, usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { Building2, Calendar, CreditCard, LogOut, User } from "lucide-react";
import { cn } from "@/lib/utils";

export default function PortalLayout({ children }: { children: React.ReactNode }) {
  const member = usePortalMember();
  const router = useRouter();
  const pathname = usePathname();
  const { portalLogout } = useAppActions();

  useEffect(() => {
    if (!member && pathname !== "/portal/login") {
      router.push("/portal/login");
    }
  }, [member, pathname, router]);

  if (!member) {
    return <>{children}</>;
  }

  const navItems = [
    { name: "Dashboard", href: "/portal", icon: Building2 },
    { name: "Bookings", href: "/portal/bookings", icon: Calendar },
    { name: "Billing", href: "/portal/billing", icon: CreditCard },
  ];

  return (
    <div className="min-h-screen bg-cs-gray-50 flex flex-col">
      <header className="bg-white border-b border-cs-gray-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 flex-wrap">
            <div className="flex items-center gap-8">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded bg-cs-red flex items-center justify-center text-white font-bold text-lg">
                  O
                </div>
                <span className="font-heading font-bold text-xl text-cs-black">
                  OneSpace <span className="text-cs-gray-400 font-normal">Portal</span>
                </span>
              </div>
              <nav className="hidden md:flex gap-1">
                {navItems.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "px-3 py-2 rounded-md text-sm font-medium flex items-center gap-2 transition-colors",
                      pathname === item.href
                        ? "bg-cs-red-bg text-cs-red"
                        : "text-cs-gray-500 hover:text-cs-black hover:bg-cs-gray-100"
                    )}
                  >
                    <item.icon className="w-4 h-4" />
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-sm text-right hidden sm:block">
                <div className="font-semibold text-cs-black">{member.name}</div>
                <div className="text-cs-gray-500 text-xs">{member.company || "Independent"}</div>
              </div>
              <button
                onClick={() => {
                  portalLogout();
                  router.push("/portal/login");
                }}
                className="p-2 text-cs-gray-500 hover:text-cs-red hover:bg-cs-red-bg rounded-lg transition-colors"
                title="Log out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
    </div>
  );
}
