import { Member } from "@/types";

export function calculateRiskScore(member: Member): number {
  let score = 0;

  const daysSinceLastVisit = member.daysSinceLastVisit || 0;
  
  // Calculate days to contract end based on contractEnd date string
  const contractEnd = new Date(member.contractEnd);
  const now = new Date();
  const diffTime = contractEnd.getTime() - now.getTime();
  const daysToContractEnd = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  const openTickets = member.tickets?.filter(t => t.status === "open").length || 0;
  const hasPaymentDelay = member.invoices?.some(i => i.status === "overdue") || false;

  if (daysSinceLastVisit > 20) score += 30;
  else if (daysSinceLastVisit > 10) score += 15;

  if (daysToContractEnd < 14) score += 30;
  else if (daysToContractEnd < 30) score += 20;
  else if (daysToContractEnd < 60) score += 10;

  if (openTickets >= 2) score += 20;
  else if (openTickets === 1) score += 10;

  // Assuming visitTrend isn't explicitly in the member object but we'll add a check if it's declining
  // In a real app we'd compute this from check-in logs
  const visitTrend = member.avgVisitsPerMonth && member.avgVisitsPerMonth < 8 ? "declining" : "stable";
  if (visitTrend === "declining") score += 15;

  if (hasPaymentDelay) score += 10;

  return Math.min(score, 100);
}

export function getRiskColor(score: number): string {
  if (score >= 70) return "text-status-red";
  if (score >= 40) return "text-status-amber";
  return "text-status-green";
}
