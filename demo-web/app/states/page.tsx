"use client";

import { CheckCircle, WarningCircle } from "@phosphor-icons/react";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { DraftCard, MatchTable, VerdictCard } from "@/components/Detail";
import { EvidenceSlots, type DocId } from "@/components/Docs";
import { EmptyQueue, QueueRow, QueueSkeleton } from "@/components/QueueBits";
import { Button, Card, Checkbox, CoachMark, Divider, Evidence, FlagRow, Milestones, Pill, StatusPill, Toggle, Tracker } from "@/components/ui";
import { SEED_DEDUCTIONS } from "@/lib/data";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-lg font-medium">{title}</h2>
      {children}
    </section>
  );
}
const Row = ({ children }: { children: ReactNode }) => <div className="flex flex-wrap items-center gap-3">{children}</div>;

const TRACK = [{ label: "Filed", note: "Nov 9" }, { label: "Retailer review" }, { label: "Paid" }, { label: "Synced to ERP + Ramp" }];
const STEPS = ["Matched PO to invoice", "Pulled signed POD", "Checked Amazon's dispute format", "Drafted 4 fields", "Ready for your review"];

export default function States() {
  const [check, setCheck] = useState(true);
  const [on, setOn] = useState(true);
  const [hl, setHl] = useState<DocId | null>(null);
  const amazon = SEED_DEDUCTIONS[0];
  const kroger = SEED_DEDUCTIONS[7];
  const oneDoc = SEED_DEDUCTIONS[3];

  return (
    <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-10 px-4 py-10 pb-40 sm:px-8">
      <div>
        <h1 className="text-3xl">Every component, every state</h1>
        <p className="mt-2 text-sm text-t3">
          A checking page, not part of the product. <Link href="/dashboard" className="underline underline-offset-4">Back to the app</Link>
        </p>
      </div>

      <Section title="Buttons">
        <Row>
          <Button variant="primary">File dispute with Amazon · $1,240</Button>
          <Button variant="primary" disabled>Primary disabled</Button>
          <Button>Secondary</Button>
          <Button disabled>Secondary disabled</Button>
          <Button variant="tertiary">Tertiary</Button>
          <Button variant="danger">Reject</Button>
          <Button variant="ghost">Edit</Button>
          <Button variant="demo">Simulate payout (demo only)</Button>
        </Row>
        <Row>
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
        </Row>
      </Section>

      <Section title="Status pills">
        <Row>
          <StatusPill status="open" />
          <StatusPill status="draft" />
          <StatusPill status="filed" />
          <StatusPill status="recovered" />
          <StatusPill status="needs-approval" />
          <Pill tone="accent">Ready to file</Pill>
          <Pill tone="success"><CheckCircle size={14} />Connected</Pill>
          <Pill tone="error"><WarningCircle size={14} />Portal disconnected</Pill>
          <Pill tone="warning">Set by retailer · verify</Pill>
        </Row>
      </Section>

      <Section title="Evidence, checkbox, toggle">
        <Row>
          <Evidence n={1} />
          <Evidence n={2} />
          <Evidence n={3} />
          <Checkbox checked={check} onChange={setCheck} label="Example checkbox" />
          <Checkbox checked={false} onChange={() => {}} label="Unchecked" />
          <Toggle on={on} onChange={() => setOn(!on)} label="Example toggle" />
          <Toggle on={false} onChange={() => {}} label="Locked toggle" disabled />
        </Row>
      </Section>

      <Section title="Flag sub rows">
        <FlagRow flag={{ tone: "warning", text: "Dispute window closes in 3 days" }} />
        <FlagRow flag={{ tone: "error", text: "Possible duplicate of an earlier Kroger deduction" }} />
      </Section>

      <Section title="Queue rows: ready, flagged, selected, gather evidence, requested">
        <Card className="overflow-hidden">
          <QueueRow d={amazon} selected={false} onSelect={() => {}} requested={false} onGather={() => {}} />
          <Divider />
          <QueueRow d={kroger} selected onSelect={() => {}} requested={false} onGather={() => {}} />
          <Divider />
          <QueueRow d={oneDoc} selected={false} onSelect={() => {}} requested={false} onGather={() => {}} />
          <Divider />
          <QueueRow d={oneDoc} selected={false} onSelect={() => {}} requested onGather={() => {}} />
          <Divider />
          <QueueRow d={{ ...SEED_DEDUCTIONS[4], status: "needs-approval" }} selected={false} onSelect={() => {}} requested={false} onGather={() => {}} />
        </Card>
      </Section>

      <Section title="Queue: loading skeleton">
        <Card className="overflow-hidden">
          <QueueSkeleton rows={3} />
        </Card>
      </Section>

      <Section title="Queue: empty">
        <Card>
          <EmptyQueue />
        </Card>
      </Section>

      <Section title="Portal disconnected">
        <Card className="overflow-hidden">
          <div className="flex flex-wrap items-center gap-4 bg-error-subtle px-5 py-3.5">
            <div className="min-w-0 flex-1">
              <div className="text-sm font-medium">Kroger</div>
              <div className="text-xs text-t3">Retailer portal · session dropped</div>
            </div>
            <Pill tone="error"><WarningCircle size={14} />Portal disconnected</Pill>
            <Button size="sm">Reconnect</Button>
          </div>
        </Card>
      </Section>

      <Section title="Not enough evidence">
        <div className="grid gap-4 md:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <Card key={n}>
              <div className="px-4 pt-4 text-sm font-medium">{n} of 3 documents</div>
              <EvidenceSlots found={n} />
            </Card>
          ))}
        </div>
      </Section>

      <Section title="Agent milestones: not started, running, complete">
        <div className="grid gap-4 md:grid-cols-3">
          {[-1, 2, 5].map((n) => (
            <Card key={n} className="p-5">
              <Milestones items={STEPS} done={n} />
            </Card>
          ))}
        </div>
      </Section>

      <Section title="Status tracker: filed, paid, synced">
        {[1, 3, 4].map((n) => (
          <Card key={n} className="p-5">
            <Tracker steps={TRACK} stage={n} />
          </Card>
        ))}
      </Section>

      <Section title="AI verdict card with citation chips">
        <div className="max-w-[640px]">
          <VerdictCard highlight={hl} onCite={setHl} />
        </div>
      </Section>

      <Section title="Dispute draft">
        <div className="max-w-[640px]">
          <DraftCard />
        </div>
      </Section>

      <Section title="Four way match">
        <Card className="max-w-[640px] p-3">
          <MatchTable />
        </Card>
      </Section>

      <Section title="Coach mark and toast">
        <div className="flex max-w-[480px] flex-col gap-3">
          <CoachMark onClose={() => {}}>Under $1,500, so one approver.</CoachMark>
          <CoachMark>Rule saved. Applies to future Amazon shortages.</CoachMark>
          <div className="flex items-center gap-3 rounded-xl border border-line bg-card py-2.5 pr-2.5 pl-4 text-sm shadow-pop">
            <CheckCircle size={18} className="shrink-0 text-icon-success" />
            <span className="font-medium">Dispute filed with Amazon · $1,240</span>
            <Button size="sm" variant="tertiary">Undo</Button>
          </div>
        </div>
      </Section>
    </div>
  );
}
