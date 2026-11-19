// Every number here comes from shortstop/demo-data.md. Totals are computed, never typed.

export type Retailer = "Amazon" | "Walmart" | "Target" | "Kroger" | "Costco";
export type Status = "open" | "filed" | "recovered" | "needs-approval";

export interface Flag {
  tone: "warning" | "error";
  text: string;
}

export interface Deduction {
  id: string;
  rank: number;
  retailer: Retailer;
  type: string;
  amount: number;
  deadlineDays: number;
  evidence: 1 | 2 | 3;
  status: Status;
  flag?: Flag;
  ref?: string;
}

const row = (
  rank: number,
  id: string,
  retailer: Retailer,
  type: string,
  amount: number,
  deadlineDays: number,
  evidence: 1 | 2 | 3,
  extra: Partial<Deduction> = {},
): Deduction => ({ id, rank, retailer, type, amount, deadlineDays, evidence, status: "open", ...extra });

export const SEED_DEDUCTIONS: Deduction[] = [
  row(1, "amazon-4388", "Amazon", "Shortage", 1240, 3, 3, {
    ref: "PO 4388",
    flag: { tone: "warning", text: "Dispute window closes in 3 days" },
  }),
  row(2, "amazon-freight", "Amazon", "Freight", 640, 6, 2),
  row(3, "walmart-late-truck", "Walmart", "Late truck", 360, 9, 2),
  row(4, "walmart-compliance", "Walmart", "Compliance", 290, 11, 1),
  row(5, "target-promo", "Target", "Promo", 2150, 14, 2),
  row(6, "costco-pricing", "Costco", "Pricing", 310, 16, 2),
  row(7, "kroger-returns", "Kroger", "Returns", 520, 18, 1),
  row(8, "kroger-duplicate", "Kroger", "Duplicate", 780, 21, 3, {
    flag: { tone: "error", text: "Possible duplicate of an earlier Kroger deduction" },
  }),
  row(9, "walmart-routing", "Walmart", "Routing", 375, 23, 2),
  row(10, "amazon-coupon", "Amazon", "Coupon", 265, 25, 1),
  row(11, "kroger-allowance", "Kroger", "Allowance", 455, 27, 2),
  row(12, "costco-fill-rate", "Costco", "Fill rate", 415, 30, 1),
  row(13, "target-markdown", "Target", "Markdown", 185, 33, 1),
  row(14, "walmart-short-ship", "Walmart", "Short ship", 385, 35, 2),
  row(15, "costco-damage", "Costco", "Damage", 230, 40, 1),
];

export const BRAND = "Sunny Crunch Snacks";
export const PERIOD = "October 2026";
export const INVOICED = 100000;
export const RECEIVED = 91400;
export const THRESHOLD = 1500;
export const AMAZON_ID = "amazon-4388";
export const TARGET_ID = "target-promo";

export const USER = { name: "Priya Nair", role: "AR analyst" };
export const APPROVER = { name: "Marcus Lee", role: "Controller" };

export const GUARD = {
  po: "4471",
  retailer: "Walmart" as Retailer,
  poCases: 500,
  asnCases: 480,
  gapCases: 20,
  claim: 360,
  pickup: "2:00 PM",
};

export const AMAZON_CASE = {
  po: "4388",
  invoice: "10482",
  portal: "Amazon Vendor Central",
  poCases: 500,
  asnCases: 480,
  podCases: 500,
  invoiceCases: 500,
  invoiceTotal: 31000,
  shortCases: 20,
  amount: 1240,
  podTime: "09:42",
  podConfidence: 98,
  dates: {
    shipped: "Oct 2",
    delivered: "Oct 6",
    shortPaid: "Oct 13",
    today: "Nov 9",
    windowCloses: "Nov 12",
    paid: "Dec 1",
  },
};

export const DEFAULT_GROUNDS =
  "Proof of delivery shows all 500 cases on PO 4388 delivered and signed for at 09:42 on Oct 6, with no exceptions noted. Invoice 10482 matches the PO at 500 cases. The 480 on the ASN was a paperwork error at pack out, not a short delivery. We request reversal of the $1,240 shortage deduction.";

export const RETAILERS: Retailer[] = ["Target", "Amazon", "Kroger", "Walmart", "Costco"];

export const PORTALS: Record<Retailer, string> = {
  Amazon: "Amazon Vendor Central",
  Walmart: "Walmart Retail Link",
  Target: "Target Partners Online",
  Kroger: "Kroger supplier portal",
  Costco: "Costco supplier portal",
};

export type SourceId = "amazon" | "walmart" | "target" | "kroger" | "costco" | "carrier" | "erp" | "ramp";

export const SOURCES: { id: SourceId; name: string; kind: string; brings: string }[] = [
  { id: "amazon", name: "Amazon Vendor Central", kind: "Retailer portal", brings: "Remittances, shortage claims, dispute filing" },
  { id: "walmart", name: "Walmart Retail Link", kind: "Retailer portal", brings: "Remittances, compliance claims, ASN status" },
  { id: "target", name: "Target Partners Online", kind: "Retailer portal", brings: "Remittances, promo and markdown claims" },
  { id: "kroger", name: "Kroger", kind: "Retailer portal", brings: "Remittances, returns and allowance claims" },
  { id: "costco", name: "Costco", kind: "Retailer portal", brings: "Remittances, pricing and fill rate claims" },
  { id: "carrier", name: "Carrier and 3PL", kind: "Logistics", brings: "Signed proofs of delivery, ASNs, carrier emails" },
  { id: "erp", name: "NetSuite", kind: "ERP", brings: "Invoices, purchase orders, cash application" },
  { id: "ramp", name: "Ramp", kind: "Finance", brings: "Recovered cash posted against the right invoice" },
];

export const usd = (n: number) => "$" + n.toLocaleString("en-US");
export const days = (n: number) => `${n} days`;
export const sum = (xs: number[]) => xs.reduce((a, b) => a + b, 0);
