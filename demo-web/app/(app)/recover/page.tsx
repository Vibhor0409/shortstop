"use client";

import { AnimatePresence, motion } from "motion/react";
import { useEffect, useMemo, useState } from "react";
import { EmptyQueue, QueueRow, QueueSkeleton } from "@/components/QueueBits";
import { Page } from "@/components/Shell";
import { Button, Card, Checkbox, Divider, EASE, FlagRow, Modal, Money, cx } from "@/components/ui";
import { PORTALS, RETAILERS, THRESHOLD, sum, usd, type Deduction, type Retailer } from "@/lib/data";
import { inQueue, selAtRisk, selQueueCount, useStore } from "@/lib/store";

type Filter = "All" | Retailer | "Ready to file";
let seenQueue = false;

export default function Recover() {
  const hydrated = useStore((s) => s.hydrated);
  const deductions = useStore((s) => s.deductions);
  const requested = useStore((s) => s.requested);
  const requestEvidence = useStore((s) => s.requestEvidence);
  const fileDisputes = useStore((s) => s.fileDisputes);
  const atRisk = useStore(selAtRisk);
  const count = useStore(selQueueCount);

  const [loading, setLoading] = useState(!seenQueue);
  const [filter, setFilter] = useState<Filter>("All");
  const [sel, setSel] = useState<string[]>([]);
  const [modal, setModal] = useState(false);

  useEffect(() => {
    if (seenQueue) return;
    const t = setTimeout(() => {
      seenQueue = true;
      setLoading(false);
    }, 600);
    return () => clearTimeout(t);
  }, []);

  const queue = useMemo(() => deductions.filter(inQueue), [deductions]);
  const fileable = (d: Deduction) => d.evidence === 3 && d.status === "open";
  const shown = queue.filter((d) => (filter === "All" ? true : filter === "Ready to file" ? fileable(d) : d.retailer === filter));
  const selected = queue.filter((d) => sel.includes(d.id));
  const ready = selected.filter(fileable);
  const skipped = selected.filter((d) => !fileable(d));
  const readyTotal = sum(ready.map((d) => d.amount));
  const allShown = shown.length > 0 && shown.every((d) => sel.includes(d.id));

  const filters: Filter[] = ["All", ...RETAILERS, "Ready to file"];
  const countFor = (f: Filter) => queue.filter((d) => (f === "All" ? true : f === "Ready to file" ? fileable(d) : d.retailer === f)).length;

  return (
    <Page crumb="Deductions" title="Recover queue">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <p className="text-sm text-t2">
          <span className="num font-medium text-t1">{count}</span> open · <Money value={atRisk} className="font-medium text-t1" /> at risk · ranked by deadline, then amount and win probability
        </p>
      </div>

      <div className="flex flex-wrap gap-2" role="group" aria-label="Filter the queue">
        {filters.map((f) => (
          <button
            key={f}
            type="button"
            aria-pressed={filter === f}
            onClick={() => setFilter(f)}
            className={cx(
              "flex h-8 items-center gap-1.5 rounded-full border px-3 text-xs font-medium transition-colors duration-150",
              filter === f ? "border-line-ink bg-ink text-tinv" : "border-line bg-card text-t2 hover:bg-canvas-hover",
            )}
          >
            {f}
            <span className={cx("num", filter === f ? "text-inv2" : "text-t3")}>{hydrated ? countFor(f) : ""}</span>
          </button>
        ))}
      </div>

      <Card className="overflow-hidden">
        <div className="hidden grid-cols-[auto_24px_minmax(0,1.3fr)_80px_88px_132px_minmax(132px,auto)_16px] items-center gap-x-4 px-5 py-3 text-xs text-t3 md:grid">
          <Checkbox
            checked={allShown}
            onChange={(v) => setSel(v ? Array.from(new Set([...sel, ...shown.map((d) => d.id)])) : sel.filter((id) => !shown.some((d) => d.id === id)))}
            label="Select all shown"
          />
          <span>#</span>
          <span>Retailer and type</span>
          <span className="text-right">Amount</span>
          <span>Deadline</span>
          <span>Evidence</span>
          <span>Next step</span>
          <span />
        </div>
        <Divider className="hidden md:block" />
        {loading ? (
          <QueueSkeleton />
        ) : shown.length === 0 ? (
          <EmptyQueue filtered={queue.length > 0} />
        ) : (
          <AnimatePresence initial={false}>
            {shown.map((d, i) => (
              <motion.div
                key={d.id}
                layout="position"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.5, ease: EASE }}
                className="overflow-hidden"
              >
                {i > 0 && <Divider />}
                <QueueRow
                  d={d}
                  selected={sel.includes(d.id)}
                  onSelect={(v) => setSel((cur) => (v ? [...cur, d.id] : cur.filter((x) => x !== d.id)))}
                  requested={requested.includes(d.id)}
                  onGather={() => requestEvidence(d.id)}
                  tour={`row-${d.id}`}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </Card>

      {/* Bulk bar */}
      <AnimatePresence>
        {selected.length > 0 && !modal && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="fixed inset-x-0 bottom-4 z-40 flex justify-center px-4 min-[900px]:left-60"
          >
            <div className="flex max-w-full flex-wrap items-center gap-x-4 gap-y-2 rounded-xl bg-ink py-2.5 pr-2.5 pl-4 text-sm text-tinv shadow-pop">
              <span>
                <span className="num font-medium">{selected.length}</span> selected ·{" "}
                <span className="text-inv2">
                  <span className="num">{ready.length}</span> ready to file
                  {ready.length > 0 && (
                    <>
                      {" "}
                      · <span className="num">{usd(readyTotal)}</span>
                    </>
                  )}
                </span>
              </span>
              <span className="flex gap-2">
                <Button size="sm" variant="inverted" onClick={() => setSel([])}>
                  Clear
                </Button>
                <Button size="sm" variant="primary" disabled={ready.length === 0} onClick={() => setModal(true)}>
                  Review &amp; file
                </Button>
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Modal
        open={modal}
        onClose={() => setModal(false)}
        title="Review and file"
        footer={
          <>
            <Button variant="tertiary" onClick={() => setModal(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              disabled={ready.length === 0}
              onClick={() => {
                fileDisputes(ready.map((d) => d.id));
                setModal(false);
                setSel([]);
              }}
            >
              {ready.length === 1 ? `File dispute with ${ready[0].retailer} · ${usd(readyTotal)}` : `File ${ready.length} disputes · ${usd(readyTotal)}`}
            </Button>
          </>
        }
      >
        <p className="text-sm text-t2">Only deductions with all 3 documents can be filed. Each one goes to the retailer&apos;s own portal, under your name.</p>
        <div className="mt-4 flex flex-col gap-2">
          {ready.map((d) => (
            <div key={d.id} className="rounded-xl border border-line p-3">
              <div className="flex items-center justify-between gap-3 text-sm">
                <div className="min-w-0">
                  <span className="font-semibold">{d.retailer}</span> <span className="text-t3">· {d.type}</span>
                  <div className="truncate text-xs text-t3">Files to {PORTALS[d.retailer]}</div>
                </div>
                <span className="num font-medium">{usd(d.amount)}</span>
              </div>
              {d.flag && <FlagRow flag={d.flag} className="mt-2" />}
            </div>
          ))}
        </div>
        {skipped.length > 0 && (
          <div className="mt-4">
            <div className="text-xs font-semibold text-t3">Not filed in this batch</div>
            <ul className="mt-2 flex flex-col gap-1.5 text-sm text-t2">
              {skipped.map((d) => (
                <li key={d.id} className="flex items-center justify-between gap-3">
                  <span>
                    {d.retailer} · {d.type}
                  </span>
                  <span className="text-xs text-t3">{d.status === "needs-approval" ? "Waiting for approval" : `${d.evidence} of 3 documents`}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
        <Divider className="my-4" />
        <div className="flex items-center justify-between text-sm font-medium">
          <span>Total to file</span>
          <span className="num">{usd(readyTotal)}</span>
        </div>
        <p className="mt-2 text-xs text-t3">
          Every dispute in this batch is under the {usd(THRESHOLD)} threshold, so one approver is enough. You can undo right after filing.
        </p>
      </Modal>

      <p className="text-xs text-t3">
        Tip: tick the rows marked ready to file, then choose Review &amp; file. Or open a row to see the evidence.
      </p>
    </Page>
  );
}
