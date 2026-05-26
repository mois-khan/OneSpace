"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Clock,
  Info,
  TrendingDown,
  UserPlus,
  XCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useNotifications,
  useAppActions,
  useUnreadCount,
  useNow,
} from "@/lib/store";
import type { Notification, NotificationType } from "@/types";

interface NotificationsPopoverProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Element that toggled the popover — used to ignore its click in click-outside handler */
  anchorRef: React.RefObject<HTMLElement | null>;
}

const TYPE_ICON: Record<NotificationType, React.ComponentType<{ className?: string }>> = {
  renewal_due: Clock,
  invoice_overdue: TrendingDown,
  visitor_overstay: AlertTriangle,
  occupancy_low: TrendingDown,
  lead_won: CheckCircle2,
  high_risk: AlertTriangle,
  booking_conflict: XCircle,
  member_onboarded: UserPlus,
  ticket_open: Info,
};

export function NotificationsPopover({
  open,
  onOpenChange,
  anchorRef,
}: NotificationsPopoverProps) {
  const router = useRouter();
  const notifications = useNotifications();
  const unread = useUnreadCount();
  const { markNotificationRead, markAllNotificationsRead } = useAppActions();
  const now = useNow();
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

  const handleClick = (n: Notification) => {
    markNotificationRead(n.id);
    if (n.link) {
      onOpenChange(false);
      router.push(n.link);
    }
  };

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-label="Notifications"
      className="absolute right-0 top-[calc(100%+8px)] z-50 w-[380px] rounded-xl bg-white shadow-[0_16px_40px_-12px_rgba(17,24,39,0.18)] ring-1 ring-cs-gray-300/60 overflow-hidden animate-in fade-in-0 slide-in-from-top-2 duration-150"
    >
      <div className="flex items-center justify-between px-4 h-12 border-b border-cs-gray-100">
        <div className="flex items-center gap-2">
          <Bell className="w-4 h-4 text-cs-gray-700" />
          <span className="text-[14px] font-semibold text-cs-black">Notifications</span>
          {unread > 0 && (
            <span className="px-1.5 py-0.5 rounded-md bg-cs-red text-white text-[10px] font-semibold tabular-nums">
              {unread}
            </span>
          )}
        </div>
        {unread > 0 && (
          <button
            type="button"
            onClick={markAllNotificationsRead}
            className="text-[12px] font-medium text-cs-red hover:text-cs-red-dark transition-colors"
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="max-h-[420px] overflow-y-auto divide-y divide-cs-gray-100">
        {notifications.length === 0 && (
          <div className="py-12 text-center text-[13px] text-cs-gray-500">
            <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-status-green opacity-60" />
            All caught up.
          </div>
        )}

        {notifications.map((n) => {
          const Icon = TYPE_ICON[n.type] || Info;
          return (
            <button
              key={n.id}
              type="button"
              onClick={() => handleClick(n)}
              className={cn(
                "w-full flex gap-3 px-4 py-3 text-left transition-colors",
                n.read ? "bg-white hover:bg-cs-gray-50" : "bg-cs-red-bg/40 hover:bg-cs-red-bg/60",
              )}
            >
              <span
                className={cn(
                  "w-7 h-7 rounded-full flex items-center justify-center shrink-0 mt-0.5",
                  n.severity === "critical"
                    ? "bg-[#DC26261A] text-status-red"
                    : n.severity === "warning"
                    ? "bg-[#D9770612] text-status-amber"
                    : n.severity === "success"
                    ? "bg-[#16A34A1A] text-status-green"
                    : "bg-cs-gray-100 text-cs-gray-700",
                )}
              >
                <Icon className="w-3.5 h-3.5" />
              </span>
              <span className="flex-1 min-w-0">
                <div className="text-[13px] text-cs-black leading-snug">{n.message}</div>
                <div className="flex items-center gap-2 mt-1 text-[11px] text-cs-gray-500">
                  <span>{relativeTime(now, n.timestamp)}</span>
                  {!n.read && (
                    <>
                      <span className="text-cs-gray-300">·</span>
                      <span className="text-cs-red font-medium">New</span>
                    </>
                  )}
                </div>
              </span>
            </button>
          );
        })}
      </div>

      {notifications.length > 0 && (
        <div className="px-4 h-10 flex items-center justify-center border-t border-cs-gray-100 bg-cs-gray-50/60">
          <span className="text-[11px] text-cs-gray-500">
            {notifications.length} total — click to open
          </span>
        </div>
      )}
    </div>
  );
}

function relativeTime(now: number, ts: number) {
  const diff = now - ts;
  const m = Math.round(diff / 60_000);
  if (m < 1) return "just now";
  if (m < 60) return `${m}m ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h}h ago`;
  const d = Math.round(h / 24);
  return `${d}d ago`;
}
