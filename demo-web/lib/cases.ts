// Document sets for the 14 deductions that are not the Amazon PO 4388 golden path.
// No new numbers: every figure shown comes from the deduction row itself (demo-data.md).

import { PORTALS, type Deduction } from "./data";

export interface CaseDoc {
  name: string;
  /** Where Shortstop looks for it. */
  source: string;
  /** Who is asked for it when no connected source has it. */
  holder: string;
  /** What this document proves in a dispute. */
  proves: string;
}

export interface CaseInfo {
  claim: string;
  /** Exactly three documents. The first `evidence` of them are on file. */
  docs: [CaseDoc, CaseDoc, CaseDoc];
  win: string;
}

const remit = (d: Deduction): CaseDoc => ({
  name: "Retailer remittance",
  source: PORTALS[d.retailer],
  holder: d.retailer,
  proves: "Shows the deduction, its code and the amount taken",
});
const invoice: CaseDoc = { name: "Invoice", source: "NetSuite", holder: "Finance", proves: "Shows what was billed and on what terms" };

const BY_TYPE: Record<string, (d: Deduction) => CaseInfo> = {
  Freight: (d) => ({
    claim: "Amazon charged back freight it says the brand should have paid.",
    docs: [remit(d), invoice, { name: "Carrier freight bill", source: "Carrier and 3PL", holder: "the carrier", proves: "Shows who paid the freight and under which terms" }],
    win: "If the freight bill shows prepaid terms, the chargeback is invalid.",
  }),
  "Late truck": (d) => ({
    claim: "Walmart fined the shipment for arriving outside its delivery window.",
    docs: [remit(d), { name: "Delivery appointment confirmation", source: "Walmart Retail Link", holder: "Walmart", proves: "Shows the appointment Walmart agreed to" }, { name: "Signed proof of delivery", source: "Carrier and 3PL", holder: "the carrier", proves: "Shows the actual arrival time at the dock" }],
    win: "If the signed arrival time is inside the appointment, the fine is invalid.",
  }),
  Compliance: (d) => ({
    claim: "Walmart fined the shipment for a labelling or packing rule.",
    docs: [remit(d), { name: "Routing guide acknowledgement", source: "Walmart Retail Link", holder: "Walmart", proves: "Shows which rule version applied on the ship date" }, { name: "Label and pallet photos", source: "Carrier and 3PL", holder: "the 3PL warehouse", proves: "Shows the shipment met the rule" }],
    win: "Photos taken at pack out are the usual proof that the rule was met.",
  }),
  Promo: (d) => ({
    claim: "Target deducted a promotion charge against an October invoice.",
    docs: [{ name: "Promotion agreement", source: "NetSuite", holder: "Sales", proves: "Shows the promotion that was actually agreed" }, invoice, { name: "Proof of performance", source: PORTALS[d.retailer], holder: "the sales team", proves: "Shows whether the promotion ran as agreed" }],
    win: "If the charge is larger than the agreement allows, the difference is disputable.",
  }),
  Pricing: (d) => ({
    claim: "Costco paid a lower price than the invoice.",
    docs: [remit(d), invoice, { name: "Signed price agreement", source: "NetSuite", holder: "the sales team", proves: "Shows the price both sides agreed for the period" }],
    win: "If the invoice price matches the signed agreement, the deduction is invalid.",
  }),
  Returns: (d) => ({
    claim: "Kroger deducted for product it says it returned.",
    docs: [remit(d), { name: "Return authorization", source: PORTALS[d.retailer], holder: "Kroger", proves: "Shows whether the return was ever approved" }, { name: "Carrier return receipt", source: "Carrier and 3PL", holder: "the carrier", proves: "Shows whether the product physically came back" }],
    win: "With no authorization and no return receipt, the deduction has no basis.",
  }),
  Duplicate: (d) => ({
    claim: "Kroger took the same deduction that already appears on an earlier remittance.",
    docs: [remit(d), { name: "Earlier remittance", source: PORTALS[d.retailer], holder: "Kroger", proves: "Shows the same deduction was already taken once" }, invoice],
    win: "Two remittances showing the same deduction against one invoice is the whole case.",
  }),
  Routing: (d) => ({
    claim: "Walmart fined the shipment for not following its routing instructions.",
    docs: [remit(d), { name: "Bill of lading", source: "Carrier and 3PL", holder: "the carrier", proves: "Shows the carrier and route actually used" }, { name: "Routing instructions", source: "Walmart Retail Link", holder: "Walmart", proves: "Shows the instructions issued for this order" }],
    win: "If the bill of lading matches the routing instructions, the fine is invalid.",
  }),
  Coupon: (d) => ({
    claim: "Amazon deducted a coupon charge.",
    docs: [remit(d), { name: "Coupon agreement", source: "NetSuite", holder: "the sales team", proves: "Shows the coupon terms that were agreed" }, { name: "Redemption report", source: PORTALS[d.retailer], holder: "Amazon", proves: "Shows how many coupons were actually redeemed" }],
    win: "The redemption report against the agreement shows whether the charge is right.",
  }),
  Allowance: (d) => ({
    claim: "Kroger deducted an allowance against an October invoice.",
    docs: [remit(d), invoice, { name: "Allowance agreement", source: "NetSuite", holder: "the sales team", proves: "Shows which allowance was agreed and for how long" }],
    win: "If no allowance was agreed for the period, the deduction is invalid.",
  }),
  "Fill rate": (d) => ({
    claim: "Costco fined the order for shipping less than it ordered.",
    docs: [remit(d), { name: "Purchase order confirmation", source: PORTALS[d.retailer], holder: "Costco", proves: "Shows the quantity both sides confirmed" }, { name: "Signed proof of delivery", source: "Carrier and 3PL", holder: "the carrier", proves: "Shows the quantity that actually arrived" }],
    win: "If the delivered quantity matches the confirmed order, the fine is invalid.",
  }),
  Markdown: (d) => ({
    claim: "Target deducted a markdown charge.",
    docs: [remit(d), { name: "Markdown agreement", source: "NetSuite", holder: "the sales team", proves: "Shows whether a markdown was ever agreed" }, { name: "Sell through report", source: PORTALS[d.retailer], holder: "Target", proves: "Shows the units the markdown was applied to" }],
    win: "A markdown nobody agreed to is disputable in full.",
  }),
  "Short ship": (d) => ({
    claim: "Walmart says fewer cases arrived than were invoiced.",
    docs: [remit(d), { name: "Advance ship notice", source: "Walmart Retail Link", holder: "Walmart", proves: "Shows the quantity declared before shipping" }, { name: "Signed proof of delivery", source: "Carrier and 3PL", holder: "the carrier", proves: "Shows the quantity signed for at the dock" }],
    win: "A signed proof of delivery for the full quantity wins this, as it did for Amazon PO 4388.",
  }),
  Damage: (d) => ({
    claim: "Costco deducted for product it says arrived damaged.",
    docs: [remit(d), { name: "Signed proof of delivery", source: "Carrier and 3PL", holder: "the carrier", proves: "Shows whether damage was noted when the driver was still there" }, { name: "Damage claim report", source: PORTALS[d.retailer], holder: "Costco", proves: "Shows what Costco says was damaged, with photos" }],
    win: "A clean signature with no exceptions noted is the strongest answer to a damage claim.",
  }),
};

export function caseFor(d: Deduction): CaseInfo {
  const make = BY_TYPE[d.type];
  if (make) return make(d);
  return {
    claim: `${d.retailer} deducted this amount from an October payment.`,
    docs: [remit(d), invoice, { name: "Supporting proof", source: "Carrier and 3PL", holder: "the carrier", proves: "Shows what actually happened" }],
    win: "The supporting proof decides whether this is worth disputing.",
  };
}

/** How each source is connected. Shown on the Connect page. */
export interface ConnectInfo {
  method: string;
  how: string[];
  reads: string[];
  writes: string;
  authSteps: string[];
}

const portal = (name: string, reads: string[]): ConnectInfo => ({
  method: "Add Shortstop as a read only user in the portal",
  how: [
    `Your ${name} admin invites Shortstop as a user with a read only role.`,
    "Shortstop signs in with its own login, so nobody shares a password.",
    "You can remove that user in the portal at any time and access stops at once.",
  ],
  reads,
  writes: "Files a dispute only after a person approves it in Shortstop.",
  authSteps: [`Opened ${name}`, "Invitation accepted, read only role", "Test read of October remittances", "Connected"],
});

export const CONNECT: Record<string, ConnectInfo> = {
  amazon: portal("Amazon Vendor Central", ["Remittances and payment detail", "Shortage and chargeback claims", "Dispute status"]),
  walmart: portal("Walmart Retail Link", ["Remittances and payment detail", "Compliance and routing claims", "ASN status"]),
  target: portal("Target Partners Online", ["Remittances and payment detail", "Promotion and markdown claims"]),
  kroger: portal("the Kroger supplier portal", ["Remittances and payment detail", "Returns and allowance claims"]),
  costco: portal("the Costco supplier portal", ["Remittances and payment detail", "Pricing and fill rate claims"]),
  carrier: {
    method: "Forward delivery emails, or connect the carrier account",
    how: [
      "Shortstop gives you a private inbox address.",
      "You add one forwarding rule so carrier and 3PL emails with proofs of delivery land there.",
      "Where the carrier has an account login, Shortstop is added as a read only user as well.",
    ],
    reads: ["Signed proofs of delivery", "Advance ship notices", "Carrier emails and tracking"],
    writes: "Sends a request for a missing document only when you click Gather evidence.",
    authSteps: ["Created a private inbox", "Forwarding rule detected", "Read the October proofs of delivery", "Connected"],
  },
  erp: {
    method: "Sign in to NetSuite and approve access",
    how: [
      "You are sent to NetSuite to sign in. Shortstop never sees your password.",
      "You approve a role limited to invoices, purchase orders and credits.",
      "NetSuite gives Shortstop a token you can revoke from NetSuite at any time.",
    ],
    reads: ["Invoices and purchase orders", "Customer payments and credits", "Promotion and price agreements"],
    writes: "Posts a recovered payment against its invoice, only after the retailer pays.",
    authSteps: ["Opened NetSuite sign in", "Access approved for the limited role", "Read the October invoices", "Connected"],
  },
  ramp: {
    method: "Sign in to Ramp and approve access",
    how: [
      "You are sent to Ramp to sign in. Shortstop never sees your password.",
      "You approve access to deposits and reconciliation only.",
      "You can remove the connection from Ramp at any time.",
    ],
    reads: ["Incoming deposits", "Reconciliation status"],
    writes: "Matches a recovered deposit to its dispute, only after the retailer pays.",
    authSteps: ["Opened Ramp sign in", "Access approved", "Read October deposits", "Connected"],
  },
};
