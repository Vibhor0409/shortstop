"use client";

import { ArrowRight, CheckCircle, Lightning, ShieldCheck, Warning } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { MiniRow } from "@/components/QueueBits";
import { Page } from "@/components/Shell";
import { Card, DarkCard, Divider, EASE, LinkButton, Pill, Stat, btn } from "@/components/ui";
import { AMAZON_CASE, GUARD, INVOICED, RECEIVED, RETAILERS, usd } from "@/lib/data";
import { byRetailer, inQueue, selAtRisk, selFiledPending, selQueueCount, selRecovered, selShortPaid, useStore } from "@/lib/store";

export default function Dashboard() {
  const deductions = useStore((s) => s.deductions);
  const guard = useStore((s) => s.guard);
  const atRisk = useStore(selAtRisk);
  const filed = useStore(selFiledPending);
  const recovered = useStore(selRecovered);
  const count = useStore(selQueueCount);
  const short = useStore(selShortPaid);
  const rows = byRetailer(deductions, RETAILERS);
  const max = Math.max(...rows.map((r) => r.total));
  const queue = deductions.filter(inQueue);
  const filedCount = deductions.filter((d) => d.status === "filed").length;
  const recCount = deductions.filter((d) => d.status === "recovered").length;

  return (
    <Page crumb="Dashboard" title="Good morning, Priya">
      <Card className="flex items-start gap-3 px-5 py-4 text-sm">
        <Lightning size={18} className="mt-0.5 shrink-0" />
        <p>
          {usd(short)} of October&apos;s {usd(INVOICED)} never arrived. Shortstop has ranked all {deductions.length} deductions, and Guard{" "}
          {guard === "open" ? "caught one shipment about to repeat the mistake." : `stopped one shipment from repeating the mistake.`}
        </p>
      </Card>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5 min-[1440px]:gap-4">
        <Stat label="Invoiced in October" value={INVOICED} sub="5 retailers" />
        <Stat label="Received" value={RECEIVED} sub="Cash that actually arrived" />
        <Stat label="At risk" value={atRisk} tone="risk" sub={`${count} open deductions`} />
        <Stat label="Filed, pending" value={filed} sub={filedCount ? `${filedCount} with the retailer` : "Nothing filed yet"} />
        <Stat label="Recovered" value={recovered} tone="good" sub={recCount ? "Paid out and synced" : "Counts only after payout"} />
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <DarkCard className="flex flex-col p-6" data-tour="guard-card">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-medium">
              <ShieldCheck size={16} />
              Guard · before shipment
            </div>
            <AnimatePresence mode="wait" initial={false}>
              <motion.span key={guard} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.3, ease: EASE }}>
                {guard === "open" ? (
                  <Pill tone="warning">
                    <Warning size={14} />
                    Pickup at {GUARD.pickup}
                  </Pill>
                ) : (
                  <Pill tone="success">
                    <CheckCircle size={14} />
                    Resolved
                  </Pill>
                )}
              </motion.span>
            </AnimatePresence>
          </div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.div key={guard} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3, ease: EASE }} className="mt-8 flex flex-1 flex-col">
              {guard === "open" ? (
                <>
                  <div className="max-w-[26ch] text-xl">
                    Walmart PO {GUARD.po} is about to ship {GUARD.gapCases} cases short on paper
                  </div>
                  <div className="mt-3 flex flex-wrap gap-x-8 gap-y-2">
                    {[
                      [GUARD.asnCases, "ASN cases"],
                      [GUARD.poCases, "PO cases"],
                      [usd(GUARD.claim), "shortage claim if it ships as is"],
                    ].map(([v, l]) => (
                      <div key={l}>
                        <div className="text-3xl font-medium tabular-nums">{v}</div>
                        <div className="text-xs text-inv2">{l}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-5 flex flex-wrap items-center gap-4">
                    <Link href="/guard/4471" className={btn("primary")}>
                      Review and update ASN
                      <ArrowRight size={16} />
                    </Link>
                    <span className="text-xs text-inv2">
                      Same miscount cost {usd(AMAZON_CASE.amount)} on Amazon PO {AMAZON_CASE.po}
                    </span>
                  </div>
                </>
              ) : (
                <>
                  <div className="text-3xl font-medium">
                    <span className="tabular-nums">{usd(GUARD.claim)}</span> shortage avoided
                  </div>
                  <p className="mt-2 max-w-[44ch] text-sm text-inv2">
                    The ASN for Walmart PO {GUARD.po} now says {GUARD.poCases} cases, matching the PO. The truck leaves at {GUARD.pickup} with clean paperwork.
                  </p>
                  <div className="mt-5">
                    <Link href="/guard/4471" className={btn("inverted")}>
                      View the check
                    </Link>
                  </div>
                </>
              )}
            </motion.div>
          </AnimatePresence>
        </DarkCard>

        <Card className="p-6">
          <div className="text-base font-medium">Where the {usd(short)} went</div>
          <div className="mt-0.5 text-xs text-t3">Short-paid by retailer, October</div>
          <div className="mt-4 flex flex-col gap-3.5">
            {rows.map((r, i) => (
              <div key={r.retailer} className="flex items-center gap-3 text-sm">
                <span className="w-16 shrink-0 font-medium">{r.retailer}</span>
                <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-subtle">
                  <motion.span
                    className="block h-full rounded-full bg-ink"
                    initial={{ width: 0 }}
                    animate={{ width: `${(r.total / max) * 100}%` }}
                    transition={{ duration: 0.5, ease: EASE, delay: i * 0.05 }}
                  />
                </span>
                <span className="num w-14 text-right font-medium">{usd(r.total)}</span>
                <span className="w-12 text-right text-xs text-t3">{r.lines} lines</span>
              </div>
            ))}
          </div>
          <Divider className="my-4" />
          <div className="flex items-center justify-between text-sm font-medium">
            <span>Total</span>
            <span className="num">
              {usd(short)} · {deductions.length} lines
            </span>
          </div>
        </Card>
      </div>

      <div className="rounded-2xl border border-line bg-canvas-hover p-4 sm:p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-base font-medium">Recover · next up</div>
            <div className="mt-0.5 text-xs text-t3">Ranked by deadline, then amount and win probability. Nothing files without a human.</div>
          </div>
          <LinkButton href="/recover">Open all {count}</LinkButton>
        </div>
        <div className="mt-4 flex flex-col gap-2">
          {queue.slice(0, 3).map((d, i) => (
            <MiniRow key={d.id} d={d} n={i + 1} />
          ))}
        </div>
      </div>
    </Page>
  );
}
