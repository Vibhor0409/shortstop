# Shortstop demo data (single source of truth for Figma + brief)

Brand: Sunny Crunch Snacks · Period: October · Invoiced $100,000 across 5 retailers · Received $91,400 · Short-paid $8,600 across 15 deductions

## Deduction queue (ranked by deadline, then amount × win probability)
| # | Retailer | Type | Amount | Deadline | Evidence |
|---|---|---|---|---|---|
| 1 | Amazon | Shortage | $1,240 | 3 days | 3/3 |
| 2 | Amazon | Freight | $640 | 6 days | 2/3 |
| 3 | Walmart | Late truck | $360 | 9 days | 2/3 |
| 4 | Walmart | Compliance | $290 | 11 days | 1/3 |
| 5 | Target | Promo | $2,150 | 14 days | 2/3 |
| 6 | Costco | Pricing | $310 | 16 days | 2/3 |
| 7 | Kroger | Returns | $520 | 18 days | 1/3 |
| 8 | Kroger | Duplicate | $780 | 21 days | 3/3 |
| 9 | Walmart | Routing | $375 | 23 days | 2/3 |
| 10 | Amazon | Coupon | $265 | 25 days | 1/3 |
| 11 | Kroger | Allowance | $455 | 27 days | 2/3 |
| 12 | Costco | Fill rate | $415 | 30 days | 1/3 |
| 13 | Target | Markdown | $185 | 33 days | 1/3 |
| 14 | Walmart | Short ship | $385 | 35 days | 2/3 |
| 15 | Costco | Damage | $230 | 40 days | 1/3 |
Total $8,600 · 15 lines.

By retailer: Target $2,335 (2) · Amazon $2,145 (3) · Kroger $1,755 (3) · Walmart $1,410 (4) · Costco $955 (3) = $8,600.

## Guard (before shipment)
Walmart PO 4471 · PO 500 cases · ASN 480 cases · −20 cases · $360 shortage claim if shipped as-is · pickup 2:00 PM · action: Update ASN.

## Recover golden path
Amazon PO 4388 · Shortage · $1,240 · short 20 cases · deadline 3 days.
Match: PO 500 · ASN 480 (mismatch: the miscount that caused the claim) · POD signed 09:42 for 500 · Invoice 10482: 500 cases, $31,000.
Evidence: POD signed 09:42 (98% confidence) · Carrier email, POD attached, PO 4388 · Invoice 10482.
Dispute draft (Amazon format, 4 fields): Retailer Amazon · Type Shortage · PO 4388 / Invoice 10482 · Claim $1,240 · Grounds: POD shows 500 cases delivered and signed 09:42; invoice matches PO.
Approval: under $1,500 threshold → one approver (analyst). Maker-checker above threshold.

## State changes
Approve & file → status Filed · queue 15 → 14 · At risk $8,600 → $7,360 · Filed, pending $0 → $1,240.
Payout received → Filed, pending $1,240 → $0 · Recovered $0 → $1,240 · synced to ERP + Ramp.

Benefit: $10M brand × 3–7% × 40–60% × 60–80% = $72k–$336k/yr, $175k midpoint.
