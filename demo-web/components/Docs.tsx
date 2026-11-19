"use client";

import { EnvelopeSimple, FileText, GraduationCap, Paperclip } from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, type ReactNode } from "react";
import { AMAZON_CASE, BRAND, usd } from "@/lib/data";
import { Button, CoachMark, Divider, EASE, cx } from "./ui";

export type DocId = "pod" | "asn" | "invoice" | "email";
export type TeachStage = "idle" | "pick" | "popover" | "saved";

export const DOC_LABEL: Record<DocId, string> = { pod: "POD", asn: "ASN", invoice: "Invoice", email: "Email" };

/* A simple paper document drawn in HTML */
export function Paper({ title, sub, from, to, children }: { title: string; sub: string; from?: string; to?: string; children: ReactNode }) {
  return (
    <div className="rounded-sm border border-line bg-card p-5 shadow-paper">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-xs font-semibold text-t3">{title}</div>
          <div className="mt-1 text-base font-medium">{sub}</div>
        </div>
        <FileText size={20} className="text-icon-subtle" />
      </div>
      {(from || to) && (
        <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
          {from && (
            <div>
              <div className="text-t3">From</div>
              <div className="mt-0.5 font-medium">{from}</div>
            </div>
          )}
          {to && (
            <div>
              <div className="text-t3">To</div>
              <div className="mt-0.5 font-medium">{to}</div>
            </div>
          )}
        </div>
      )}
      <Divider className="my-4" />
      <div className="flex flex-col gap-2.5">{children}</div>
    </div>
  );
}

export function PaperRow({ k, v }: { k: string; v: ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 text-xs">
      <span className="text-t3">{k}</span>
      <span className="num text-right font-medium">{v}</span>
    </div>
  );
}

/* Animated highlight box around the exact spot a citation points to */
function Hl({ on, children, block }: { on: boolean; children: ReactNode; block?: boolean }) {
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    if (on) ref.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [on]);
  return (
    <span ref={ref} className={cx("relative", block ? "block" : "inline-block")}>
      <AnimatePresence>
        {on && (
          <motion.span
            aria-hidden
            className="absolute -inset-x-2 -inset-y-1 rounded-md border-2 border-line-accent bg-accent-subtle"
            initial={{ opacity: 0, scale: 1.12 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: EASE }}
          />
        )}
      </AnimatePresence>
      <span className={cx("relative", block && "block")}>{children}</span>
    </span>
  );
}

function Signature() {
  return (
    <svg viewBox="0 0 120 32" className="h-8 w-28" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden>
      <path d="M4 22c6-14 10-16 12-8s2 12 6 4 6-14 9-6 1 10 6 6 8-12 11-6-1 8 5 6 9-8 14-8 6 6 12 4 12-4 22-6" />
    </svg>
  );
}

export const TEACH_RULE = "Always treat a signed POD quantity as delivered quantity for Amazon shortages";

export function DocViewer({
  doc,
  onDoc,
  highlight,
  teach,
  onTeach,
  onSaveRule,
  ruleSaved,
}: {
  doc: DocId;
  onDoc: (d: DocId) => void;
  highlight: DocId | null;
  teach: TeachStage;
  onTeach: (s: TeachStage) => void;
  onSaveRule: () => void;
  ruleSaved: boolean;
}) {
  const c = AMAZON_CASE;
  const picking = teach === "pick";

  const sigInner = (
    <div className="flex items-end justify-between gap-3">
      <div>
        <div className="text-t3">Receiver signature</div>
        <Signature />
        <div className="num font-medium">
          Signed {c.podTime} · {c.podCases} cases
        </div>
      </div>
      <div className="text-right text-t3">
        Amazon receiving
        <br />
        <span className="num">{c.dates.delivered}, 2026</span>
      </div>
    </div>
  );

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex shrink-0" role="tablist">
        {(Object.keys(DOC_LABEL) as DocId[]).map((d) => (
          <button
            key={d}
            type="button"
            role="tab"
            aria-selected={doc === d}
            onClick={() => onDoc(d)}
            className={cx("relative flex-1 py-3 text-sm font-medium transition-colors", doc === d ? "text-t1" : "text-t3 hover:text-t1")}
          >
            {DOC_LABEL[d]}
            <span className="absolute inset-x-0 bottom-0 h-px bg-line" />
            {doc === d && <motion.span layoutId="doc-tab" className="absolute inset-x-0 bottom-0 h-0.5 bg-ink" transition={{ duration: 0.3, ease: EASE }} />}
          </button>
        ))}
      </div>

      <div className="flex shrink-0 items-center justify-between gap-2 px-4 pt-3">
        <span className="text-xs text-t3">
          {picking ? "Click the part of the POD Shortstop should learn from" : teach === "popover" ? "Confirm the rule below" : "Source documents, read only"}
        </span>
        {teach === "idle" && !ruleSaved && (
          <Button size="sm" variant="tertiary" onClick={() => onTeach("pick")} data-tour="teach">
            <GraduationCap size={14} />
            Teach Shortstop
          </Button>
        )}
        {(picking || teach === "popover") && (
          <Button size="sm" variant="ghost" onClick={() => onTeach("idle")}>
            Cancel
          </Button>
        )}
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4 lg:pb-80">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div key={doc} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.2, ease: EASE }}>
            {doc === "pod" && (
              <Paper title="Proof of delivery" sub={`PO ${c.po}`} from={BRAND} to="Amazon fulfillment center">
                <PaperRow k="Delivered" v={`${c.dates.delivered}, 2026 · ${c.podTime}`} />
                <PaperRow k="Cases shipped" v={c.podCases} />
                <PaperRow k="Cases received" v={c.podCases} />
                <PaperRow k="Exceptions" v="None noted" />
                <Divider className="my-1" />
                <div className="text-xs">
                  {picking ? (
                    <button
                      type="button"
                      onClick={() => onTeach("popover")}
                      data-tour="teach"
                      className="block w-full rounded-md border-2 border-dashed border-line-accent bg-accent-subtle p-2 text-left"
                    >
                      {sigInner}
                    </button>
                  ) : (
                    <div className="p-2">
                      <Hl on={highlight === "pod" || teach === "popover" || teach === "saved"} block>
                        {sigInner}
                      </Hl>
                    </div>
                  )}
                  <AnimatePresence>
                    {teach === "popover" && (
                      <motion.div
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3, ease: EASE }}
                        className="mt-3 rounded-xl border border-line-strong bg-card p-4 shadow-pop"
                        role="dialog"
                        aria-label="Teach Shortstop"
                      >
                        <div className="flex items-center gap-2 text-xs font-semibold">
                          <GraduationCap size={16} />
                          Teach Shortstop
                        </div>
                        <p className="mt-2 text-sm">{TEACH_RULE}</p>
                        <p className="mt-1 text-xs text-t3">Learned from the signature line you clicked.</p>
                        <div className="mt-3 flex gap-2">
                          <Button
                            size="sm"
                            data-tour="teach"
                            onClick={() => {
                              onSaveRule();
                              onTeach("saved");
                            }}
                          >
                            Save &amp; apply
                          </Button>
                          <Button size="sm" variant="tertiary" onClick={() => onTeach("idle")}>
                            Cancel
                          </Button>
                        </div>
                      </motion.div>
                    )}
                    {teach === "saved" && (
                      <CoachMark className="mt-3" onClose={() => onTeach("idle")}>
                        Rule saved. Applies to future Amazon shortages.
                      </CoachMark>
                    )}
                  </AnimatePresence>
                </div>
              </Paper>
            )}

            {doc === "asn" && (
              <Paper title="Advance ship notice" sub={`PO ${c.po}`} from={BRAND} to="Amazon fulfillment center">
                <PaperRow k="Shipped" v={`${c.dates.shipped}, 2026`} />
                <PaperRow k="Purchase order" v={`${c.poCases} cases`} />
                <PaperRow
                  k="Quantity on this notice"
                  v={
                    <Hl on={highlight === "asn"}>
                      <span className="text-terror">{c.asnCases} cases</span>
                    </Hl>
                  }
                />
                <Divider className="my-1" />
                <p className="text-xs text-t3">
                  The notice was keyed {c.shortCases} cases under the PO. The truck carried all {c.poCases}.
                </p>
              </Paper>
            )}

            {doc === "invoice" && (
              <Paper title="Invoice" sub={`Invoice ${c.invoice}`} from={BRAND} to="Amazon">
                <PaperRow k="Purchase order" v={`PO ${c.po}`} />
                <Divider className="my-1" />
                <div className="grid grid-cols-[1fr_auto_auto] gap-x-4 gap-y-2 text-xs">
                  <span className="text-t3">Description</span>
                  <span className="text-right text-t3">Quantity</span>
                  <span className="text-right text-t3">Amount</span>
                  <span className="col-span-3">
                    <Hl on={highlight === "invoice"} block>
                      <span className="grid grid-cols-[1fr_auto_auto] gap-x-4 font-medium">
                        <span>Sunny Crunch snack cases</span>
                        <span className="num text-right">{c.invoiceCases} cases</span>
                        <span className="num text-right">{usd(c.invoiceTotal)}</span>
                      </span>
                    </Hl>
                  </span>
                </div>
                <Divider className="my-1" />
                <div className="flex justify-between text-sm font-medium">
                  <span>Total</span>
                  <span className="num">{usd(c.invoiceTotal)}</span>
                </div>
              </Paper>
            )}

            {doc === "email" && (
              <div className="rounded-sm border border-line bg-card p-5 shadow-paper">
                <div className="flex items-center gap-2 text-xs font-semibold text-t3">
                  <EnvelopeSimple size={16} />
                  Carrier email
                </div>
                <div className="mt-3 flex flex-col gap-1 text-xs">
                  <div>
                    <span className="text-t3">From </span>
                    <span className="font-medium">Carrier dispatch</span>
                  </div>
                  <div>
                    <span className="text-t3">To </span>
                    <span className="font-medium">Accounts receivable, {BRAND}</span>
                  </div>
                  <div>
                    <span className="text-t3">Sent </span>
                    <span className="num font-medium">{c.dates.delivered}, 2026</span>
                  </div>
                </div>
                <Divider className="my-4" />
                <div className="text-sm font-medium">POD attached, PO {c.po}</div>
                <div className="mt-3 text-xs leading-5 text-t2">
                  <p>Hello,</p>
                  <p className="mt-2">
                    <Hl on={highlight === "email"}>
                      Delivery for PO {c.po} was completed at {c.podTime} today. All {c.podCases} cases were received and signed for.
                    </Hl>
                  </p>
                  <p className="mt-2">The signed proof of delivery is attached.</p>
                </div>
                <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-line bg-canvas px-3 py-1.5 text-xs font-medium">
                  <Paperclip size={14} />
                  Signed POD, PO {c.po}
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* Generic placeholder for the other 14 deductions: found and missing documents */
export function EvidenceSlots({ found }: { found: number }) {
  const names = ["Retailer remittance", "Invoice", "Supporting proof"];
  return (
    <div className="flex flex-col gap-3 p-4">
      {names.map((n, i) =>
        i < found ? (
          <div key={n} className="rounded-sm border border-line bg-card p-4 shadow-paper">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-t3">{n}</span>
              <span className="font-medium text-tsuccess">On file</span>
            </div>
            <div className="mt-3 flex flex-col gap-2" aria-hidden>
              <span className="h-2 w-3/4 rounded-full bg-subtle" />
              <span className="h-2 w-1/2 rounded-full bg-subtle" />
              <span className="h-2 w-2/3 rounded-full bg-subtle" />
            </div>
          </div>
        ) : (
          <div key={n} className="rounded-sm border border-dashed border-line-strong p-4">
            <div className="flex items-center justify-between text-xs">
              <span className="font-semibold text-t3">{n}</span>
              <span className="font-medium text-twarning">Missing</span>
            </div>
            <p className="mt-2 text-xs text-t3">Not found in any connected source yet.</p>
          </div>
        ),
      )}
    </div>
  );
}
