import { Card } from "@/components/ui/card";
import { AlertCircle, FileWarning, Clock, UserPlus, Info } from "lucide-react";
import { cn } from "@/lib/utils";

const alerts = [
  {
    id: 1,
    type: "critical",
    message: "Ravi Kumar contract ends in 5 days — no renewal",
    time: "2h ago",
    branch: "Gachibowli",
    icon: AlertCircle
  },
  {
    id: 2,
    type: "warning",
    message: "Room A double-booking attempt prevented",
    time: "4h ago",
    branch: "Hitech City",
    icon: FileWarning
  },
  {
    id: 3,
    type: "critical",
    message: "Invoice ₹14,000 overdue 18 days — TechNest Solutions",
    time: "Today",
    branch: "Raidurg",
    icon: Clock
  },
  {
    id: 4,
    type: "success",
    message: "New member: Priya Mehta onboarded, Dedicated Desk",
    time: "Today",
    branch: "Gachibowli",
    icon: UserPlus
  },
  {
    id: 5,
    type: "warning",
    message: "Meghana Rao — 20 days since last visit",
    time: "1d ago",
    branch: "Hitech City",
    icon: Info
  },
  {
    id: 6,
    type: "critical",
    message: "Shaikpet-I occupancy below 60% threshold",
    time: "2d ago",
    branch: "Shaikpet-I",
    icon: AlertCircle
  }
];

export function AlertFeed() {
  return (
    <Card className="col-span-1 shadow-sm flex flex-col bg-white overflow-hidden">
      <div className="flex items-center justify-between p-5 border-b border-cs-gray-100">
        <div className="flex items-center gap-2">
          <h3 className="font-semibold text-cs-black font-heading">Live Alerts</h3>
          <span className="relative flex h-2.5 w-2.5 ml-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-status-green opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-status-green"></span>
          </span>
          <span className="text-[10px] uppercase font-bold text-status-green tracking-wider ml-1">Live</span>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {alerts.map((alert) => (
          <div 
            key={alert.id}
            className={cn(
              "p-3 rounded-lg border-l-4 shadow-sm bg-white border border-cs-gray-100/50 flex gap-3 animate-in fade-in slide-in-from-right-4 duration-500",
              alert.type === "critical" ? "border-l-status-red" : 
              alert.type === "warning" ? "border-l-status-amber" : 
              "border-l-status-green"
            )}
            style={{ animationFillMode: "both", animationDelay: `${alert.id * 100}ms` }}
          >
            <div className={cn(
              "mt-0.5",
              alert.type === "critical" ? "text-status-red" : 
              alert.type === "warning" ? "text-status-amber" : 
              "text-status-green"
            )}>
              <alert.icon className="w-4 h-4" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13px] font-medium text-cs-black leading-snug">
                {alert.message}
              </p>
              <div className="flex items-center gap-2 mt-1.5">
                <span className="text-[11px] text-cs-gray-500 bg-cs-gray-50 px-1.5 py-0.5 rounded">
                  {alert.branch}
                </span>
                <span className="text-[11px] text-cs-gray-400">
                  {alert.time}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
