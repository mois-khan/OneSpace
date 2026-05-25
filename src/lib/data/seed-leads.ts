import { Lead } from "@/types";

export const initialLeads: Lead[] = [
  // NEW (9)
  {
    id: "l-001", branchId: "b1", name: "Sahil Gupta", company: "EdTech Solutions",
    phone: "+91 98765 10001", planType: "Cabin", source: "Website", stage: "new",
    mrr: 22000, assignedTo: "Arun", createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "l-002", branchId: "b2", name: "Ritika Jain", company: "Freelance Design",
    phone: "+91 98765 10002", planType: "Flexi", source: "Google", stage: "new",
    mrr: 7999, assignedTo: "Neha", createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "l-003", branchId: "b1", name: "Karan Mehta", company: "MarketPro Agency",
    phone: "+91 98765 10003", planType: "Dedicated", source: "Referral", stage: "new",
    mrr: 12000, assignedTo: "Arun", createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "l-004", branchId: "b3", name: "Aditi Rao", company: "StartRight Inc",
    phone: "+91 98765 10004", planType: "Cabin", source: "WhatsApp", stage: "new",
    mrr: 25000, assignedTo: "Rahul", createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "l-005", branchId: "b1", name: "Sameer Patil", company: "IndieDevs",
    phone: "+91 98765 10005", planType: "Dedicated", source: "WhatsApp", stage: "new",
    mrr: 12000, assignedTo: "Priya", createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "l-006", branchId: "b2", name: "Natasha Singh", company: "",
    phone: "+91 98765 10006", planType: "Flexi", source: "Walk-in", stage: "new",
    mrr: 7999, assignedTo: "Neha", createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "l-007", branchId: "b4", name: "Rishabh K", company: "CyberShield",
    phone: "+91 98765 10007", planType: "Cabin", source: "Referral", stage: "new",
    mrr: 35000, assignedTo: "Arun", createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "l-008", branchId: "b1", name: "Tanya Desai", company: "Desai Legal",
    phone: "+91 98765 10008", planType: "Cabin", source: "WhatsApp", stage: "new",
    mrr: 18000, assignedTo: "Priya", createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "l-009", branchId: "b5", name: "Aman Varma", company: "",
    phone: "+91 98765 10009", planType: "Dedicated", source: "WhatsApp", stage: "new",
    mrr: 12000, assignedTo: "Neha", createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
  },

  // TOURED (6)
  {
    id: "l-010", branchId: "b1", name: "Anjali Verma", company: "LegalEase Pvt Ltd",
    phone: "+91 98765 10010", planType: "Dedicated", source: "Walk-in", stage: "toured",
    mrr: 15000, assignedTo: "Arun", createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "l-011", branchId: "b2", name: "Mohit Agarwal", company: "AppMakers",
    phone: "+91 98765 10011", planType: "Cabin", source: "Google", stage: "toured",
    mrr: 28000, assignedTo: "Rahul", createdAt: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "l-012", branchId: "b3", name: "Sneha Nair", company: "CloudSync Solutions",
    phone: "+91 98765 10012", planType: "Cabin", source: "Referral", stage: "toured",
    mrr: 45000, assignedTo: "Neha", createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "l-013", branchId: "b1", name: "Vikram Das", company: "",
    phone: "+91 98765 10013", planType: "Flexi", source: "WhatsApp", stage: "toured",
    mrr: 7999, assignedTo: "Priya", createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "l-014", branchId: "b2", name: "Pooja Hegde", company: "DesignPro",
    phone: "+91 98765 10014", planType: "Dedicated", source: "WhatsApp", stage: "toured",
    mrr: 12000, assignedTo: "Arun", createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "l-015", branchId: "b4", name: "Gaurav Singh", company: "VentureBox",
    phone: "+91 98765 10015", planType: "Cabin", source: "Referral", stage: "toured",
    mrr: 32000, assignedTo: "Rahul", createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
  },

  // PROPOSAL SENT (5)
  {
    id: "l-016", branchId: "b1", name: "Deepak Choudhury", company: "DataForge Analytics",
    phone: "+91 98765 10016", planType: "Cabin", source: "WhatsApp", stage: "proposal",
    mrr: 55000, assignedTo: "Arun", createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "l-017", branchId: "b2", name: "Swati Joshi", company: "GrowthHackers",
    phone: "+91 98765 10017", planType: "Dedicated", source: "Google", stage: "proposal",
    mrr: 24000, assignedTo: "Priya", createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "l-018", branchId: "b3", name: "Arjun Pandey", company: "PixelCraft Studios",
    phone: "+91 98765 10018", planType: "Cabin", source: "Referral", stage: "proposal",
    mrr: 42000, assignedTo: "Neha", createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "l-019", branchId: "b1", name: "Neha Sharma", company: "",
    phone: "+91 98765 10019", planType: "Flexi", source: "Walk-in", stage: "proposal",
    mrr: 7999, assignedTo: "Rahul", createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "l-020", branchId: "b4", name: "Vijay Chauhan", company: "UrbanGrid Design",
    phone: "+91 98765 10020", planType: "Cabin", source: "WhatsApp", stage: "proposal",
    mrr: 22000, assignedTo: "Arun", createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
  },

  // NEGOTIATING (4)
  {
    id: "l-021", branchId: "b1", name: "Srinivas Rao", company: "CloudBase Tech",
    phone: "+91 98765 10021", planType: "Cabin", source: "Referral", stage: "negotiating",
    mrr: 25000, assignedTo: "Arun", createdAt: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "l-022", branchId: "b2", name: "Deepika Nair", company: "SwiftPay Fintech",
    phone: "+91 98765 10022", planType: "Cabin", source: "WhatsApp", stage: "negotiating",
    mrr: 38000, assignedTo: "Priya", createdAt: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "l-023", branchId: "b3", name: "Rohit Saxena", company: "FinServe",
    phone: "+91 98765 10023", planType: "Dedicated", source: "Google", stage: "negotiating",
    mrr: 12000, assignedTo: "Neha", createdAt: new Date(Date.now() - 11 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "l-024", branchId: "b1", name: "Fatima Khan", company: "Khan Associates",
    phone: "+91 98765 10024", planType: "Cabin", source: "Referral", stage: "negotiating",
    mrr: 28000, assignedTo: "Rahul", createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },

  // WON (7)
  {
    id: "l-025", branchId: "b1", name: "Priya Mehta", company: "NimbleCloud Pvt. Ltd.",
    phone: "+91 98765 10025", planType: "Dedicated", source: "WhatsApp", stage: "won",
    mrr: 12000, assignedTo: "Arun", createdAt: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "l-026", branchId: "b2", name: "Manish Gupta", company: "Gupta Corp",
    phone: "+91 98765 10026", planType: "Cabin", source: "Google", stage: "won",
    mrr: 22000, assignedTo: "Neha", createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "l-027", branchId: "b1", name: "Divya Kapoor", company: "",
    phone: "+91 98765 10027", planType: "Flexi", source: "Walk-in", stage: "won",
    mrr: 7999, assignedTo: "Priya", createdAt: new Date(Date.now() - 18 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "l-028", branchId: "b3", name: "Amit Jha", company: "DevStream Inc.",
    phone: "+91 98765 10028", planType: "Dedicated", source: "WhatsApp", stage: "won",
    mrr: 15000, assignedTo: "Rahul", createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "l-029", branchId: "b4", name: "Sunita Bhatt", company: "Bhatt Consultants",
    phone: "+91 98765 10029", planType: "Cabin", source: "Referral", stage: "won",
    mrr: 30000, assignedTo: "Arun", createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "l-030", branchId: "b1", name: "Rajesh Khanna", company: "",
    phone: "+91 98765 10030", planType: "Flexi", source: "WhatsApp", stage: "won",
    mrr: 7999, assignedTo: "Neha", createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "l-031", branchId: "b2", name: "Asha Mohan", company: "NexGen AI",
    phone: "+91 98765 10031", planType: "Cabin", source: "Google", stage: "won",
    mrr: 45000, assignedTo: "Priya", createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
  },

  // LOST (3)
  {
    id: "l-032", branchId: "b1", name: "Kunal Bose", company: "Bose Builders",
    phone: "+91 98765 10032", planType: "Cabin", source: "WhatsApp", stage: "lost",
    mrr: 60000, assignedTo: "Arun", lossReason: "Too expensive", createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "l-033", branchId: "b3", name: "Rashmi Shetty", company: "Design Labs",
    phone: "+91 98765 10033", planType: "Dedicated", source: "Google", stage: "lost",
    mrr: 24000, assignedTo: "Neha", lossReason: "Chose competitor", createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: "l-034", branchId: "b2", name: "Tarun Malik", company: "",
    phone: "+91 98765 10034", planType: "Flexi", source: "Walk-in", stage: "lost",
    mrr: 7999, assignedTo: "Rahul", lossReason: "No response", createdAt: new Date(Date.now() - 40 * 24 * 60 * 60 * 1000).toISOString(),
  },
];
