"use client";

import {
  ArrowLeft,
  ArrowRight,
  CaretDown,
  Check,
  CheckCircle,
  EnvelopeSimple,
  FileText,
  MagnifyingGlass,
  PencilSimple,
  Prohibit,
  Sparkle,
  ThumbsDown,
  ThumbsUp,
  Warning,
} from "@phosphor-icons/react";
import { AnimatePresence, motion } from "motion/react";
import Link from "next/link";
import { useRef, useState, type ReactNode } from "react";
import { DOC_LABEL, DocViewer, Paper, PaperRow, type DocId, type TeachStage } from "./Docs";
import { caseFor } from "@/lib/cases";
import { Button, Card, CoachMark, DarkCard, Divider, EASE, Evidence, FlagRow, LinkButton, Milestones, Pill, StatusPill, Tabs, Tracker, cx, useMilestones } from "./ui";
import { AMAZON_CASE, AMAZON_ID, APPROVER, BRAND, PORTALS, TARGET_ID, THRESHOLD, USER, days, usd, type Deduction } from "@/lib/data";
import { inQueue, useStore } from "@/lib/store";

const DRAFT_STEPS = ["Matched PO to invoice", "Pulled signed POD", "Checked Amazon's dispute format", "Drafted 4 fields", "Ready for your review"];

/* Three panes: queue rail, record, source document */
function Panes({ d, centre, doc, bar }: { d: Deduction; centre: ReactNode; doc: ReactNode; bar: ReactNode }) {
  const deductions = useStore((s) => s.deductions);
  const list = deductions.filter((x) => inQueue(x) || x.id === d.id);
  const i = list.findIndex((x) => x.id === d.id);
  const prev = list[i - 1];
  const next = list[i + 1];

  return (
    <div className="lg:grid lg:h-[calc(100dvh-var(--sp-500))] lg:grid-cols-[minmax(0,1fr)_1px_340px] xl:grid-cols-[200px_1px_minmax(0,1fr)_1px_340px] min-[1440px]:grid-cols-[220px_1px_minmax(0,1fr)_1px_400px]">
      {/* Queue rail */}
      <aside className="hidden min-h-0 flex-col xl:flex">
        <Link href="/recover" className="flex shrink-0 items-center gap-2 px-4 py-4 text-sm font-medium hover:underline">
          <ArrowLeft size={16} />
          Deductions
        </Link>
        <Divider />
        <div className="min-h-0 flex-1 overflow-y-auto p-2">
          {list.map((x) => (
            <Link
              key={x.id}
              href={`/recover/${x.id}`}
              aria-current={x.id === d.id ? "page" : undefined}
              className={cx("block rounded-lg px-3 py-2.5 transition-colors duration-150", x.id === d.id ? "bg-canvas-selected" : "hover:bg-canvas-hover")}
            >
              <div className="text-sm font-medium">{x.retailer}</div>
              <div className="truncate text-xs text-t3 tabular-nums">
                {x.type} · {usd(x.amount)} · {days(x.deadlineDays)}
              </div>
            </Link>
          ))}
        </div>
        <Divider />
        <div className="flex shrink-0 justify-between px-4 py-3 text-sm font-medium">
          {prev ? (
            <Link href={`/recover/${prev.id}`} className="underline underline-offset-4">
              Prev
            </Link>
          ) : (
            <span className="text-tdis">Prev</span>
          )}
          {next ? (
            <Link href={`/recover/${next.id}`} className="underline underline-offset-4">
              Next
            </Link>
          ) : (
            <span className="text-tdis">Next</span>
          )}
        </div>
      </aside>
      <div className="hidden bg-line xl:block" />

      {/* Record */}
      <section className="flex min-h-0 min-w-0 flex-col bg-card">
        <div className="min-h-0 flex-1 lg:overflow-y-auto">{centre}</div>
        <div className="sticky bottom-0 z-20 shrink-0 bg-card">
          <Divider />
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-8">{bar}</div>
        </div>
      </section>
      <div className="hidden bg-line lg:block" />

      {/* Source document */}
      <aside className="min-h-0 bg-canvas pb-40 lg:pb-0">
        <Divider className="lg:hidden" />
        {doc}
      </aside>
    </div>
  );
}

function Header({ d, title, sub, status, children }: { d: Deduction; title: string; sub: string; status: ReactNode; children?: ReactNode }) {
  return (
    <div className="px-4 pt-6 sm:px-8">
      <Link href="/recover" className="mb-3 flex items-center gap-2 text-xs font-medium text-t3 xl:hidden">
        <ArrowLeft size={14} />
        Deductions
      </Link>
      <h1 className="text-2xl min-[1440px]:text-3xl">{title}</h1>
      <div className="mt-1 text-sm text-t3">{sub}</div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        {status}
        {d.flag && inQueue(d) && (
          <Pill tone={d.flag.tone === "error" ? "error" : "warning"}>
            <Warning size={14} />
            {d.flag.text}
          </Pill>
        )}
      </div>
      {children}
    </div>
  );
}

function Chip({ doc, active, onClick, tour }: { doc: DocId; active: boolean; onClick: () => void; tour?: string }) {
  const Icon = doc === "email" ? EnvelopeSimple : FileText;
  return (
    <button
      type="button"
      onClick={onClick}
      data-tour={tour}
      aria-label={`Show in ${DOC_LABEL[doc]}`}
      className={cx(
        "ml-1.5 inline-flex h-5 items-center gap-1 rounded-sm border px-1.5 align-middle text-xs font-medium transition-colors duration-150",
        active ? "border-lime bg-lime text-t1" : "border-inv-line bg-inv-raised text-tinv hover:border-lime",
      )}
    >
      <Icon size={12} />
      {DOC_LABEL[doc]}
    </button>
  );
}

const TRACK = (recovered: boolean) => [
  { label: "Filed", note: AMAZON_CASE.dates.today },
  { label: "Retailer review", note: recovered ? "Approved" : "In progress" },
  { label: "Paid", note: recovered ? AMAZON_CASE.dates.paid : "" },
  { label: "Synced to ERP + Ramp", note: recovered ? AMAZON_CASE.dates.paid : "" },
];

export function AmazonTracker() {
  const d = useStore((s) => s.deductions.find((x) => x.id === AMAZON_ID));
  const recovered = d?.status === "recovered";
  const stage = recovered ? 4 : d?.status === "filed" ? 1 : 0;
  return <Tracker steps={TRACK(!!recovered)} stage={stage} />;
}

export function AmazonTimeline() {
  const status = useStore((s) => s.deductions.find((x) => x.id === AMAZON_ID)?.status);
  const c = AMAZON_CASE;
  const filed = status === "filed" || status === "recovered";
  const items: [string, string, "done" | "now" | "risk" | "todo"][] = [
    [c.dates.shipped, `Shipped. The ASN says ${c.asnCases} cases`, "done"],
    [`${c.dates.delivered} · ${c.podTime}`, `Delivered. POD signed for ${c.podCases} cases`, "done"],
    [c.dates.shortPaid, `Amazon pays ${usd(c.amount)} short`, "done"],
    [c.dates.today, filed ? `Dispute filed with Amazon by ${USER.name}` : "Today. 3 days left to dispute", filed ? "done" : "now"],
    [c.dates.windowCloses, filed ? "Dispute window closes. Filed in time" : "Dispute window closes", filed ? "todo" : "risk"],
  ];
  if (status === "recovered") items.push([c.dates.paid, `Amazon paid ${usd(c.amount)}. Synced to NetSuite and Ramp`, "done"]);
  return (
    <ol className="flex flex-col">
      {items.map(([date, text, tone], i) => (
        <motion.li key={date + text} layout="position" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3, ease: EASE }} className="flex gap-3">
          <div className="flex flex-col items-center">
            <span
              className={cx(
                "mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full",
                tone === "done" && "bg-ink",
                tone === "now" && "bg-lime outline outline-1 outline-line-accent",
                tone === "risk" && "bg-danger",
                tone === "todo" && "border border-line-strong bg-card",
              )}
            />
            {i < items.length - 1 && <span className="w-px flex-1 bg-line" />}
          </div>
          <div className="pb-4">
            <div className="num text-xs text-t3">{date}</div>
            <div className={cx("text-sm", tone === "risk" && "font-medium text-terror")}>{text}</div>
          </div>
        </motion.li>
      ))}
    </ol>
  );
}

export function VerdictCard({
  highlight,
  onCite,
  tourChip,
}: {
  highlight: DocId | null;
  onCite: (d: DocId) => void;
  tourChip?: boolean;
}) {
  const c = AMAZON_CASE;
  const [checks, setChecks] = useState(false);
  const [vote, setVote] = useState<"up" | "down" | null>(null);
  const toast = useStore((s) => s.toast);
  const bullets: [string, DocId][] = [
    [`The POD was signed at ${c.podTime} on ${c.dates.delivered} for all ${c.podCases} cases, with no exceptions noted.`, "pod"],
    [`The ASN said ${c.asnCases} cases. That is a paperwork miscount at pack out, not a short delivery.`, "asn"],
    [`Invoice ${c.invoice} bills ${c.invoiceCases} cases for ${usd(c.invoiceTotal)}, matching PO ${c.po}.`, "invoice"],
    [`The carrier emailed the signed POD the same day, referencing PO ${c.po}.`, "email"],
  ];
  const passed = [
    `Invoice ${c.invoice} matches PO ${c.po} at ${c.poCases} cases`,
    `POD is signed, ${c.podTime} on ${c.dates.delivered}`,
    "POD quantity matches the invoiced quantity",
    "No exceptions noted on the POD",
    "Inside Amazon's dispute window, 3 days left",
  ];
  return (
    <DarkCard className="p-5" data-tour="verdict">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2">
          <Sparkle size={18} className="text-lime" />
          <span className="text-lg font-medium">Dispute recommended</span>
        </div>
        <div className="flex gap-1">
          {(["up", "down"] as const).map((v) => {
            const Icon = v === "up" ? ThumbsUp : ThumbsDown;
            return (
              <button
                key={v}
                type="button"
                aria-label={v === "up" ? "Good recommendation" : "Bad recommendation"}
                aria-pressed={vote === v}
                onClick={() => {
                  setVote(vote === v ? null : v);
                  if (vote !== v) toast(v === "up" ? "Thanks. Shortstop will keep reading cases this way" : "Thanks. Shortstop flagged this read for review");
                }}
                className={cx("rounded-lg p-1.5 transition-colors duration-150", vote === v ? "bg-lime text-t1" : "text-inv2 hover:bg-inv-raised hover:text-tinv")}
              >
                <Icon size={18} />
              </button>
            );
          })}
        </div>
      </div>
      <p className="mt-3 text-sm text-tinv">
        Amazon deducted {usd(c.amount)} for {c.shortCases} cases it says never arrived. The signed proof of delivery shows all {c.podCases} cases received.
      </p>
      <ul className="mt-3 flex flex-col gap-2.5">
        {bullets.map(([text, doc], i) => (
          <li key={doc} className="flex gap-2 text-sm text-inv2">
            <span className="mt-2 h-1 w-1 shrink-0 rounded-full bg-inv3" />
            <span>
              {text}
              <Chip doc={doc} active={highlight === doc} onClick={() => onCite(doc)} tour={tourChip && i === 0 ? "citation-pod" : undefined} />
            </span>
          </li>
        ))}
      </ul>
      <div className="my-4 h-px bg-inv-line" />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button type="button" onClick={() => setChecks((v) => !v)} aria-expanded={checks} className="flex items-center gap-1.5 text-sm font-medium underline underline-offset-4">
          <span className="num">{passed.length}</span> checks passed
          <CaretDown size={14} className={cx("transition-transform duration-300", checks && "rotate-180")} />
        </button>
        <span className="text-xs text-inv2">
          <span className="num font-medium text-tinv">{c.podConfidence}%</span> match on the POD signature · all 3 documents found
        </span>
      </div>
      <AnimatePresence initial={false}>
        {checks && (
          <motion.ul
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="overflow-hidden"
          >
            {passed.map((p) => (
              <li key={p} className="flex items-center gap-2 pt-2.5 text-sm text-inv2">
                <CheckCircle size={16} className="shrink-0 text-lime" />
                {p}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </DarkCard>
  );
}

function Field({ n, label, value }: { n: number; label: string; value: string }) {
  return (
    <div className="min-w-0">
      <div className="text-xs text-t3">
        <span className="num">{n}</span> · {label}
      </div>
      <div className="num mt-1.5 truncate rounded-lg border border-line bg-canvas px-3 py-2.5 text-sm">{value}</div>
    </div>
  );
}

export function DraftCard({ groundsRef, readOnly }: { groundsRef?: React.RefObject<HTMLTextAreaElement | null>; readOnly?: boolean }) {
  const grounds = useStore((s) => s.grounds);
  const setGrounds = useStore((s) => s.setGrounds);
  const c = AMAZON_CASE;
  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="text-base font-medium">{c.portal} · shortage dispute</div>
        {!readOnly && <StatusPill status="draft" />}
      </div>
      <div className="mt-0.5 text-xs text-t3">Shortstop filled the 4 fields Amazon asks for. Edit anything before you file.</div>
      <div className="mt-4 grid grid-cols-2 gap-3">
        <Field n={1} label="Retailer" value="Amazon" />
        <Field n={2} label="Claim type" value="Shortage" />
        <Field n={3} label="References" value={`PO ${c.po} · Invoice ${c.invoice}`} />
        <Field n={4} label="Amount disputed" value={usd(c.amount)} />
      </div>
      <label className="mt-4 block text-xs text-t3" htmlFor="grounds">
        Grounds
      </label>
      <textarea
        id="grounds"
        ref={groundsRef}
        readOnly={readOnly}
        value={grounds}
        onChange={(e) => setGrounds(e.target.value)}
        rows={5}
        className="mt-1.5 block w-full resize-none rounded-lg border border-line bg-canvas px-3 py-2.5 text-sm leading-5 focus:border-line-ink focus:outline-none"
      />
      <div className="mt-4 text-xs text-t3">Attached (3)</div>
      <div className="mt-2 flex flex-wrap gap-2">
        <Pill>
          <FileText size={14} />
          Proof of delivery · {c.podConfidence}%
        </Pill>
        <Pill>
          <EnvelopeSimple size={14} />
          Carrier email
        </Pill>
        <Pill>
          <FileText size={14} />
          Invoice {c.invoice}
        </Pill>
      </div>
    </Card>
  );
}

export function MatchTable() {
  const c = AMAZON_CASE;
  const rows: [string, string, string, boolean][] = [
    [`PO ${c.po}`, `${c.poCases} cases`, "", false],
    ["ASN", `${c.asnCases} cases`, "The miscount", true],
    ["POD", `${c.podCases} cases`, `Signed ${c.podTime}`, false],
    [`Invoice ${c.invoice}`, `${c.invoiceCases} cases`, usd(c.invoiceTotal), false],
    ["Amazon remittance", `${c.shortCases} cases`, `${usd(c.amount)} disputed`, false],
  ];
  return (
    <div>
      {rows.map(([doc, qty, note, bad], i) => (
        <div key={doc}>
          {i > 0 && <Divider />}
          <div className={cx("my-1 flex items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-sm", bad && "bg-error-subtle")}>
            <span className="font-medium">{doc}</span>
            <span className="flex items-center gap-3">
              {note && <span className={cx("text-xs", bad ? "font-semibold text-terror" : "num text-t3")}>{note}</span>}
              <span className={cx("num w-20 text-right", bad && "text-terror")}>{qty}</span>
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 className="text-base font-medium">{children}</h2>;
}

/* The centrepiece: Amazon PO 4388 */
export function AmazonDetail({ d }: { d: Deduction }) {
  const c = AMAZON_CASE;
  const draft = useStore((s) => s.draft);
  const events = useStore((s) => s.events);
  const podRuleSaved = useStore((s) => s.podRuleSaved);
  const startDraft = useStore((s) => s.startDraft);
  const finishDraft = useStore((s) => s.finishDraft);
  const fileDisputes = useStore((s) => s.fileDisputes);
  const simulatePayout = useStore((s) => s.simulatePayout);
  const saveRule = useStore((s) => s.saveRule);
  const tourEvent = useStore((s) => s.tourEvent);
  const toast = useStore((s) => s.toast);

  const [tab, setTab] = useState<"overview" | "evidence" | "activity">("overview");
  const [doc, setDoc] = useState<DocId>("pod");
  const [highlight, setHighlight] = useState<DocId | null>(null);
  const [teach, setTeach] = useState<TeachStage>("idle");
  const [coach, setCoach] = useState(true);
  const groundsRef = useRef<HTMLTextAreaElement>(null);
  const done = useMilestones(DRAFT_STEPS.length, draft === "drafting", finishDraft);

  const open = d.status === "open";
  const filed = d.status === "filed";
  const recovered = d.status === "recovered";
  const cite = (x: DocId) => {
    setTeach("idle");
    setDoc(x);
    setHighlight(x);
    tourEvent("citation");
    if (typeof window !== "undefined" && window.innerWidth < 1024) document.getElementById("doc-pane")?.scrollIntoView({ behavior: "smooth" });
  };
  const myEvents = events.filter((e) => e.dedId === d.id);

  const centre = (
    <>
      <Header
        d={d}
        title={`Amazon shortage · ${usd(c.amount)}`}
        sub={`PO ${c.po} · Invoice ${c.invoice} · ${c.portal}`}
        status={<StatusPill status={open && draft === "ready" ? "draft" : d.status} />}
      >
        <Tabs
          id="detail"
          className="mt-5"
          value={tab}
          onChange={setTab}
          tabs={[
            { id: "overview", label: "Overview" },
            { id: "evidence", label: "Evidence", count: 3 },
            { id: "activity", label: "Activity", count: myEvents.length },
          ]}
        />
      </Header>

      <div className="flex flex-col gap-6 px-4 py-6 sm:px-8">
        {tab === "overview" && (
          <>
            <VerdictCard highlight={highlight} onCite={cite} tourChip />

            <AnimatePresence mode="popLayout" initial={false}>
              {open && draft === "drafting" && (
                <motion.div key="drafting" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.3, ease: EASE }}>
                  <Card className="p-5">
                    <div className="text-base font-medium">Drafting the dispute</div>
                    <div className="mt-0.5 mb-4 text-xs text-t3">Each step finishes before the next one starts.</div>
                    <Milestones items={DRAFT_STEPS} done={done} />
                  </Card>
                </motion.div>
              )}
              {open && draft === "ready" && (
                <motion.div key="draft" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.5, ease: EASE }} className="flex flex-col gap-3">
                  <DraftCard groundsRef={groundsRef} />
                  <AnimatePresence>
                    {coach && (
                      <CoachMark onClose={() => setCoach(false)}>
                        Under {usd(THRESHOLD)}, so one approver. {USER.name} can file this without {APPROVER.name}.
                      </CoachMark>
                    )}
                  </AnimatePresence>
                </motion.div>
              )}
              {(filed || recovered) && (
                <motion.div key="tracker" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }}>
                  <Card className="p-5">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <div className="text-xs text-t3">Dispute status</div>
                        <div className="mt-0.5 text-lg font-medium">{recovered ? `Recovered ${usd(c.amount)}` : `Filed, pending · ${usd(c.amount)}`}</div>
                      </div>
                      <LinkButton href="/ledger" size="sm" variant="tertiary">
                        Open ledger
                      </LinkButton>
                    </div>
                    <div className="mt-4">
                      <AmazonTracker />
                    </div>
                  </Card>
                </motion.div>
              )}
            </AnimatePresence>

            <div>
              <SectionTitle>Four way match</SectionTitle>
              <p className="mt-0.5 mb-3 text-xs text-t3">Four documents agree on {c.poCases} cases. One does not.</p>
              <MatchTable />
            </div>

            <div>
              <SectionTitle>Timeline</SectionTitle>
              <div className="mt-3">
                <AmazonTimeline />
              </div>
            </div>
          </>
        )}

        {tab === "evidence" && (
          <div className="flex flex-col gap-3">
            <p className="text-sm text-t2">All 3 documents found. Open one to see the exact line Shortstop relied on.</p>
            {(
              [
                ["pod", `Proof of delivery, signed ${c.podTime}`, `${c.podConfidence}% match on the signature`],
                ["email", "Carrier email", `POD attached, PO ${c.po}`],
                ["invoice", `Invoice ${c.invoice}`, `${c.invoiceCases} cases · ${usd(c.invoiceTotal)}`],
              ] as [DocId, string, string][]
            ).map(([id, name, note]) => (
              <Card key={id} className="flex items-center justify-between gap-3 p-4">
                <div className="flex min-w-0 items-center gap-3">
                  <CheckCircle size={20} className="shrink-0 text-icon-success" />
                  <div className="min-w-0">
                    <div className="text-sm font-medium">{name}</div>
                    <div className="num truncate text-xs text-t3">{note}</div>
                  </div>
                </div>
                <Button size="sm" variant="tertiary" onClick={() => cite(id)}>
                  Show
                </Button>
              </Card>
            ))}
          </div>
        )}

        {tab === "activity" && (
          <div>
            {myEvents.length === 0 ? (
              <p className="text-sm text-t3">No activity yet. Actions on this deduction are logged here with who did them.</p>
            ) : (
              <ul className="flex flex-col gap-3">
                {myEvents.map((e) => (
                  <li key={e.id} className="flex gap-3 text-sm">
                    <span className="num w-12 shrink-0 text-xs leading-5 text-t3">{e.date}</span>
                    <span>
                      <span className="font-medium">{e.actor}</span> · <span className="text-t2">{e.text}</span>
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>
    </>
  );

  const bar = (
    <>
      {open && (
        <>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              disabled={draft !== "ready"}
              onClick={() => {
                setTab("overview");
                setTimeout(() => groundsRef.current?.focus(), 50);
              }}
            >
              <PencilSimple size={16} />
              Edit
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="danger" onClick={() => toast("Rejecting a recommendation is outside this demo path")}>
              <Prohibit size={16} />
              Reject
            </Button>
            {draft === "none" && (
              <Button
                variant="primary"
                data-tour="draft-dispute"
                onClick={() => {
                  setTab("overview");
                  startDraft();
                }}
              >
                <Sparkle size={16} />
                Draft dispute
              </Button>
            )}
            {draft === "drafting" && (
              <Button variant="primary" disabled>
                Drafting
              </Button>
            )}
            {draft === "ready" && (
              <Button variant="primary" data-tour="file-dispute" onClick={() => fileDisputes([d.id])}>
                <Check size={16} />
                File dispute with Amazon · {usd(c.amount)}
              </Button>
            )}
          </div>
        </>
      )}
      {filed && (
        <>
          <span className="text-sm text-t2">
            Filed {c.dates.today} by {USER.name} · waiting on Amazon
          </span>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="demo" onClick={simulatePayout}>
              Simulate payout (demo only)
            </Button>
            <LinkButton href="/approvals/target-promo" data-tour="open-approvals">
              Next: a dispute over {usd(THRESHOLD)}
              <ArrowRight size={16} />
            </LinkButton>
          </div>
        </>
      )}
      {recovered && (
        <>
          <span className="flex items-center gap-2 text-sm text-tsuccess">
            <CheckCircle size={18} />
            Recovered {usd(c.amount)} · paid {c.dates.paid} · synced to NetSuite and Ramp
          </span>
          <LinkButton href="/ledger">Open ledger</LinkButton>
        </>
      )}
    </>
  );

  return (
    <Panes
      d={d}
      centre={centre}
      bar={bar}
      doc={
        <div id="doc-pane" className="h-full">
          <DocViewer
            doc={doc}
            onDoc={(x) => {
              setDoc(x);
              setHighlight(null);
              setTeach("idle");
            }}
            highlight={highlight}
            teach={teach}
            onTeach={(s) => {
              if (s === "pick") {
                setDoc("pod");
                setHighlight(null);
              }
              setTeach(s);
            }}
            onSaveRule={saveRule}
            ruleSaved={podRuleSaved}
          />
        </div>
      }
    />
  );
}

/* The other 14: same layout, simpler record */
/* One drawn document, or a missing slot that says where Shortstop looked and who is being asked. */
function CaseDocuments({ d, requested, searching, searchDone }: { d: Deduction; requested: boolean; searching: boolean; searchDone: number }) {
  const info = caseFor(d);
  return (
    <div className="flex flex-col gap-3 p-4">
      {info.docs.map((doc, i) =>
        i < d.evidence ? (
          <Paper key={doc.name} title={doc.name.toUpperCase()} sub={`${d.retailer} ${d.type.toLowerCase()} · ${usd(d.amount)}`} from={doc.source} to={BRAND}>
            <PaperRow k="Retailer" v={d.retailer} />
            <PaperRow k="Deduction type" v={d.type} />
            <PaperRow k={doc.name === "Invoice" ? "Short-paid on this invoice" : "Amount"} v={usd(d.amount)} />
            <PaperRow k="Period" v="October 2026" />
            <PaperRow k="Found in" v={doc.source} />
            <div className="mt-1 flex items-start gap-2 rounded-md bg-success-subtle p-2.5 text-xs text-tsuccess">
              <CheckCircle size={14} className="mt-0.5 shrink-0" />
              <span>{doc.proves}</span>
            </div>
          </Paper>
        ) : (
          <div key={doc.name} className={cx("rounded-sm border border-dashed p-4", requested ? "border-line-warning bg-warning-subtle" : "border-line-strong")}>
            <div className="flex items-center justify-between gap-3 text-xs">
              <span className="font-semibold text-t2">{doc.name}</span>
              <span className="font-medium text-twarning">{requested ? "Requested · Nov 9" : searching ? "Searching" : "Missing"}</span>
            </div>
            <p className="mt-2 text-xs text-t2">{doc.proves}.</p>
            <p className="mt-1 text-xs text-t3">
              {requested
                ? `Not in ${doc.source}. Shortstop asked ${doc.holder} for it and will attach it here when it arrives.`
                : `Not found in ${doc.source} yet. Gather evidence searches every connected source, then asks ${doc.holder}.`}
            </p>
          </div>
        ),
      )}
      {(searching || requested) && d.evidence < 3 && (
        <div className="rounded-xl border border-line bg-card p-4">
          <div className="text-xs font-semibold text-t3">{requested ? "What Shortstop did" : "Gathering evidence"}</div>
          <div className="mt-3">
            <Milestones items={gatherSteps(d)} done={requested ? 4 : searchDone} />
          </div>
        </div>
      )}
    </div>
  );
}

const gatherSteps = (d: Deduction) => {
  const info = caseFor(d);
  const missing = info.docs.slice(d.evidence);
  return [
    `Searched ${PORTALS[d.retailer]}`,
    "Searched NetSuite",
    "Searched carrier and 3PL emails",
    `Asked ${[...new Set(missing.map((m) => m.holder))].join(" and ")} for ${missing.length === 1 ? missing[0].name.toLowerCase() : `${missing.length} documents`}`,
  ];
};

export function GenericDetail({ d }: { d: Deduction }) {
  const requested = useStore((s) => s.requested.includes(d.id));
  const requestEvidence = useStore((s) => s.requestEvidence);
  const fileDisputes = useStore((s) => s.fileDisputes);
  const [searching, setSearching] = useState(false);
  const searchDone = useMilestones(4, searching, () => {
    requestEvidence(d.id);
    setSearching(false);
  });
  const info = caseFor(d);
  const complete = d.evidence === 3;
  const over = d.amount > THRESHOLD;
  const missingDocs = info.docs.slice(d.evidence);
  const foundDocs = info.docs.slice(0, d.evidence);
  const open = d.status === "open";

  const centre = (
    <>
      <Header d={d} title={`${d.retailer} ${d.type.toLowerCase()} · ${usd(d.amount)}`} sub={`${PORTALS[d.retailer]} · dispute window closes in ${days(d.deadlineDays)}`} status={<StatusPill status={d.status} />} />
      <div className="flex flex-col gap-6 px-4 py-6 sm:px-8">
        <DarkCard className="p-5">
          <div className="flex items-center gap-2">
            <Sparkle size={18} className="text-lime" />
            <span className="text-lg font-medium">{complete ? "Dispute recommended" : requested ? "Waiting on evidence" : "Not enough evidence yet"}</span>
          </div>
          <p className="mt-3 text-sm text-inv2">
            {info.claim}{" "}
            {complete
              ? `All 3 documents are on file, so Shortstop can back up a dispute for ${usd(d.amount)}.`
              : `Shortstop has ${d.evidence} of 3 documents. It will not draft a dispute it cannot back up.`}
          </p>
          <ul className="mt-3 flex flex-col gap-1.5 text-sm">
            {foundDocs.map((x) => (
              <li key={x.name} className="flex items-start gap-2 text-tinv">
                <CheckCircle size={16} className="mt-0.5 shrink-0 text-lime" />
                <span>
                  {x.name} · found in {x.source}
                </span>
              </li>
            ))}
            {missingDocs.map((x) => (
              <li key={x.name} className="flex items-start gap-2 text-inv2">
                <Warning size={16} className="mt-0.5 shrink-0" />
                <span>
                  {x.name} · {requested ? `requested from ${x.holder}` : "missing"}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-inv3">{info.win}</p>
          <div className="mt-4">
            <Evidence n={d.evidence} inverted />
          </div>
        </DarkCard>
        {d.flag && <FlagRow flag={d.flag} />}
        {over && (
          <Card className="flex flex-wrap items-center justify-between gap-3 p-4">
            <div className="text-sm">
              <div className="font-medium">Over the {usd(THRESHOLD)} threshold</div>
              <div className="text-xs text-t3">
                Needs {APPROVER.name}, {APPROVER.role}, as second approver.
              </div>
            </div>
            {d.id === TARGET_ID && (
              <LinkButton href="/approvals/target-promo" size="sm">
                Open approval
              </LinkButton>
            )}
          </Card>
        )}
        <div>
          <SectionTitle>Details</SectionTitle>
          <div className="mt-3">
            {[
              ["Retailer", d.retailer],
              ["Type", d.type],
              ["Amount", usd(d.amount)],
              ["Dispute window", `${days(d.deadlineDays)} left`],
              ["Queue rank", `${d.rank} of 15`],
              ["Approval", over ? `Two people · over ${usd(THRESHOLD)}` : `One approver · under ${usd(THRESHOLD)}`],
              ["Files to", PORTALS[d.retailer]],
            ].map(([k, v], i) => (
              <div key={k}>
                {i > 0 && <Divider />}
                <div className="flex justify-between gap-4 py-2.5 text-sm">
                  <span className="text-t3">{k}</span>
                  <span className="num text-right font-medium">{v}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div>
          <SectionTitle>What happens next</SectionTitle>
          <ol className="mt-3 flex flex-col gap-2 text-sm text-t2">
            {(complete
              ? ["You read the three documents on the right.", `You file the dispute with ${d.retailer}. Nothing is sent before that click.`, "The amount moves to Filed, pending, and counts as recovered only when the retailer pays."]
              : [`Gather evidence searches ${PORTALS[d.retailer]}, NetSuite and the carrier inbox again.`, `Anything still missing is requested from ${[...new Set(missingDocs.map((m) => m.holder))].join(" and ")}.`, "When all 3 documents are on file, Shortstop drafts the dispute for you to review."]
            ).map((t, i) => (
              <li key={t} className="flex gap-2.5">
                <span className="num mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-subtle text-xs font-medium">{i + 1}</span>
                <span>{t}</span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </>
  );

  const bar = (
    <>
      <span className="text-sm text-t3">{complete ? "All 3 documents found" : `${d.evidence} of 3 documents found`}</span>
      {d.status === "filed" && <Pill tone="accent">Filed, pending</Pill>}
      {d.status === "needs-approval" && <Pill tone="warning">Waiting for {APPROVER.name}</Pill>}
      {open && complete && (
        <Button variant="primary" onClick={() => fileDisputes([d.id])}>
          File dispute with {d.retailer} · {usd(d.amount)}
        </Button>
      )}
      {open && !complete &&
        (requested ? (
          <Pill tone="warning">Evidence requested · Nov 9</Pill>
        ) : (
          <Button variant="primary" disabled={searching} onClick={() => setSearching(true)}>
            <MagnifyingGlass size={16} />
            {searching ? "Gathering evidence" : "Gather evidence"}
          </Button>
        ))}
    </>
  );

  return (
    <Panes
      d={d}
      centre={centre}
      bar={bar}
      doc={
        <div>
          <div className="flex items-center justify-between px-4 pt-4">
            <span className="text-sm font-medium">Documents</span>
            <span className="num text-xs text-t3">{d.evidence} of 3 on file</span>
          </div>
          <CaseDocuments d={d} requested={requested} searching={searching} searchDone={searchDone} />
        </div>
      }
    />
  );
}
