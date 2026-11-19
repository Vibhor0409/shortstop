# Shortstop — Working Product Demo Plan (v3: Figma + Vercel)

## The rules we're working to
- Judges grade **what they see in the Figma mockup**. How much detail and interactivity we add is up to us, and a Vercel link is accepted too.
- **No video.** The **brief** covers implementation, roadmap and future plans, and judges read it for context.
- **Deadline: tonight, Tue Nov 10, 11:59 PM PT.** Both links are live, so we stop editing once you submit.

**What this means for the build:**
1. A **working Ramp-style demo on Vercel.** It is a real web app: every button does what it would in the product, the numbers update across pages, and a guided tour explains each step.
2. A **Figma mockup that stands on its own.** Judges grade Figma, so it must make sense even if nobody opens the link. It carries the same screens, a clickable prototype, and a big **"Open live demo ↗"** button on the cover and on every screen.
3. **Figma is the design source and Vercel is the working copy of it.** One system, two ways to experience it.

---

## How Figma connects to Vercel (simple version)

```
Figma (design)  ──read by Figma MCP──▶  Code (Next.js)  ──deploy──▶  Vercel (live link)
      ▲                                                                  │
      └────────── "Open live demo ↗" link + live screens copied back ────┘
```

1. **Design in Figma.** New screens are built from our existing Figma variables (colours, spacing, radius), text styles and components.
2. **Code reads Figma directly.** Using the Figma connection, I pull:
   - the **variables**, which become the website's colour, spacing and type settings, so it's the exact same lime, greys, Geist fonts and 4px spacing;
   - the **layout and sizes of each screen**, which become the React components;
   - **screenshots** of each frame, to compare against the built page.
3. **Same pieces on both sides.** Every Figma component (button, status pill, queue row, stat card, sidebar, AI verdict card…) has one matching code component with the same name and the same variants. The icons are the same Phosphor set in both.
4. **Deploy to Vercel.** One command publishes the app (you're already signed in as vibhor-agrawal-4190), at a public link such as `shortstop-demo.vercel.app`.
5. **Link back from Figma.**
   - The Figma cover, the "Start here" page and each screen's top bar get an **"Open live demo ↗"** button. In Present mode it opens the Vercel app.
   - The Vercel start screen links back to the Figma file.
   - I also copy screenshots of the finished live screens into a **"Live build"** page in Figma, so judges who never leave Figma still see the working version, including states the Figma prototype can't animate.
6. **Check for mismatches.** I put each live page next to its Figma frame and fix any differences before submitting.

**Not used:** Figma Code Connect, which links components to code inside Dev Mode. It needs an Organization or Enterprise Figma plan, and judges wouldn't see it anyway.

---

## What I'm taking from Ramp's demos

| Ramp does | Shortstop demo does |
|---|---|
| Opens with one promise line, then "Let's take a look" | Start screen with the promise line, then **Start guided tour** / **Explore freely** |
| Narrates each step as what you see → what Ramp did → why it matters | A **guide card** with the same three-beat narration on every step, plus a **pulsing highlight** on the next button. Hideable. |
| Follows the lifecycle of the bill | Follows the lifecycle of a deduction: connect → import → prevent → triage → evidence → teach → dispute → approve → track → recovered → synced |
| Three-pane detail: queue list · record · source document | Same layout: queue list with Prev/Next · deduction record · **POD / ASN / invoice viewer** |
| AI card: verdict, one sentence, why-bullets with citation chips, "6 checks passed", 👍/👎 | Same structure. Clicking a citation chip **highlights the exact spot** on the proof of delivery. Confidence states its basis. |
| "Teach the agent" by highlighting part of the invoice | "Teach Shortstop" by highlighting the POD signature, then **Save & apply** |
| Problems flagged as a tinted sub-row under the item | Inline flag sub-rows in the queue (e.g. Kroger Duplicate $780) |
| Bulk actions in a focused modal | Select the ready-to-file rows, then **Review & file** in a modal with the page dimmed behind |
| Toasts with "Open"; a dark pop-up explaining an automatic change | Toasts with **Undo**; a dark pop-up such as "Under $1,500, so one approver" |
| Status tracker | Filed → Retailer review → Paid → Synced to ERP + Ramp |
| Calm canvas, one bright accent for the main action | Our system: Geist, off-white, lime primary only on the main action, red/amber only for risk |
| Seeded demo account | All data from `demo-data.md` (Sunny Crunch Snacks, October, $8,600 across 15 deductions). No new numbers. |

Also from floguo:
- Design every state a screen can be in.
- Buttons name the object, amount and destination ("File dispute with Amazon · $1,240").
- Show the agent's progress as milestones, not a spinner.
- Confidence numbers state their basis.
- Animate only to explain a change.
- Keep labels clear so judges always know where they are.

---

## Screens (same order in Figma and on Vercel)

| # | Chapter | Screen | Route | What happens |
|---|---|---|---|---|
| 0 | — | Start | `/` | Promise line; Guided tour / Explore freely; link to Figma |
| 1 | Connect | Connect sources (new) | `/connect` | Connect Amazon Vendor Central, Walmart Retail Link, Target Partners Online, Kroger, Costco, carrier/3PL, ERP, Ramp → import milestones → "October: 15 deductions · $8,600 short-paid" |
| 2 | Overview | Dashboard | `/dashboard` | Invoiced $100,000 / Received $91,400 / At risk / Filed pending / Recovered; leakage by retailer as bars; Guard alert |
| 3 | Guard | Walmart PO 4471 | `/guard/4471` | PO 500 vs ASN 480, ASN document pane; "Update ASN to 500 cases" → "$360 shortage avoided" |
| 4 | Recover | Queue | `/recover` | 15 ranked rows, inline flags, filters, bulk-select the rows with all 3 proofs → Review & file |
| 5–7 | Recover | Deduction detail (three panes) + AI verdict + Teach Shortstop | `/recover/amazon-4388` | Tabs, citation chips → highlight, 👍/👎, checks passed, teach popover |
| 8–10 | Dispute | Agent drafting → Dispute draft → Filed | same route, step state | Milestones; Amazon-format draft; "File dispute with Amazon · $1,240"; Undo toast; queue 15→14, At risk $7,360, Filed pending $1,240 |
| 11 | Approvals | Second approver | `/approvals/target-promo` | Target Promo $2,150 > $1,500 → second approver, recommendation summary |
| 12–13 | Ledger | Tracker + Ledger & sync | `/ledger` | Filed → Review → Paid (Dec 1) → Synced; Recovered $1,240; audit trail |
| 14 | Controls | Settings & rules | `/settings` | $1,500 threshold, auto-file rules, retailer windows with a "verify" flag; working toggles |
| 15 | — | End | `/done` | Before/after totals, Restart, Explore freely |

**States** (on the web for real, and in Figma as frames):
- Loading skeleton
- Empty queue ("All caught up")
- Portal disconnected → Reconnect
- Not enough evidence → "Gather evidence"

A hidden `/states` page shows every component in every state, for checking before submission.

**Demo controls on the web:**
- **Reset demo** returns everything to the start.
- **Simulate payout** stands in for Amazon paying. It's clearly labelled as a demo-only control.

---

## The Figma file (what judges grade)
1. **Start here:**
   - cover with "Open live demo ↗"
   - how to view (▶ Present, or pick a flow)
   - a storyboard of all screens in order, with arrows labelled *when/why* you move on and short notes
   - links to the brief
2. **Screens:**
   - every screen above at 1440×900, wired as a clickable prototype
   - **Full walkthrough** flow plus 4 chapter flows (Guard · Recover & dispute · Approvals · Ledger & sync), like Ramp's main video plus its short feature clips
   - guide cards that can be toggled with a variable
   - numbers carried across screens by the Prototype state variables
3. **Live build:** screenshots of the deployed Vercel app, including the animated and state screens.
4. **Components / Foundations:** the existing ones, plus the new components (flag sub-row, checkbox, bulk bar, tabs, document viewer + highlight, citation chip, AI verdict card, milestone list, toast, coach-mark, modal, tracker, toggle, skeleton, guide card).

## The web app (Vercel)
- **Code location:** `shortstop/demo-web/`
- **Stack:**
  - Next.js 15 (latest patched 15.5.x, since Vercel blocks vulnerable versions)
  - Tailwind v4 with tokens generated from the Figma variables
  - Motion for animation
  - `@fontsource` Geist + Geist Mono, bundled locally (the font fix from Shazia)
  - `@phosphor-icons/react`
- **One store** holds every deduction, the Guard alert, dispute statuses and the ledger, so an action on one page updates every page. Data is fixed in the code: no live fetches, nothing shifts.
- **Motion:**
  - the Figma curve (0.22, 1, 0.36, 1)
  - overlays about 300 ms
  - milestones in sequence
  - the status pill changes Draft → Filed → Recovered
  - nothing decorative
- **Works on:** 1440 and 1280 wide, plus a readable phone layout, because a judge might open the link on a phone.

## The brief (2 pages, context only)
- **Top line:** "Live demo: <Vercel link> · Mockup: <Figma link>"
- **Page 1, implementation:**
  - architecture (sources → matching → evidence + AI drafting → human approval → retailer portals → ERP/Ramp)
  - integrations
  - how the AI is kept in check (it drafts and cites; a human files)
  - how confidence is measured
  - permissions/security
  - build vs buy
  - the MVP boundary
- **Page 2, roadmap and future plans:**
  - phases
  - success metrics
  - the $72k–$336k benefit range
  - risks
  - what we'd test with design partners

---

## Order of work (tonight)
The Figma screens and the web app are built **at the same time**. I do the Figma work here; a helper agent builds the web app from the same spec and tokens, and I check its work. The Figma comes first if time gets short, because it's what gets graded.

| When | Work |
|---|---|
| Step 1 (20 min) | Pull Figma variables → `tokens.css`; lock the route map, state machine and all copy from `demo-data.md` |
| Step 2 (≈3 h, in parallel) | **Figma:** Start here, cover/end, three-pane detail, AI verdict card, document viewer, guide cards, new screens and states, re-wire the flows. **Web:** the app, store, components, all routes, guided tour. |
| Step 3 (30 min) | Deploy to Vercel; add "Open live demo ↗" across Figma; screenshot the live screens into the "Live build" page |
| Step 4 (30 min) | Compare web against Figma, click every button in both, check at 1440/1280/phone, fix mismatches |
| Step 5 (30 min) | Rewrite the brief with both links; re-render the PDF (still 2 pages) |
| By 11:30 PM | Stop editing; you submit |

## What I need from you
- **Nothing to sign into.** Figma (edit access), Vercel (signed in) and Drive are all connected.
- **Before 11:59 PM:**
  1. Upload the new brief PDF to Drive via Manage versions (same link).
  2. Set the Figma file to "Anyone with the link can view".
  3. Submit the form: project name, the Figma link (the Vercel link is inside it and in the brief), and the brief link.
