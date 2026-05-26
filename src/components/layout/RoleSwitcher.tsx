"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ChevronDown,
  Crown,
  Settings2,
  Building2,
  Users,
  Check,
  Lock,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useBranches,
  useCurrentUser,
  useAppActions,
} from "@/lib/store";
import type { CurrentUser, UserRole } from "@/types";
import { toast } from "sonner";

interface PersonaPreset extends CurrentUser {
  /** Stable persona id for the dropdown key */
  personaId: string;
}

const CROSS_ORG: PersonaPreset[] = [
  {
    personaId: "owner",
    name: "Abhijeet Navandar",
    email: "abhijeet@cscoworkingspaces.com",
    role: "owner",
    roleLabel: "Owner",
    initials: "A",
    branchScope: "all",
  },
  {
    personaId: "operations",
    name: "Operations Lead",
    email: "ops@onespace.in",
    role: "operations",
    roleLabel: "Operations Lead",
    initials: "O",
    branchScope: "all",
  },
];

const ROLE_ICON: Record<UserRole, React.ComponentType<{ className?: string }>> = {
  owner: Crown,
  operations: Settings2,
  branch_manager: Building2,
  community: Users,
};

export function RoleSwitcher() {
  const branches = useBranches();
  const user = useCurrentUser();
  const { setUser } = useAppActions();
  const [open, setOpen] = useState(false);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  /** All branch-scoped personas: 6 branches × 2 scoped roles = 12 */
  const scopedPersonas = useMemo<PersonaPreset[]>(
    () =>
      branches.flatMap((b) =>
        (["branch_manager", "community"] as const).map<PersonaPreset>((role) => ({
          personaId: `${role}-${b.id}`,
          name: role === "branch_manager" ? `${b.name} Manager` : `${b.name} Community Lead`,
          email: `${role.replace("_", "")}.${b.id}@onespace.in`,
          role,
          roleLabel:
            (role === "branch_manager" ? "Branch Manager" : "Community Manager") +
            " · " +
            b.name,
          initials: b.name.substring(0, 2).toUpperCase(),
          branchScope: b.id,
        })),
      ),
    [branches],
  );

  useEffect(() => {
    if (!open) return;
    const onClick = (e: MouseEvent) => {
      const t = e.target as Node;
      if (menuRef.current?.contains(t)) return;
      if (triggerRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const handleSwitch = (preset: PersonaPreset) => {
    setUser(preset);
    setOpen(false);
    toast.success(`Now acting as ${preset.roleLabel}`);
  };

  const ActiveIcon = ROLE_ICON[user.role];
  const isOwnerOrOps = user.role === "owner" || user.role === "operations";

  return (
    <div className="relative">
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-haspopup="menu"
        className={cn(
          "inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[12px] font-medium transition-colors border",
          open
            ? "bg-cs-red-bg border-cs-red/30 text-cs-red"
            : "bg-white border-cs-gray-200 text-cs-gray-700 hover:border-cs-gray-300 hover:text-cs-black",
        )}
      >
        <ActiveIcon className={cn("w-3.5 h-3.5", open ? "text-cs-red" : "text-cs-gray-500")} />
        <span className="font-semibold text-cs-black">
          {isOwnerOrOps ? user.roleLabel : user.roleLabel.split(" · ")[0]}
        </span>
        {!isOwnerOrOps && (
          <span className="text-cs-gray-500">· {user.roleLabel.split(" · ")[1]}</span>
        )}
        <ChevronDown className={cn("w-3 h-3 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div
          ref={menuRef}
          role="menu"
          className="absolute left-0 top-[calc(100%+6px)] z-50 w-[340px] bg-white rounded-xl shadow-[0_16px_40px_-12px_rgba(17,24,39,0.2)] ring-1 ring-cs-gray-300/60 overflow-hidden"
        >
          <div className="px-4 py-3 border-b border-cs-gray-100 bg-cs-gray-50/40">
            <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-cs-gray-500">
              Switch persona
            </div>
            <p className="text-[11px] text-cs-gray-500 mt-0.5">
              Every page, KPI, and AI action re-scopes instantly.
            </p>
          </div>

          <div className="max-h-[400px] overflow-y-auto">
            <PersonaGroup
              label="Cross-organization"
              icon={Crown}
              personas={CROSS_ORG}
              activeId={getActivePersonaId(user, scopedPersonas)}
              onSelect={handleSwitch}
            />
            <PersonaGroup
              label="Branch-locked roles"
              icon={Building2}
              personas={scopedPersonas}
              activeId={getActivePersonaId(user, scopedPersonas)}
              onSelect={handleSwitch}
            />
          </div>

          <div className="px-4 py-2 border-t border-cs-gray-100 bg-cs-gray-50/40 text-[10px] text-cs-gray-500 flex items-center gap-1.5">
            <Lock className="w-3 h-3" />
            Branch-locked roles cannot switch branches via the topbar.
          </div>
        </div>
      )}
    </div>
  );
}

function PersonaGroup({
  label,
  icon: Icon,
  personas,
  activeId,
  onSelect,
}: {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  personas: PersonaPreset[];
  activeId: string;
  onSelect: (p: PersonaPreset) => void;
}) {
  return (
    <div>
      <div className="px-4 pt-3 pb-1.5 text-[10px] font-semibold uppercase tracking-wider text-cs-gray-500 flex items-center gap-1.5">
        <Icon className="w-3 h-3" />
        {label}
      </div>
      {personas.map((p) => {
        const isActive = p.personaId === activeId;
        const PIcon = ROLE_ICON[p.role];
        return (
          <button
            key={p.personaId}
            type="button"
            role="menuitem"
            onClick={() => onSelect(p)}
            className={cn(
              "w-full flex items-center gap-3 px-4 py-2 text-left transition-colors",
              isActive ? "bg-cs-red-bg/60" : "hover:bg-cs-gray-50",
            )}
          >
            <span
              className={cn(
                "w-7 h-7 rounded-md flex items-center justify-center shrink-0 text-[10px] font-bold",
                p.role === "owner"
                  ? "bg-[#DC26261A] text-status-red"
                  : p.role === "operations"
                  ? "bg-[#2563EB14] text-status-blue"
                  : p.role === "branch_manager"
                  ? "bg-[#D970061A] text-status-amber"
                  : "bg-[#16A34A1A] text-status-green",
              )}
            >
              <PIcon className="w-3.5 h-3.5" />
            </span>
            <span className="flex-1 min-w-0">
              <div className="text-[13px] font-medium text-cs-black truncate">
                {p.roleLabel}
              </div>
              <div className="text-[11px] text-cs-gray-500 truncate">{p.name}</div>
            </span>
            {isActive && <Check className="w-3.5 h-3.5 text-cs-red shrink-0" />}
          </button>
        );
      })}
    </div>
  );
}

function getActivePersonaId(user: CurrentUser, scoped: PersonaPreset[]): string {
  if (user.role === "owner") return "owner";
  if (user.role === "operations") return "operations";
  const match = scoped.find(
    (p) => p.role === user.role && p.branchScope === user.branchScope,
  );
  return match?.personaId || "";
}
