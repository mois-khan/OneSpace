"use client";

import Link from "next/link";
import { Card } from "@/components/ui/card";
import {
  AlertCircle,
  ArrowRight,
  CalendarClock,
  CheckCircle2,
  Clock,
  DoorOpen,
  FileWarning,
  TrendingDown,
  type LucideIcon,
} from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import {
  useRenewalsDue,
  useInvoices,
  useVisitors,
  useNow,
  useAllMembers,
} from "@/lib/store";
import { SectionHeader } from "./SectionHeader";

const DAY = 24 * 60 * 60 * 1000;
const HOUR = 60 * 60 * 1000;

export function TodayFocusCard() {
  const now = useNow();
  const renewals = useRenewalsDue(7);
  const invoices = useInvoices();
  const visitors = useVisitors();
  const allMembers = useAllMembers();
  const memberName = (id: string) => {
    const m = allMembers.find((x) => x.id === id);
    return m ? m.company || m.name : "Member";
  };

  const overdueInvoices = invoices
    .filter((i) => i.status === "overdue")
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 4);

  const onSite = visitors
    .filter((v) => !v.checkOutAt)
    .map((v) => ({
      ...v,
      hoursInside: (now - new Date(v.checkInAt).getTime()) / HOUR,
    }))
    .sort((a, b) => b.hoursInside - a.hoursInside)
    .slice(0, 4);

  const totalActionable = renewals.length + overdueInvoices.length + onSite.filter((v) => v.hoursInside > 8).length;

  return (
    <Card className="bg-white p-5 shadow-[0_1px_2px_rgba(17,24,39,0.04)]">
      <SectionHeader
        eyebrow="Action queue"
        title="Today's focus"
        description="Three streams ranked by urgency — click any item to act"
        actions={
          totalActionable > 0 ? (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#DC26261A] text-status-red text-[11px] font-semibold tabular-nums">
              <span className="w-1.5 h-1.5 rounded-full bg-status-red animate-pulse" />
              {totalActionable} need action
            </span>
          ) : (
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#16A34A1A] text-status-green text-[11px] font-semibold">
              <CheckCircle2 className="w-3 h-3" />
              All clear
            </span>
          )
        }
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FocusColumn
          eyebrow="Renewals"
          icon={CalendarClock}
          iconClass="text-status-amber bg-[#D970061A]"
          empty="No contracts expiring this week."
          viewAllLink="/renewals"
          viewAllLabel="View all renewals"
        >
          {renewals.slice(0, 4).map((m) => {
            const daysLeft = Math.max(
              1,
              Math.ceil((new Date(m.contractEnd).getTime() - now) / DAY),
            );
            return (
              <FocusRow
                key={m.id}
                href={`/members/${m.id}`}
                title={m.name}
                subtitle={`${m.company || m.planType} · ${formatCurrency(m.monthlyFee)}/mo`}
                rightTag={`${daysLeft}d`}
                severity={daysLeft <= 2 ? "critical" : "warning"}
              />
            );
          })}
        </FocusColumn>

        <FocusColumn
          eyebrow="Overdue"
          icon={FileWarning}
          iconClass="text-status-red bg-[#DC26261A]"
          empty="No overdue invoices. Healthy."
          viewAllLink="/renewals"
          viewAllLabel="Chase invoices"
        >
          {overdueInvoices.map((inv) => {
            const daysOver = Math.max(1, Math.ceil((now - new Date(inv.dueAt).getTime()) / DAY));
            return (
              <FocusRow
                key={inv.id}
                href={`/members/${inv.memberId}`}
                title={formatCurrency(inv.amount)}
                subtitle={`${memberName(inv.memberId)} · ${daysOver}d overdue`}
                rightTag={`${daysOver}d`}
                severity={daysOver > 14 ? "critical" : "warning"}
              />
            );
          })}
        </FocusColumn>

        <FocusColumn
          eyebrow="Front desk"
          icon={DoorOpen}
          iconClass="text-status-blue bg-[#2563EB14]"
          empty="No visitors currently on-site."
          viewAllLink="/visitors"
          viewAllLabel="Open front desk"
        >
          {onSite.map((v) => {
            const hours = Math.floor(v.hoursInside);
            const minutes = Math.round((v.hoursInside - hours) * 60);
            const inside = hours > 0 ? `${hours}h ${minutes}m` : `${minutes}m`;
            const overstay = v.hoursInside > 8;
            return (
              <FocusRow
                key={v.id}
                href="/visitors"
                title={v.name}
                subtitle={`${v.purpose}${v.hostName ? ` · host: ${v.hostName}` : ""}`}
                rightTag={inside}
                severity={overstay ? "warning" : "info"}
              />
            );
          })}
        </FocusColumn>
      </div>
    </Card>
  );
}

/* ───────── helpers ───────── */

function FocusColumn({
  eyebrow,
  icon: Icon,
  iconClass,
  empty,
  viewAllLink,
  viewAllLabel,
  children,
}: {
  eyebrow: string;
  icon: LucideIcon;
  iconClass: string;
  empty: string;
  viewAllLink: string;
  viewAllLabel: string;
  children: React.ReactNode;
}) {
  const items = Array.isArray(children) ? children.filter(Boolean) : children ? [children] : [];
  const isEmpty = items.length === 0;

  return (
    <div className="flex flex-col rounded-xl bg-cs-gray-50/40 border border-cs-gray-100 p-3.5 min-h-[200px]">
      <div className="flex items-center justify-between mb-2.5">
        <div className="flex items-center gap-2">
          <span className={cn("w-6 h-6 rounded-md flex items-center justify-center", iconClass)}>
            <Icon className="w-3.5 h-3.5" />
          </span>
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-cs-gray-700">
            {eyebrow}
          </span>
        </div>
      </div>

      <div className="flex-1 flex flex-col gap-1">
        {isEmpty ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-2 py-4">
            <CheckCircle2 className="w-6 h-6 text-status-green/50 mb-1.5" />
            <p className="text-[12px] text-cs-gray-500">{empty}</p>
          </div>
        ) : (
          items
        )}
      </div>

      <Link
        href={viewAllLink}
        className="mt-2 flex items-center justify-between text-[11px] font-medium text-cs-gray-500 hover:text-cs-red transition-colors px-1"
      >
        {viewAllLabel}
        <ArrowRight className="w-3 h-3" />
      </Link>
    </div>
  );
}

function FocusRow({
  href,
  title,
  subtitle,
  rightTag,
  severity,
}: {
  href: string;
  title: string;
  subtitle: string;
  rightTag?: string;
  severity: "critical" | "warning" | "info";
}) {
  return (
    <Link
      href={href}
      className="group flex items-center gap-2 px-2 py-1.5 rounded-md hover:bg-white transition-colors"
    >
      <span
        className={cn(
          "w-1 h-7 rounded-full shrink-0",
          severity === "critical"
            ? "bg-status-red"
            : severity === "warning"
            ? "bg-status-amber"
            : "bg-status-blue",
        )}
      />
      <span className="flex-1 min-w-0">
        <div className="text-[13px] font-medium text-cs-black truncate group-hover:text-cs-red transition-colors tabular-nums">
          {title}
        </div>
        <div className="text-[11px] text-cs-gray-500 truncate">{subtitle}</div>
      </span>
      {rightTag && (
        <span
          className={cn(
            "text-[10px] font-semibold tabular-nums px-1.5 py-0.5 rounded shrink-0",
            severity === "critical"
              ? "bg-[#DC26261A] text-status-red"
              : severity === "warning"
              ? "bg-[#D970061A] text-status-amber"
              : "bg-cs-gray-100 text-cs-gray-700",
          )}
        >
          {rightTag}
        </span>
      )}
    </Link>
  );
}

/* re-export the icon name so dashboards that import it keep working */
export const todayFocusIcons = { TrendingDown, Clock, AlertCircle };
