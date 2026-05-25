import { formatCurrency } from "@/lib/utils";

// Revenue by Branch (Weighted to Gachibowli & Hitech City)
export const branchRevenueData = [
  { branch: "Hitech City", revenue: 3512400 },
  { branch: "Gachibowli", revenue: 3184800 },
  { branch: "Raidurg", revenue: 1462000 },
  { branch: "Kondapur", revenue: 844000 },
  { branch: "Shaikpet-I", revenue: 526000 },
  { branch: "Shaikpet-II", revenue: 408000 },
];

export const totalRevenue = branchRevenueData.reduce((acc, curr) => acc + curr.revenue, 0);

// Generate 30 days of historical data
// User constraints: 
// - Mon-Fri: 75%-92%
// - Sat-Sun: 10%-25%
// - Churn Spike Narrative: 14-18 days ago (Day 12-16 in array if today is Day 30) -> huge dip

const today = new Date();
export const occupancyTrendData = Array.from({ length: 30 }).map((_, i) => {
  const date = new Date(today);
  date.setDate(date.getDate() - (29 - i));
  const dayOfWeek = date.getDay(); // 0 is Sunday, 6 is Saturday
  const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
  
  // 14 to 18 days ago means (29 - i) is between 14 and 18.
  // So i is between 11 and 15.
  const daysAgo = 29 - i;
  const isChurnSpike = daysAgo >= 14 && daysAgo <= 18;
  
  const generateBase = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1) + min);
  
  let baseHitech = isWeekend ? generateBase(12, 25) : generateBase(78, 92);
  let baseGachibowli = isWeekend ? generateBase(10, 22) : generateBase(75, 90);
  let baseRaidurg = isWeekend ? generateBase(15, 25) : generateBase(80, 92);
  let baseKondapur = isWeekend ? generateBase(10, 20) : generateBase(70, 85);
  let baseShaikpet1 = isWeekend ? generateBase(8, 18) : generateBase(65, 80);
  let baseShaikpet2 = isWeekend ? generateBase(8, 15) : generateBase(60, 75);
  
  if (isChurnSpike && !isWeekend) {
    // The "Churn Spike" Narrative Hook - drop weekday occupancy significantly 
    // to simulate missed renewals/cancellations that happened mid-month.
    baseHitech -= 35;
    baseGachibowli -= 30;
    baseRaidurg -= 40;
    baseKondapur -= 30;
    baseShaikpet1 -= 25;
    baseShaikpet2 -= 20;
  }
  
  return {
    date: date.toLocaleDateString("en-US", { month: "short", day: "numeric" }),
    "Hitech City": Math.max(0, baseHitech),
    "Gachibowli": Math.max(0, baseGachibowli),
    "Raidurg": Math.max(0, baseRaidurg),
    "Kondapur": Math.max(0, baseKondapur),
    "Shaikpet-I": Math.max(0, baseShaikpet1),
    "Shaikpet-II": Math.max(0, baseShaikpet2),
  };
});

// Branch overview table data
export const branchOverviewData = [
  { id: "b1", name: "Hitech City", occupancy: 82, members: 210, mrr: 3512400, overdue: 0, health: "Healthy" },
  { id: "b2", name: "Gachibowli", occupancy: 78, members: 195, mrr: 3184800, overdue: 1, health: "Watch" },
  { id: "b3", name: "Raidurg", occupancy: 85, members: 140, mrr: 1462000, overdue: 0, health: "Healthy" },
  { id: "b4", name: "Kondapur", occupancy: 71, members: 110, mrr: 844000, overdue: 0, health: "Healthy" },
  { id: "b5", name: "Shaikpet-I", occupancy: 68, members: 85, mrr: 526000, overdue: 2, health: "Action" },
  { id: "b6", name: "Shaikpet-II", occupancy: 61, members: 72, mrr: 408000, overdue: 1, health: "Watch" },
];
