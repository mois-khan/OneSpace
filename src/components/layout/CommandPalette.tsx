"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Dialog as DialogPrimitive } from "@base-ui/react/dialog";
import {
  Search as SearchIcon,
  ArrowRight,
  User,
  Briefcase,
  UserCheck,
  Building2,
  LayoutDashboard,
  Map as MapIcon,
  RefreshCcw,
  CalendarDays,
  Users as UsersIcon,
  BarChart4,
  Ticket,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useSearch } from "@/lib/store";

const NAV_ITEMS = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "Floor Map", href: "/floor-map", icon: MapIcon },
  { label: "Members", href: "/members", icon: UsersIcon },
  { label: "Visitors", href: "/visitors", icon: Ticket },
  { label: "Renewals", href: "/renewals", icon: RefreshCcw },
  { label: "Leads", href: "/leads", icon: BarChart4 },
  { label: "Bookings", href: "/bookings", icon: CalendarDays },
];

const kindIcon = {
  member: User,
  lead: Briefcase,
  visitor: UserCheck,
  branch: Building2,
  nav: ArrowRight,
} as const;

const kindLabel = {
  member: "Member",
  lead: "Lead",
  visitor: "Visitor",
  branch: "Branch",
  nav: "Go to",
} as const;

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const [query, setQuery] = useState("");
  const [activeIdx, setActiveIdx] = useState(0);
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const searchResults = useSearch(query, 8);

  const navResults = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return NAV_ITEMS;
    return NAV_ITEMS.filter((n) => n.label.toLowerCase().includes(q));
  }, [query]);

  const flat = useMemo(
    () => [
      ...searchResults.map((r) => ({ ...r, group: "results" as const })),
      ...navResults.map((n) => ({
        id: `nav-${n.href}`,
        kind: "nav" as const,
        title: n.label,
        subtitle: n.href,
        link: n.href,
        group: "nav" as const,
      })),
    ],
    [searchResults, navResults],
  );

  // Focus the input each time the palette opens. State resets happen in
  // the handlers below (typed input + open handler) to avoid setState-in-effect.
  useEffect(() => {
    if (open) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  const handleQueryChange = (next: string) => {
    setQuery(next);
    setActiveIdx(0);
  };

  // Reset query/index whenever the palette closes via the open prop.
  const wrappedOnOpenChange = (next: boolean) => {
    if (!next) {
      setQuery("");
      setActiveIdx(0);
    }
    onOpenChange(next);
  };

  const navigate = (link: string) => {
    wrappedOnOpenChange(false);
    router.push(link);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(flat.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = flat[activeIdx];
      if (item) navigate(item.link);
    }
  };

  return (
    <DialogPrimitive.Root open={open} onOpenChange={wrappedOnOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Backdrop
          className="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0 duration-150"
        />
        <DialogPrimitive.Popup
          className="fixed top-[20%] left-1/2 z-50 w-full max-w-xl -translate-x-1/2 rounded-xl bg-white shadow-[0_24px_64px_-12px_rgba(17,24,39,0.2)] ring-1 ring-cs-gray-300/60 overflow-hidden data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95 data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 duration-150"
        >
          <DialogPrimitive.Title className="sr-only">Search OneSpace</DialogPrimitive.Title>
          <div className="flex items-center gap-3 px-4 h-12 border-b border-cs-gray-100">
            <SearchIcon className="w-4 h-4 text-cs-gray-500 shrink-0" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => handleQueryChange(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Search members, leads, visitors, branches…"
              className="flex-1 bg-transparent text-sm text-cs-black placeholder:text-cs-gray-500 outline-none"
            />
            <kbd className="px-1.5 py-0.5 text-[10px] font-medium text-cs-gray-500 bg-cs-gray-100 border border-cs-gray-300/60 rounded">
              ESC
            </kbd>
          </div>

          <div className="max-h-[400px] overflow-y-auto p-2">
            {flat.length === 0 && (
              <div className="text-center py-10 text-sm text-cs-gray-500">
                {query
                  ? "No results — try a different search."
                  : "Search across all data, or jump to a page."}
              </div>
            )}

            {searchResults.length > 0 && (
              <div className="mb-1">
                <div className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-cs-gray-500">
                  Results
                </div>
                {searchResults.map((r, i) => {
                  const Icon = kindIcon[r.kind];
                  return (
                    <ResultRow
                      key={r.id}
                      icon={Icon}
                      title={r.title}
                      subtitle={r.subtitle}
                      tag={kindLabel[r.kind]}
                      active={activeIdx === i}
                      onMouseEnter={() => setActiveIdx(i)}
                      onClick={() => navigate(r.link)}
                    />
                  );
                })}
              </div>
            )}

            {navResults.length > 0 && (
              <div>
                <div className="px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-wider text-cs-gray-500">
                  Go to
                </div>
                {navResults.map((n, i) => {
                  const idx = searchResults.length + i;
                  return (
                    <ResultRow
                      key={n.href}
                      icon={n.icon}
                      title={n.label}
                      subtitle={n.href}
                      tag="Page"
                      active={activeIdx === idx}
                      onMouseEnter={() => setActiveIdx(idx)}
                      onClick={() => navigate(n.href)}
                    />
                  );
                })}
              </div>
            )}
          </div>

          <div className="px-4 h-9 flex items-center justify-between text-[11px] text-cs-gray-500 border-t border-cs-gray-100 bg-cs-gray-50/60">
            <span className="flex items-center gap-2">
              <kbd className="px-1.5 py-0.5 bg-white border border-cs-gray-300/60 rounded">↑↓</kbd>
              Navigate
              <kbd className="px-1.5 py-0.5 bg-white border border-cs-gray-300/60 rounded ml-2">↵</kbd>
              Open
            </span>
            <span>{flat.length} result{flat.length === 1 ? "" : "s"}</span>
          </div>
        </DialogPrimitive.Popup>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}

function ResultRow({
  icon: Icon,
  title,
  subtitle,
  tag,
  active,
  onMouseEnter,
  onClick,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  subtitle?: string;
  tag: string;
  active: boolean;
  onMouseEnter: () => void;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onMouseEnter={onMouseEnter}
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-left transition-colors",
        active ? "bg-cs-red-bg" : "hover:bg-cs-gray-50",
      )}
    >
      <span className="w-7 h-7 rounded-md bg-cs-gray-50 border border-cs-gray-100 flex items-center justify-center shrink-0">
        <Icon className={cn("w-3.5 h-3.5", active ? "text-cs-red" : "text-cs-gray-500")} />
      </span>
      <span className="flex-1 min-w-0">
        <div className={cn("text-[13px] font-medium truncate", active ? "text-cs-red" : "text-cs-black")}>
          {title}
        </div>
        {subtitle && (
          <div className="text-[11px] text-cs-gray-500 truncate">{subtitle}</div>
        )}
      </span>
      <span className="text-[10px] text-cs-gray-500 uppercase tracking-wider shrink-0">{tag}</span>
    </button>
  );
}
