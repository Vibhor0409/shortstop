"use client";

import { ArrowRight, ArrowsClockwise, CheckCircle, Receipt } from "@phosphor-icons/react";
import { motion } from "motion/react";
import { AmazonTracker } from "@/components/Detail";
import { Page } from "@/components/Shell";
import { Button, Card, Divider, EASE, LinkButton, Pill, Stat, StatusPill } from "@/components/ui";
import { AMAZON_CASE, AMAZON_ID, GUARD, usd } from "@/lib/data";
import { selAtRisk, selFiledPending, selQueueCount, selRecovered, useStore } from "@/lib/store";

export default function Ledger() {
  const deductions = useStore((s) => s.deductions);
  const events = useStore((s) => s.events);
  const guard = useStore((s) => s.guard);
  const simulatePayout = useStore((s) => s.simulatePayout);
  const atRisk = useStore(selAtRisk);
  const filed = useStore(selFiledPending);
  const recovered = useStore(selRecovered);
  const count = useStore(selQueueCount);
  const ORDER = { recovered: 0, filed: 1, "needs-approval": 2, open: 3 } as const;
  const rows = [...deductions].sort((a, b) => ORDER[a.status] - ORDER[b.status] || a.rank - b.rank);
  const isFiled = (d: (typeof rows)[number]) => d.status === "filed" || d.status === "recovered";
  const amazon = deductions.find((d) => d.id === AMAZON_ID)!;
  const amazonFiled = amazon.status === "filed";
  const amazonDone = amazon.status === "recovered";
  const c = AMAZON_CASE;

  return (
    <Page crumb="Reports" title="Ledger and sync">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4 min-[1440px]:gap-4">
        <Stat label="At risk" value={atRisk} tone="risk" sub={`${count} open deductions`} />
        <Stat label="Filed, pending" value={filed} sub="With the retailer, not yet paid" />
        <Stat label="Recovered" value={recovered} tone="good" sub={recovered ? "Paid out and synced" : "Counts only after payout"} />
        <Stat label="Shortage avoided by Guard" value={guard === "fixed" ? GUARD.claim : 0} sub={guard === "fixed" ? `Walmart PO ${GUARD.po}` : "No shipments fixed yet"} />
      </div>

      <Card className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-xs text-t3">Dispute tracker</div>
            <div className="mt-0.5 text-lg font-medium">
              Amazon shortage · <span className="num">{usd(c.amount)}</span>
            </div>
            <div className="num text-xs text-t3">
              PO {c.po} · Invoice {c.invoice}
            </div>
          </div>
          <StatusPill status={amazon.status === "open" ? "open" : amazon.status} />
        </div>
        {amazon.status === "open" ? (
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-canvas px-4 py-3">
            <span className="text-sm text-t2">Not filed yet. The tracker starts when a person files the dispute.</span>
            <LinkButton href="/recover/amazon-4388" size="sm">
              Open the deduction
              <ArrowRight size={14} />
            </LinkButton>
          </div>
        ) : (
          <>
            <div className="mt-5">
              <AmazonTracker />
            </div>
            <Divider className="my-4" />
            {amazonFiled && (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm text-t2">
                  <span className="font-semibold text-t1">Demo only.</span> In real life Amazon decides. Here you can stand in for Amazon and pay the claim.
                </div>
                <Button variant="demo" onClick={simulatePayout} data-tour="simulate-payout">
                  Simulate payout (demo only)
                </Button>
              </div>
            )}
            {amazonDone && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE, delay: 0.5 }} className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex flex-wrap items-center gap-2">
                  <Pill tone="success">
                    <ArrowsClockwise size={14} />
                    NetSuite · synced {c.dates.paid}
                  </Pill>
                  <Pill tone="success">
                    <ArrowsClockwise size={14} />
                    Ramp · synced {c.dates.paid}
                  </Pill>
                  <span className="text-sm text-t2">Posted against invoice {c.invoice}</span>
                </div>
                <LinkButton href="/settings" data-tour="open-settings">
                  Next: the rules behind this
                  <ArrowRight size={16} />
                </LinkButton>
              </motion.div>
            )}
          </>
        )}
      </Card>

      <div className="grid items-start gap-5 min-[1440px]:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
        <Card className="overflow-hidden">
          <div className="p-5 pb-4">
            <div className="text-base font-medium">Recovery ledger</div>
            <div className="mt-0.5 text-xs text-t3">All 15 October deductions. Money shows as recovered only after the retailer pays.</div>
          </div>
          <Divider />
          {rows.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-6 py-12 text-center">
              <Receipt size={28} className="text-icon-subtle" />
              <div className="text-sm font-medium">No disputes filed yet</div>
              <p className="text-xs text-t3">Filed disputes appear here and stay until the cash is synced.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-[560px]">
                <div className="grid grid-cols-[1.4fr_0.8fr_1fr_0.7fr_0.7fr_1.2fr] gap-3 px-5 py-3 text-xs text-t3">
                  <span>Dispute</span>
                  <span className="text-right">Amount</span>
                  <span>Status</span>
                  <span>Filed</span>
                  <span>Paid or window</span>
                  <span>Sync</span>
                </div>
                {rows.map((d) => (
                  <div key={d.id}>
                    <Divider />
                    <div className="grid grid-cols-[1.4fr_0.8fr_1fr_0.7fr_0.7fr_1.2fr] items-center gap-3 px-5 py-3 text-sm">
                      <span>
                        <span className="font-semibold">{d.retailer}</span> <span className="text-t3">· {d.type}</span>
                      </span>
                      <span className="num text-right font-medium">{usd(d.amount)}</span>
                      <span>
                        <StatusPill status={d.status} />
                      </span>
                      <span className="num text-xs">{isFiled(d) ? c.dates.today : "Not filed"}</span>
                      <span className="num text-xs">{d.status === "recovered" ? c.dates.paid : isFiled(d) ? "Pending" : `${d.deadlineDays} days left`}</span>
                      <span className="text-xs text-t3">{d.status === "recovered" ? "NetSuite and Ramp" : isFiled(d) ? "After payout" : d.status === "needs-approval" ? "Waiting for approval" : `${d.evidence} of 3 documents`}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </Card>

        <Card className="p-5">
          <div className="text-base font-medium">Audit trail</div>
          <div className="mt-0.5 text-xs text-t3">Who did what. Shortstop drafts and cites, a person files.</div>
          {events.length === 0 ? (
            <p className="mt-4 text-sm text-t3">Nothing logged yet.</p>
          ) : (
            <ul className="mt-4 flex flex-col gap-3">
              {[...events].reverse().map((e) => (
                <motion.li key={e.id} layout="position" initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3, ease: EASE }} className="flex gap-3 text-sm">
                  <span className="num w-11 shrink-0 text-xs leading-5 text-t3">{e.date}</span>
                  <span className="min-w-0">
                    <span className="font-medium">{e.actor}</span>
                    <span className="block text-xs text-t2">{e.text}</span>
                  </span>
                  {e.kind === "sync" && <CheckCircle size={16} className="mt-0.5 ml-auto shrink-0 text-icon-success" />}
                </motion.li>
              ))}
            </ul>
          )}
        </Card>
      </div>
    </Page>
  );
}
