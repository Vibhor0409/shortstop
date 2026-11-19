# Shortstop — product brief outline (for approval)

Team Divib · BBS x Ramp Hackathon, product design track · due Tue Nov 10, 11:59 PM PT
Submission = project name + Figma mockup link + product brief (Google Doc or PDF, MAX 2 PAGES). No video. This outline is the source for the 2-page brief.
Status: OUTLINE ONLY. Approve or correct before Figma work starts. Four number decisions approved Nov 9. The brief stands on its own; the earlier demo video is not referenced.

**One line:** Stop the short-pay. Guard catches a deduction before the truck leaves; Recover wins it back after payment, with proof attached and a human approving every filing. Ramp checks money out. Shortstop checks money in.

The judges asked for three things. The brief is built around them, in this order:
**A. How it works in practice → B. Product implementation → C. Roadmap.**
Problem and users come first as a short setup (1 page).

---

## Setup (≈1 page): problem and users

- **The story in one month:** In October, Sunny Crunch Snacks invoiced $100,000 across 5 retailers (Amazon, Walmart, Target, Kroger, Costco). $91,400 arrived. $8,600 was short-paid across 15 deduction lines, with no explanation beyond a code on each remittance.
- **By retailer (sums to $8,600):** Target $2,335 (2) · Amazon $2,145 (3) · Kroger $1,755 (3) · Walmart $1,410 (4) · Costco $955 (3).
- **The 15 lines** (sum = $8,600, checked): Shortage $1,240 · Fill rate $415 · Late truck $360 · Compliance $290 · Promo $2,150 · Freight $640 · Markdown $185 · Returns $520 · Pricing $310 · Damage $230 · Duplicate $780 · Allowance $455 · Routing $375 · Coupon $265 · Short ship $385.
- **Why it stays lost:** 20 portals; $50–100 per line to dispute by hand (IOFM benchmark); 97% of small deductions auto-written-off (Credit Research Foundation, 2023 survey); dispute windows as short as 30 days (Amazon shortage window, SupplyPike).
- **Users:** Primary, day 1: AR / deduction analyst at a $10M–$100M CPG brand. Secondary: ops / finance lead (approves above threshold, owns the cash picture). Later: CFO (one recovered-dollars number).
- **Not for (yet):** brands under ~$10M (volume too low to pay back) and enterprise brands over $100M with custom trade-promotion systems.
- **Job Stories (4):** Guard / Recover queue / Evidence + human approval / Recovered-dollars ledger, worded exactly as in the guide.

---

## A. How it works in practice (≈2 pages, the strongest section)

**A1. Two moments, one product.**
- *Guard runs when the ASN is created, before pickup.* Example: Walmart PO 4471. The ASN says 480 cases and the PO says 500, so 20 cases short and a $360 shortage claim if shipped as-is. One action: **Update ASN**, before the 2pm pickup.
- *Recover runs every day on new remittances.* It splits the $8,600 into 15 classified deductions, ranks them, assembles the evidence, drafts the dispute and waits for a human.
- *The flywheel:* every deduction Recover wins teaches Guard a rule. The same mistake shows up on two orders: Amazon PO 4388 went out with an ASN miscount (480 vs 500) and became a $1,240 shortage claim that Recover now wins back; on Walmart PO 4471, Guard catches the same 480-vs-500 miscount before pickup, so the $360 claim never happens.

**A2. A Monday at Sunny Crunch, step by step (the golden path that the prototype also follows).**
1. **Open the dashboard:** $8,600 at risk across 15 deductions, $0 recovered so far, next deadline 3 days away (Amazon shortage).
2. **Guard alert:** Walmart PO 4471, 480 vs 500 cases. The analyst clicks Update ASN, and the $360 claim never happens.
3. **Recover queue, ranked by deadline × amount × win probability, not by arrival order:** Amazon Shortage $1,240 (3 days) · Walmart Late truck $360 (9 days) · Target Promo $2,150 (14 days) · Kroger Duplicate $780 (21 days) · Costco Fill rate $415 (30 days).
4. **Deduction detail (Amazon PO 4388):** a match table of PO 500 / ASN 480 / POD signed for 500 / Invoice 10482 for 500 cases at $31,000 (20 cases × $62 = $1,240, so the claim reconciles to the invoice). The verdict is that the POD supports the dispute.
5. **Evidence, already attached:** the POD signed 09:42, the carrier email with the POD for Amazon PO 4388, and Invoice 10482. Each item has a confidence score and a "view source" link.
6. **Dispute draft:** Amazon's format with 4 fields. Approve / Edit / Reject. If the amount is above the threshold, a second person must approve.
7. **Filed, approved by a human:** queue count 15 → 14 and $1,240 moves into "Filed, pending". When Amazon pays it back, "Recovered" goes $0 → $1,240 and syncs to the ERP and Ramp.
Time for one dispute: from hours of hunting to a ~30-second review.

**A3. Who does what (roles and controls).**
| Role | Does | Never does |
|---|---|---|
| Analyst | Triage, edit, approve below threshold | Approve their own above-threshold dispute |
| Finance lead | Approves above threshold, sets thresholds | Bypass the audit log |
| Shortstop | Classifies, ranks, assembles evidence, drafts, files after approval | File anything without a human |
Rules: approvals expire if stale; low-value, high-confidence items can be batch-approved; every action is logged (who approved what, when, under which policy version).

**A4. When things go wrong (judges test this).** Low-confidence evidence is shown, not hidden, and can't be batch-approved. Missing POD: Shortstop asks the carrier or the analyst and the item stays in the queue with "evidence incomplete". Rejected: a reason code feeds the next ranking. Retailer denies: logged as an outcome and fed into recovery-rate benchmarks.

**A5. First two weeks for a new customer.** Connect ERP + email + top portals (read-only) → free audit of 12 months of deductions → the audit result becomes the first queue and the sales proof.

---

## B. Product implementation (≈2 pages)

**B1. Architecture, three layers.** (We will include a diagram from the FigJam board.)
- **Sources:** retailer and distributor portals (Walmart Retail Link, Amazon Vendor Central, Target, UNFI, KeHE) through credential-vaulted, read-only connectors with RPA fallback where no API exists. ERP / accounting (QuickBooks Online, NetSuite, Xero, Sage Intacct) through **Apideck's unified accounting API**. Gmail / Outlook for carrier PODs and remittance advice. **Ramp Developer API** for money-out (transactions, bills, bank accounts).
- **Core:** (1) ingest and normalise into one *shipment + payment* record, deduplicated by PO + invoice + retailer. (2) 3/4-way match: PO vs ASN vs POD vs invoice vs promo calendar. (3) classifier: shortage / damage / pricing / promo / compliance. (4) ranking = deadline × amount × win probability, where win probability comes from evidence completeness. (5) evidence packager: POD OCR through **Mindee's Proof of Delivery API** plus field extraction with a confidence score and source location. (6) dispute drafter: retailer-format templates, structured proposal, idempotency key, hash of inputs.
- **Human gate (state machine):** Proposal → Pending review → Approved / Edited / Rejected → Executing → Completed / Failed. Maker-checker above threshold, expiry on stale approvals, kill switch, full audit log.
- **Outputs:** Guard alert, ranked queue, filed dispute, recovered-dollars ledger synced to the ERP + Ramp, CFO view (leakage by retailer / SKU, recovery rate, missed windows = 0).

**B2. Core data record (one table, the backbone).** Shipment-payment record: retailer · PO · ASN qty · POD qty + signature time · invoice no. + amount · remittance line · deduction type · amount · deadline · evidence items (each with source + confidence) · status · approver · policy version.

**B3. Build vs buy.** Buy: accounting connectors (Apideck), POD OCR (Mindee), money-out data (Ramp API). Build: the match engine, ranking, retailer dispute templates and the human gate, because that is where the advantage is. *Why Apideck:* one integration instead of five native ERP builds.

**B4. Security and trust.** Retailer credentials are vaulted, never stored in plain text; connectors are read-only. Nothing files without a person. Every field links to its source.

**B5. MVP boundary, said out loud.** *In the mockup:* 7 screens, one golden path, 5 retailers named and 2 shown in depth, human approval on every filing. *In the brief only (v2):* auto-filing below a threshold, 20+ portals, promo / TPM planning, multi-currency.

**B6. What the Figma prototype proves.** One click on Approve updates three things through Figma variables (status → Filed, queue 15 → 14, "Filed, pending" +$1,240), and a final "Payout received" step moves the $1,240 into Recovered. Judges see a working system, not a slideshow. Per-case prices are never shown on any screen.

---

## C. Roadmap for the future (≈1.5 pages)

| Phase | Product | Go-to-market | Move on when… |
|---|---|---|---|
| **0 — Wedge** (now – 3 mo) | Guard + Recover for Walmart, Amazon, UNFI, KeHE; human gate on everything | 10 design partners, $10M–$100M CPG. Entry offer: **free audit of 12 months of deductions** | [TODO: CONFIRM exit target, e.g. design partners live + recovery rate measured] |
| **1 — Repeatable** (3–12 mo) | Top-5 retailer dispute templates as product; QuickBooks / NetSuite through Apideck; batch approval for low-value, high-confidence items | Publish anonymised recovery-rate benchmarks by retailer | [TODO: CONFIRM] |
| **2 — Scale** (12–24 mo) | Retailer coverage 5 → 20+ through a connector framework, not one-off scrapers; promo validation; anomaly detection; CFO benchmarking | Distributor / 3PL partnerships, ERP marketplace listings. Pricing to test with partners: flat platform fee + % of recovered dollars (a proposal, not a launched price) | — |

- **Do not scale first:** 20 portals at once, auto-filing without approval, or custom enterprise work above $100M.
- **Ramp angle:** recovered dollars reconcile to the ERP and to Ramp, so a Ramp customer's cash picture shows money in as well as money out. [TODO: CONFIRM how far to push this. It is a story, not a partnership.]
- **Benefit (always the range):** for a $10M brand, $10M × 3–7% deducted × 40–60% disputable × 60–80% recovered = **$72k to $336k a year, $175k at the midpoint**.
- **Success metrics:** dollars recovered per brand · recovery rate on disputable deductions · missed dispute windows = 0 · time to file (~30-second approval) · Guard catches per month. North star: net recovered dollars per analyst-hour.
- **Risks, named honestly:** retailer portals have no public APIs (connectors are brittle) · OCR is not 100% (hence the human gate) · prevention is where the value is, so **Guard is the differentiator** · dispute windows vary by retailer and must be verified before a real deadline is shown.

---

## Non-goals (this submission)
No live ERP, portal or OCR integrations tonight. No pricing launched. No auto-filing.

## Open questions (carried into the brief as [TODO: CONFIRM] until answered)
OCR accuracy figure and the "$500 floor" claim need a source or get dropped; roadmap exit targets per phase.

## Appendix
FigJam board (Guard flow, Recover flow, analyst's Monday journey map, Job Stories) · toolkit and sources list, links copied exactly from the build guide.
