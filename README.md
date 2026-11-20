# Shortstop

Shortstop is a tool for consumer packaged goods brands that deals with retailer deductions: the amounts retailers such as Amazon, Walmart and Target take off an invoice for shortages, late trucks or promotions. It does two jobs:

- **Guard** catches the mistake that would cause a deduction before the shipment leaves.
- **Recover** disputes invalid deductions after they happen: a ranked queue, evidence matched to each case, an AI-drafted dispute, human approval, filing, and a ledger that tracks what is filed and what is paid.

Built by Team Divib for the BBS × Ramp Hackathon, product design track.

**Live demo:** https://shortstop-demo.vercel.app
**Figma mockup:** https://www.figma.com/design/VrTJIo13NQVUV6yARJc196

## What the demo does

The demo is a working web app, not a slideshow. Every button does what it would in the product, the numbers update across pages, and a guided tour explains each step. You can also leave the tour and explore freely.

The walkthrough follows one month of deductions for a fictional brand, Sunny Crunch Snacks: $8,600 across five retailers. All data is made up.

| Screen | What it shows |
|---|---|
| Connect | Linking retailer portals, the ERP and Ramp |
| Dashboard | Money at risk, filed and recovered |
| Guard | A purchase order flagged before it ships |
| Recover | The dispute queue, ranked by value and deadline |
| Case detail | Evidence, the AI verdict with citations, and the drafted dispute |
| Approvals | Human sign-off before anything is filed |
| Ledger | Filed, pending and paid amounts |

## What's in this repo

| Path | What it holds |
|---|---|
| `demo-web/` | The live demo app (Next.js) |
| `brief/` | The two-page product brief: implementation, then roadmap and future plans |
| `demo-plan.md` | The plan for the demo and how Figma and the code stay in sync |
| `demo-data.md` | The demo numbers and how they add up |
| `live-build/` | Screenshots of the finished live screens |
| `audit/` | Screenshots from the final check of each flow |

## Stack

- Next.js 15 (App Router) and React 19
- Tailwind CSS v4, with colour, spacing and type tokens generated from the Figma variables (`demo-web/app/tokens.css`)
- Zustand for the demo state, Motion for animation, Phosphor icons
- Deployed on Vercel

## Run it locally

```bash
cd demo-web
npm install
npm run dev
```

Then open http://localhost:3000.
