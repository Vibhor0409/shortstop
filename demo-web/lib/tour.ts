export type AutoAction = "connectAll" | "updateAsn" | "startDraft" | "file" | "payout";

export interface TourStep {
  chapter: string;
  route: string;
  target?: string;
  /** Store event that completes this step. */
  waitFor?: string;
  /** What Next does when the step waits for an action. Without it, Next simply moves on. */
  auto?: AutoAction;
  see: string;
  did: string;
  why: string;
}

export const STEPS: TourStep[] = [
  {
    chapter: "Connect",
    route: "/connect",
    target: "connect-all",
    waitFor: "imported",
    auto: "connectAll",
    see: "Eight sources: five retailer portals, the carrier, NetSuite and Ramp.",
    did: "Nothing yet. Connect them and Shortstop reads October for you.",
    why: "Deduction evidence lives in eight places. Nobody can win a dispute from one of them.",
  },
  {
    chapter: "Connect",
    route: "/connect",
    target: "open-dashboard",
    see: "October is imported: 15 deductions, $8,600 short-paid.",
    did: "Matched every retailer payment to its invoice and ranked what is missing.",
    why: "This is the work an AR analyst does by hand in spreadsheets each month.",
  },
  {
    chapter: "Overview",
    route: "/dashboard",
    target: "guard-card",
    see: "Invoiced, received, and the gap between them, split by retailer.",
    did: "Split the gap into at risk, filed and recovered. Guard also caught one live shipment.",
    why: "Finance sees where cash leaked and what is being done about it, on one page.",
  },
  {
    chapter: "Guard",
    route: "/guard/4471",
    target: "update-asn",
    waitFor: "asn-updated",
    auto: "updateAsn",
    see: "Walmart PO 4471 says 500 cases. The ASN says 480. The truck leaves at 2:00 PM.",
    did: "Compared the PO and the ASN before pickup and flagged the 20 case gap.",
    why: "Fixing paperwork now is free. Fighting a $360 claim later is not.",
  },
  {
    chapter: "Guard",
    route: "/guard/4471",
    target: "open-queue",
    see: "The ASN now says 500 and the check passes.",
    did: "Resubmitted the ASN to Walmart and logged $360 as shortage avoided.",
    why: "The cheapest deduction is the one that never happens.",
  },
  {
    chapter: "Recover",
    route: "/recover",
    target: "row-amazon-4388",
    see: "All 15 deductions, ranked by deadline, then by amount and win probability.",
    did: "Checked which have all 3 proofs and flagged a closing window and a possible duplicate.",
    why: "Analysts work the queue top down and never miss a dispute window.",
  },
  {
    chapter: "Recover",
    route: "/recover/amazon-4388",
    target: "citation-pod",
    waitFor: "citation",
    see: "Shortstop's read: dispute recommended, with each reason tied to a document.",
    did: "Matched PO, ASN, proof of delivery and invoice. Click the POD chip to see the proof.",
    why: "A person can verify the claim in seconds instead of trusting a black box.",
  },
  {
    chapter: "Recover",
    route: "/recover/amazon-4388",
    target: "teach",
    waitFor: "rule-saved",
    see: "The signed proof of delivery, with the signature line highlighted.",
    did: "Shortstop can learn from it. Click Teach Shortstop, then the signature, then save.",
    why: "One correction becomes a rule for every future Amazon shortage.",
  },
  {
    chapter: "Dispute",
    route: "/recover/amazon-4388",
    target: "draft-dispute",
    waitFor: "drafted",
    auto: "startDraft",
    see: "The action bar. Draft dispute is the one main action.",
    did: "Ready to fill Amazon's dispute form from the matched documents.",
    why: "Drafting is the slow part. Shortstop shows its progress as milestones, not a spinner.",
  },
  {
    chapter: "Dispute",
    route: "/recover/amazon-4388",
    target: "file-dispute",
    waitFor: "filed",
    auto: "file",
    see: "A draft in Amazon's format: 4 fields and the grounds, all editable.",
    did: "Drafted and cited. It is under $1,500, so one approver is enough.",
    why: "The AI drafts. A person always files. Nothing is sent until you click.",
  },
  {
    chapter: "Dispute",
    route: "/recover/amazon-4388",
    target: "open-approvals",
    see: "Status is Filed. The tracker starts and a toast offers Undo.",
    did: "Queue 15 to 14. At risk $8,600 to $7,360. Filed, pending $0 to $1,240.",
    why: "Money only counts as recovered after payout. Until then it is filed, pending.",
  },
  {
    chapter: "Approvals",
    route: "/approvals/target-promo",
    target: "request-approval",
    see: "Target Promo, $2,150. That is over the $1,500 threshold.",
    did: "Routed it to Marcus Lee, Controller. Priya cannot approve her own dispute.",
    why: "Maker and checker are different people, which is what auditors ask for.",
  },
  {
    chapter: "Ledger",
    route: "/ledger",
    target: "simulate-payout",
    waitFor: "payout",
    auto: "payout",
    see: "The Amazon dispute, filed Nov 9 and now in retailer review.",
    did: "Tracking it. In this demo you play Amazon: simulate the payout.",
    why: "Filing is not winning. The ledger follows the dispute until cash lands.",
  },
  {
    chapter: "Ledger",
    route: "/ledger",
    target: "open-settings",
    see: "Recovered $1,240. Paid Dec 1 and synced the same day.",
    did: "Posted the payout to NetSuite and Ramp against invoice 10482.",
    why: "Recovered cash that never reaches the books is not really recovered.",
  },
  {
    chapter: "Controls",
    route: "/settings",
    target: "open-done",
    see: "The $1,500 threshold, the rules, and each retailer's dispute window.",
    did: "Applies these on every dispute. Window lengths are marked to verify with the retailer.",
    why: "Finance sets the guardrails. Shortstop works inside them.",
  },
  {
    chapter: "Done",
    route: "/done",
    see: "Before and after, from the same store that drove every page.",
    did: "Prevented one shortage and recovered one invalid deduction, with a human filing.",
    why: "That is the loop: stop deductions before they ship, recover the ones that slipped through.",
  },
];

export const FIGMA_URL = "https://www.figma.com/design/VrTJIo13NQVUV6yARJc196";
