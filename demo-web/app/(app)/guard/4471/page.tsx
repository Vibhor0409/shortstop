"use client";

import { ArrowRight, ArrowsClockwise, CheckCircle, Lightning, ShieldCheck, Truck, Warning } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import { Paper, PaperRow } from "@/components/Docs";
import { Page } from "@/components/Shell";
import { Button, Card, DarkCard, Divider, EASE, LinkButton, Pill, cx } from "@/components/ui";
import { AMAZON_CASE, GUARD, usd } from "@/lib/data";
import { useStore } from "@/lib/store";

export default function GuardPage() {
  const guard = useStore((s) => s.guard);
  const updateAsn = useStore((s) => s.updateAsn);
  const toast = useStore((s) => s.toast);
  const fixed = guard === "fixed";
  const asn = fixed ? GUARD.poCases : GUARD.asnCases;

  const rows: [string, string, string, string, boolean][] = [
    ["Cases", String(GUARD.poCases), String(asn), String(GUARD.poCases), fixed],
    ["PO number", "4471", "4471", "4471", true],
    ["Ship to", "Walmart DC", "Walmart DC", "Walmart DC", true],
    ["Pickup", GUARD.pickup, GUARD.pickup, "Loaded", true],
  ];

  return (
    <Page crumb={`Guard / Walmart PO ${GUARD.po}`} title={fixed ? "Fixed before the truck left" : `Fix this before the ${GUARD.pickup} pickup`}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div key={guard} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3, ease: EASE }}>
          {fixed ? (
            <div className="flex items-start gap-3 rounded-2xl border border-line-success bg-success-subtle px-5 py-4 text-tsuccess">
              <CheckCircle size={20} className="mt-0.5 shrink-0" />
              <div>
                <div className="text-base font-medium">
                  <span className="num">{usd(GUARD.claim)}</span> shortage avoided
                </div>
                <p className="mt-1 text-sm">
                  The ASN was resubmitted to Walmart with {GUARD.poCases} cases. PO, ASN and pallet scan now agree, so there is no claim to fight later.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-start gap-3 rounded-2xl border border-line-warning bg-warning-subtle px-5 py-4 text-twarning">
              <Warning size={20} className="mt-0.5 shrink-0" />
              <div>
                <div className="text-base font-medium">
                  This shipment will be short-paid <span className="num">{usd(GUARD.claim)}</span> if it leaves as is
                </div>
                <p className="mt-1 text-sm">
                  The ASN says {GUARD.asnCases} cases. PO {GUARD.po} and the pallet scan both say {GUARD.poCases}. A {GUARD.gapCases} case gap between the ASN and the invoice is exactly the
                  pattern that turns into a shortage deduction weeks later.
                </p>
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="flex min-w-0 flex-col gap-5">
          <Card className="p-5">
            <div className="text-base font-medium">Three way check</div>
            <div className="mt-0.5 text-xs text-t3">Run when the ASN is created · carrier pickup at {GUARD.pickup}</div>
            <div className="mt-4 overflow-x-auto">
              <div className="min-w-[520px]">
                <div className="grid grid-cols-[1fr_1fr_1fr_1fr_1.4fr] gap-3 px-3 pb-3 text-xs text-t3">
                  <span>Field</span>
                  <span>PO {GUARD.po}</span>
                  <span>ASN draft</span>
                  <span>Pallet scan</span>
                  <span>Result</span>
                </div>
                {rows.map(([f, a, b, c, ok], i) => (
                  <div key={f}>
                    <Divider />
                    <motion.div
                      className={cx("my-2 grid grid-cols-[1fr_1fr_1fr_1fr_1.4fr] items-center gap-3 rounded-lg px-3 py-3 text-sm")}
                      animate={{ backgroundColor: i === 0 && !ok ? "var(--surface-error-subtle)" : "var(--surface-secondary)" }}
                      transition={{ duration: 0.5, ease: EASE }}
                    >
                      <span className="font-medium">{f}</span>
                      <span className="num">{a}</span>
                      <span className={cx("num", i === 0 && !ok && "text-terror", i === 0 && ok && "font-semibold")}>{b}</span>
                      <span className="num">{c}</span>
                      <span>
                        {ok ? (
                          <Pill tone="success">
                            <CheckCircle size={14} />
                            Match
                          </Pill>
                        ) : (
                          <span className="flex items-center gap-1.5 text-xs font-semibold text-terror">
                            <Warning size={14} />
                            Mismatch: {GUARD.gapCases} cases
                          </span>
                        )}
                      </span>
                    </motion.div>
                  </div>
                ))}
              </div>
            </div>
            <Divider className="mb-4" />
            {fixed ? (
              <div className="flex flex-wrap items-center gap-3">
                <LinkButton href="/recover" variant="primary" data-tour="open-queue">
                  Open the deduction queue
                  <ArrowRight size={16} />
                </LinkButton>
                <span className="text-sm text-t3">Next: the deductions that already happened.</span>
              </div>
            ) : (
              <div className="flex flex-wrap gap-3">
                <Button variant="primary" onClick={updateAsn} data-tour="update-asn">
                  Update ASN to {GUARD.poCases} cases
                </Button>
                <Button variant="tertiary" onClick={() => toast("Short shipment notices are outside this demo path")}>
                  It really is short, tell Walmart
                </Button>
              </div>
            )}
          </Card>

          <div className="grid gap-5 md:grid-cols-2">
            <DarkCard className="p-5">
              <div className="flex items-center gap-2 text-xs font-medium">
                <Lightning size={16} />
                Rule learned from Recover
              </div>
              <div className="mt-4 text-lg font-medium">ASN undercount at pack out</div>
              <p className="mt-2 text-sm text-inv2">
                The same {GUARD.asnCases} vs {GUARD.poCases} miscount went out on Amazon PO {AMAZON_CASE.po} and came back as a {usd(AMAZON_CASE.amount)} shortage claim. Guard now checks every
                ASN for it before pickup.
              </p>
            </DarkCard>
            <Card className="p-5">
              <div className="text-base font-medium">When you update the ASN</div>
              <ul className="mt-3 flex flex-col gap-3 text-sm text-t2">
                <li className="flex gap-3">
                  <ArrowsClockwise size={18} className="mt-0.5 shrink-0" />
                  ASN is resubmitted to Walmart with {GUARD.poCases} cases
                </li>
                <li className="flex gap-3">
                  <ShieldCheck size={18} className="mt-0.5 shrink-0" />
                  Guard reruns the three way check in seconds
                </li>
                <li className="flex gap-3">
                  <Truck size={18} className="mt-0.5 shrink-0" />
                  Truck leaves at {GUARD.pickup} with matching paperwork
                </li>
              </ul>
            </Card>
          </div>
        </div>

        <div className="rounded-2xl border border-line bg-canvas-hover p-4">
          <div className="mb-3 flex items-center justify-between text-xs font-medium text-t2">
            <span>ASN document</span>
            <Pill tone={fixed ? "success" : "warning"}>{fixed ? "Resubmitted" : "Draft"}</Pill>
          </div>
          <Paper title="Advance ship notice" sub={`Walmart PO ${GUARD.po}`} from="Sunny Crunch Snacks" to="Walmart DC">
            <PaperRow k="Purchase order" v={`PO ${GUARD.po}`} />
            <PaperRow k="Ordered" v={`${GUARD.poCases} cases`} />
            <PaperRow
              k="Shipping"
              v={
                <AnimatePresence mode="wait" initial={false}>
                  <motion.span
                    key={asn}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.3, ease: EASE }}
                    className={cx("inline-block rounded-sm border px-1.5", fixed ? "border-line-success bg-success-subtle text-tsuccess" : "border-line-error bg-error-subtle text-terror")}
                  >
                    {asn} cases
                  </motion.span>
                </AnimatePresence>
              }
            />
            <PaperRow k="PO number" v="4471" />
            <PaperRow k="Carrier pickup" v={GUARD.pickup} />
          </Paper>
        </div>
      </div>
    </Page>
  );
}
