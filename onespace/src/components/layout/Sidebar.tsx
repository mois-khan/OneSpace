"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Map, Users, CalendarDays, BarChart4, Ticket, RefreshCcw } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/floor-map", icon: Map, label: "Floor Map" },
  { href: "/members", icon: Users, label: "Members" },
  { href: "/visitors", icon: Ticket, label: "Visitors" },
  { href: "/renewals", icon: RefreshCcw, label: "Renewals" },
  { href: "/leads", icon: BarChart4, label: "Leads" },
  { href: "/bookings", icon: CalendarDays, label: "Bookings" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 bg-sidebar text-sidebar-foreground h-full flex flex-col shadow-[2px_0_8px_rgba(0,0,0,0.15)] z-20">
      <div className="h-16 flex items-center px-6 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          {/* CS Logo Placeholder */}
          <div className="w-6 h-6 bg-cs-red flex items-center justify-center font-bold text-xs">
            CS
          </div>
          <span className="font-semibold text-base">OneSpace</span>
        </div>
      </div>
      
      <div className="p-4">
        {/* Branch Switcher Placeholder */}
        <div className="mb-6 p-2 rounded-lg bg-sidebar-accent border border-sidebar-border flex items-center justify-between cursor-pointer">
          <div className="flex items-center gap-2 text-sm font-medium">
            <span className="w-2 h-2 rounded-full bg-cs-red"></span>
            Gachibowli
          </div>
          <span className="text-xs text-muted-foreground opacity-50">▼</span>
        </div>

        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200",
                  isActive
                    ? "bg-cs-red text-white"
                    : "text-white/65 hover:bg-sidebar-accent hover:text-white"
                )}
              >
                <item.icon className="w-[18px] h-[18px]" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
