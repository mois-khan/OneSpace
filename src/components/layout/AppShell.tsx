"use client";

import { usePathname } from "next/navigation";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { AssistantRoot } from "@/components/assistant/AssistantRoot";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Standalone routes — no sidebar / topbar / assistant
  if (pathname === "/login" || pathname.startsWith("/checkin")) {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-cs-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar />
        <main className="flex-1 overflow-y-auto p-6">{children}</main>
      </div>
      <AssistantRoot />
    </div>
  );
}
