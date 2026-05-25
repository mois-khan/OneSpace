"use client";

import { Search, Bell } from "lucide-react";
import { usePathname } from "next/navigation";

export function TopBar() {
  const pathname = usePathname();
  
  const getPageTitle = () => {
    if (pathname.includes("/dashboard")) return "Dashboard";
    if (pathname.includes("/floor-map")) return "Floor Map";
    if (pathname.includes("/members")) return "Members";
    if (pathname.includes("/visitors")) return "Visitors";
    if (pathname.includes("/renewals")) return "Renewals";
    if (pathname.includes("/leads")) return "Leads";
    if (pathname.includes("/bookings")) return "Bookings";
    return "OneSpace";
  };

  return (
    <header className="h-14 bg-white border-b border-border px-6 flex items-center justify-between sticky top-0 z-10">
      <div>
        <h1 className="text-lg font-semibold text-cs-black font-heading">
          {getPageTitle()}
        </h1>
      </div>
      
      <div className="flex items-center gap-4 text-muted-foreground">
        <button className="hover:text-cs-black transition-colors">
          <Search className="w-5 h-5" />
        </button>
        <button className="hover:text-cs-black transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-0 right-0 w-2 h-2 bg-cs-red rounded-full"></span>
        </button>
        
        <div className="h-5 w-[1px] bg-border mx-2"></div>
        
        <div className="text-sm font-medium text-cs-black">
          {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
        </div>
        
        <div className="w-8 h-8 rounded-full bg-cs-red-bg flex items-center justify-center text-cs-red font-semibold text-sm border border-cs-red/20">
          A
        </div>
      </div>
    </header>
  );
}
