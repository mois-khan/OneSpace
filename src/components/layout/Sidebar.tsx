"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Map,
  Users,
  CalendarDays,
  BarChart4,
  Ticket,
  RefreshCcw,
  Lock,
  Headset,
  MessageSquare,
  type LucideIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { usePermissions } from "@/lib/rbac";
import type { Permission } from "@/lib/rbac";
import { useCurrentUser } from "@/lib/store";

interface NavItem {
  href: string;
  icon: LucideIcon;
  label: string;
  /** Optional permission required to see this item. */
  needs?: Permission;
}

const NAV_ITEMS: NavItem[] = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/floor-map", icon: Map, label: "Floor Map", needs: "view_floor_map" },
  { href: "/members", icon: Users, label: "Members" },
  { href: "/visitors", icon: Ticket, label: "Visitors", needs: "manage_visitors" },
  { href: "/renewals", icon: RefreshCcw, label: "Renewals", needs: "view_renewals" },
  { href: "/leads", icon: BarChart4, label: "Leads", needs: "manage_leads" },
  { href: "/bookings", icon: CalendarDays, label: "Bookings", needs: "manage_bookings" },
  { href: "/inbox", icon: MessageSquare, label: "Inbox" },
  { href: "/support", icon: Headset, label: "Support" },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen, onClose }: SidebarProps) {
  const pathname = usePathname();
  const { can, isBranchLocked } = usePermissions();
  const user = useCurrentUser();

  const visibleItems = NAV_ITEMS.filter((item) => !item.needs || can(item.needs));
  const hiddenCount = NAV_ITEMS.length - visibleItems.length;

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40 md:hidden transition-opacity"
          onClick={onClose}
        />
      )}
      
      <aside className={cn(
        "w-64 bg-sidebar text-sidebar-foreground h-full flex flex-col shadow-[2px_0_8px_rgba(0,0,0,0.15)] z-50 fixed md:relative transition-transform duration-300 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
      )}>
        <div className="h-14 md:h-16 flex items-center px-6 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-cs-red flex items-center justify-center font-bold text-xs">
            CS
          </div>
          <span className="font-semibold text-base">OneSpace</span>
        </div>
      </div>

      <div className="p-4 flex-1 overflow-y-auto">
        <div className="mb-4 p-2.5 rounded-lg bg-sidebar-accent border border-sidebar-border">
          <div className="flex items-center gap-2 text-[13px] font-medium mb-1">
            <span className="w-2 h-2 rounded-full bg-cs-red" />
            CS Coworking Spaces
          </div>
          {isBranchLocked ? (
            <div className="flex items-center gap-1.5 text-[10px] text-white/60 mt-1">
              <Lock className="w-2.5 h-2.5" />
              <span className="font-medium text-white/80">{user.roleLabel}</span>
            </div>
          ) : (
            <div className="text-[10px] text-white/60 mt-1 font-medium">{user.roleLabel}</div>
          )}
        </div>

        <nav className="flex flex-col gap-1">
          {visibleItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors duration-200",
                  isActive
                    ? "bg-cs-red text-white"
                    : "text-white/65 hover:bg-sidebar-accent hover:text-white",
                )}
              >
                <item.icon className="w-[18px] h-[18px]" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {hiddenCount > 0 && (
          <div className="mt-4 px-3 py-2 rounded-md bg-white/[0.03] border border-white/[0.06] text-[10px] text-white/40 flex items-start gap-1.5">
            <Lock className="w-3 h-3 mt-0.5 shrink-0" />
            <span>
              <span className="text-white/60 font-medium">{hiddenCount} section{hiddenCount === 1 ? "" : "s"} hidden</span> by your role&apos;s permissions.
            </span>
          </div>
        )}
      </div>

      <div className="p-4 border-t border-sidebar-border text-[10px] text-white/40">
        <span className="font-medium text-white/60">⌘K</span> search
        <span className="mx-1.5 text-white/30">·</span>
        <span className="font-medium text-white/60">⌘J</span> AI assistant
      </div>
    </aside>
    </>
  );
}
