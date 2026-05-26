"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import {
  User as UserIcon,
  Settings,
  LifeBuoy,
  Keyboard,
  LogOut,
} from "lucide-react";
import { useCurrentUser } from "@/lib/store";
import { toast } from "sonner";

interface ProfileMenuProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  anchorRef: React.RefObject<HTMLElement | null>;
}

export function ProfileMenu({ open, onOpenChange, anchorRef }: ProfileMenuProps) {
  const user = useCurrentUser();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      const target = e.target as Node;
      if (panelRef.current?.contains(target)) return;
      if (anchorRef.current?.contains(target)) return;
      onOpenChange(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onOpenChange, anchorRef]);

  if (!open) return null;

  const items: Array<{ label: string; icon: React.ComponentType<{ className?: string }>; onClick?: () => void; href?: string }> = [
    { label: "Your profile", icon: UserIcon, onClick: () => toast.info("Profile page not yet built.") },
    { label: "Workspace settings", icon: Settings, onClick: () => toast.info("Settings page not yet built.") },
    { label: "Keyboard shortcuts", icon: Keyboard, onClick: () => toast.info("Press Ctrl/Cmd+K for command palette.") },
    { label: "Help & support", icon: LifeBuoy, onClick: () => toast.info("Reach support at help@onespace.in") },
  ];

  return (
    <div
      ref={panelRef}
      role="menu"
      className="absolute right-0 top-[calc(100%+8px)] z-50 w-64 rounded-xl bg-white shadow-[0_16px_40px_-12px_rgba(17,24,39,0.18)] ring-1 ring-cs-gray-300/60 overflow-hidden animate-in fade-in-0 slide-in-from-top-2 duration-150"
    >
      <div className="px-4 py-3 border-b border-cs-gray-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-cs-red-bg flex items-center justify-center text-cs-red font-semibold text-sm border border-cs-red/20 shrink-0">
            {user.initials}
          </div>
          <div className="min-w-0">
            <div className="text-[13px] font-semibold text-cs-black truncate">{user.name}</div>
            <div className="text-[11px] text-cs-gray-500 truncate">{user.email}</div>
          </div>
        </div>
        <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-cs-gray-100 text-[11px] font-medium text-cs-gray-700">
          {user.role}
        </div>
      </div>

      <ul className="py-1.5">
        {items.map((item) => {
          const Icon = item.icon;
          const Inner = (
            <span className="flex items-center gap-2.5 px-3 py-2 text-[13px] text-cs-gray-700 hover:bg-cs-gray-50 hover:text-cs-black transition-colors cursor-pointer">
              <Icon className="w-4 h-4 text-cs-gray-500" />
              {item.label}
            </span>
          );
          return (
            <li key={item.label} role="menuitem">
              {item.href ? (
                <Link href={item.href} onClick={() => onOpenChange(false)}>
                  {Inner}
                </Link>
              ) : (
                <button
                  type="button"
                  className="w-full text-left"
                  onClick={() => {
                    item.onClick?.();
                    onOpenChange(false);
                  }}
                >
                  {Inner}
                </button>
              )}
            </li>
          );
        })}
      </ul>

      <div className="py-1.5 border-t border-cs-gray-100">
        <button
          type="button"
          onClick={() => {
            onOpenChange(false);
            toast.success("Signed out (demo).");
          }}
          className="w-full text-left flex items-center gap-2.5 px-3 py-2 text-[13px] text-status-red hover:bg-[#DC26260F] transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign out
        </button>
      </div>
    </div>
  );
}
