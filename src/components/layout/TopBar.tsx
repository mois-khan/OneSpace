"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Bell, Building2, Lock, Search, Menu } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useBranch,
  useAppActions,
  useCurrentUser,
  useUnreadCount,
  useNow,
} from "@/lib/store";
import { usePermissions } from "@/lib/rbac";
import { CommandPalette } from "./CommandPalette";
import { NotificationsPopover } from "./NotificationsPopover";
import { ProfileMenu } from "./ProfileMenu";
import { RoleSwitcher } from "./RoleSwitcher";
import { VoiceAgent } from "../ai/VoiceAgent";

function getPageTitle(pathname: string) {
  if (pathname.startsWith("/dashboard")) return "Dashboard";
  if (pathname.startsWith("/floor-map")) return "Floor Map";
  if (pathname.startsWith("/members")) return "Members";
  if (pathname.startsWith("/visitors")) return "Front Desk";
  if (pathname.startsWith("/renewals")) return "Renewals";
  if (pathname.startsWith("/leads")) return "Leads";
  if (pathname.startsWith("/bookings")) return "Bookings";
  return "OneSpace";
}

interface TopBarProps {
  onMenuToggle?: () => void;
}

export function TopBar({ onMenuToggle }: TopBarProps) {
  const pathname = usePathname();
  const { selectedBranchId, branches } = useBranch();
  const { setBranch } = useAppActions();
  const user = useCurrentUser();
  const unread = useUnreadCount();
  const { isBranchLocked } = usePermissions();
  const lockedBranch = isBranchLocked
    ? branches.find((b) => b.id === user.branchScope)
    : null;

  const [paletteOpen, setPaletteOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const now = useNow();

  const bellRef = useRef<HTMLButtonElement>(null);
  const avatarRef = useRef<HTMLButtonElement>(null);

  // Global Ctrl/Cmd+K for command palette
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <header className="h-14 bg-white border-b border-border px-4 md:px-6 flex items-center justify-between sticky top-0 z-30">
      <div className="flex items-center gap-3 md:gap-4">
        {onMenuToggle && (
          <button
            onClick={onMenuToggle}
            className="md:hidden p-1.5 -ml-1.5 text-cs-gray-600 hover:text-cs-black rounded-md hover:bg-cs-gray-50 transition-colors"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <h1 className="text-lg font-semibold text-cs-black font-heading min-w-[100px] truncate">
          {getPageTitle(pathname)}
        </h1>

        <div className="hidden md:flex items-center gap-2">
          <RoleSwitcher />

          {lockedBranch ? (
            <span
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-cs-gray-50 border border-cs-gray-200 text-[12px] text-cs-gray-700"
              title="Branch selection is locked by your role"
            >
              <Lock className="w-3 h-3 text-cs-gray-500" />
              <span className="font-medium text-cs-black">{lockedBranch.name}</span>
              <span className="text-cs-gray-500">locked</span>
            </span>
          ) : (
            <div className="flex items-center gap-2 px-2.5 py-1.5 bg-cs-gray-50 border border-cs-gray-200 rounded-lg hover:border-cs-red/30 transition-colors">
              <Building2 className="w-3.5 h-3.5 text-cs-gray-500" />
              <select
                value={selectedBranchId}
                onChange={(e) => setBranch(e.target.value)}
                className="bg-transparent text-[12px] font-medium text-cs-black focus:outline-none cursor-pointer appearance-none pr-3"
              >
                <option value="all">All Branches</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-2 text-muted-foreground">
        <button
          type="button"
          onClick={() => setPaletteOpen(true)}
          className="hidden md:inline-flex items-center gap-2 h-8 pl-2.5 pr-2 bg-cs-gray-50 border border-cs-gray-200 rounded-lg text-[12px] text-cs-gray-500 hover:text-cs-black hover:border-cs-gray-300 transition-colors"
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden lg:inline">Search anything…</span>
          <kbd className="ml-1 px-1.5 py-0.5 text-[10px] font-medium bg-white border border-cs-gray-200 rounded">
            ⌘K
          </kbd>
        </button>

        <button
          type="button"
          onClick={() => setPaletteOpen(true)}
          className="md:hidden p-2 rounded-md hover:bg-cs-gray-50 text-cs-gray-700 hover:text-cs-black transition-colors"
          aria-label="Search"
        >
          <Search className="w-4 h-4" />
        </button>

        <VoiceAgent />

        <div className="relative">
          <button
            ref={bellRef}
            type="button"
            onClick={() => {
              setNotifOpen((o) => !o);
              setProfileOpen(false);
            }}
            className={cn(
              "relative p-2 rounded-md hover:bg-cs-gray-50 text-cs-gray-700 hover:text-cs-black transition-colors",
              notifOpen && "bg-cs-gray-50 text-cs-black",
            )}
            aria-label="Notifications"
            aria-expanded={notifOpen}
          >
            <Bell className="w-4 h-4" />
            {unread > 0 && (
              <span className="absolute top-1 right-1 min-w-[16px] h-[16px] px-1 rounded-full bg-cs-red text-white text-[10px] font-semibold leading-[16px] tabular-nums">
                {unread > 9 ? "9+" : unread}
              </span>
            )}
          </button>
          <NotificationsPopover
            open={notifOpen}
            onOpenChange={setNotifOpen}
            anchorRef={bellRef}
          />
        </div>

        <div className="h-5 w-[1px] bg-border mx-1 hidden md:block"></div>

        <div className="text-sm font-medium text-cs-black hidden md:block tabular-nums" suppressHydrationWarning>
          {new Date(now).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
        </div>

        <div className="relative">
          <button
            ref={avatarRef}
            type="button"
            onClick={() => {
              setProfileOpen((o) => !o);
              setNotifOpen(false);
            }}
            className={cn(
              "w-8 h-8 rounded-full bg-cs-red-bg flex items-center justify-center text-cs-red font-semibold text-sm border border-cs-red/20 transition-shadow",
              profileOpen && "ring-2 ring-cs-red/30 ring-offset-2",
            )}
            aria-label="Account menu"
            aria-expanded={profileOpen}
          >
            {user.initials}
          </button>
          <ProfileMenu
            open={profileOpen}
            onOpenChange={setProfileOpen}
            anchorRef={avatarRef}
          />
        </div>
      </div>

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </header>
  );
}
