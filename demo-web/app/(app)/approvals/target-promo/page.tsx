"use client";

import { ArrowRight, CheckCircle, ClockCountdown, ListChecks, PaperPlaneTilt, ShieldCheck, Sparkle, UserCircle } from "@phosphor-icons/react";
import { Page } from "@/components/Shell";
import { Button, Card, DarkCard, Divider, Evidence, LinkButton, Pill, StatusPill, cx } from "@/components/ui";
import { APPROVER, PORTALS, TARGET_ID, THRESHOLD, USER, days, usd } from "@/lib/data";
import { useStore } from "@/lib/store";

export default function Approvals() {
  const d = useStore((s) => s.deductions.find((x) => x.id === TARGET_ID))!;
  const requestApproval = useStore((s) => s.requestApproval);
  const sent = d.status === "needs-approval";
  const over = d.amount - THRESHOLD;

  return (
    <Page
      crumb="Disputes / Target promo"
      title={`Target promo · ${usd(d.amount)}`}
      meta={
        <>
          <StatusPill status={d.status} />
          <Pill tone="warning">Over the {usd(THRESHOLD)} threshold</Pill>
        </>
      }
    >
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
        <div className="flex min-w-0 flex-col gap-5">
          <DarkCard className="p-6">
            <div className="flex items-center gap-2">
              <Sparkle size={18} className="text-lime" />
              <span className="text-lg font-medium">Second approver needed</span>
            </div>
            <p className="mt-3 max-w-[60ch] text-sm text-inv2">
              Target deducted {usd(d.amount)} as a promo charge. That is {usd(over)} over the {usd(THRESHOLD)} threshold, so the person who prepares the dispute cannot be the one who approves it.{" "}
              {APPROVER.name}, {APPROVER.role}, has to sign off before anything is filed with Target.
            </p>
            <div className="my-4 h-px bg-inv-line" />
            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-inv2">
              <Evidence n={d.evidence} inverted />
              <span>Dispute window closes in {days(d.deadlineDays)}</span>
              <span>Files to {PORTALS[d.retailer]}</span>
            </div>
          </DarkCard>

          <Card className="p-5">
            <div className="text-base font-medium">Recommendation summary</div>
            <div className="mt-3">
              {[
                ["Retailer", d.retailer],
                ["Deduction type", d.type],
                ["Amount", usd(d.amount)],
                ["Threshold", usd(THRESHOLD)],
                ["Evidence", `${d.evidence} of 3 documents`],
                ["Dispute window", `${days(d.deadlineDays)} left`],
              ].map(([k, v], i) => (
                <div key={k}>
                  {i > 0 && <Divider />}
                  <div className="flex justify-between py-2.5 text-sm">
                    <span className="text-t3">{k}</span>
                    <span className="num font-medium">{v}</span>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-3 text-xs text-t3">
              The third document is still being gathered. {APPROVER.name} can approve the dispute now so it files as soon as the evidence is complete, inside the window.
            </p>
          </Card>
        </div>

        <Card className="border-line-ink p-5">
          <div className="flex items-center gap-2 text-base font-medium">
            <ShieldCheck size={20} />
            Two person approval
          </div>
          <p className="mt-2 text-sm text-t2">Nothing is sent to Target until both people have acted.</p>

          <div className="mt-4 flex flex-col gap-3">
            <div className="flex items-center gap-3 rounded-xl border border-line p-3">
              <UserCircle size={28} className="shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium">{USER.name}</div>
                <div className="text-xs text-t3">{USER.role} · prepares</div>
              </div>
              <Pill tone={sent ? "success" : "neutral"}>
                {sent && <CheckCircle size={14} />}
                {sent ? "Requested" : "You"}
              </Pill>
            </div>
            <div className={cx("flex items-center gap-3 rounded-xl border p-3", sent ? "border-line-warning bg-warning-subtle" : "border-line")}>
              <UserCircle size={28} className="shrink-0" />
              <div className="min-w-0 flex-1">
                <div className="text-sm font-medium">{APPROVER.name}</div>
                <div className="text-xs text-t3">{APPROVER.role} · approves</div>
              </div>
              <Pill tone={sent ? "warning" : "neutral"}>{sent ? "Waiting" : "Not asked yet"}</Pill>
            </div>
          </div>

          <ul className="mt-4 flex flex-col gap-3 text-sm text-t2">
            <li className="flex gap-3">
              <ListChecks size={18} className="mt-0.5 shrink-0" />
              <span>
                Above {usd(THRESHOLD)}, a second approver from finance must sign off, and the proposer can never approve their own dispute.
              </span>
            </li>
            <li className="flex gap-3">
              <ClockCountdown size={18} className="mt-0.5 shrink-0" />
              <span>The audit log records who approved, when, and under which rule.</span>
            </li>
          </ul>

          <div className="mt-5 flex flex-col gap-2">
            {sent ? (
              <div className="rounded-lg bg-subtle px-3 py-2.5 text-sm text-t2">
                Sent to {APPROVER.name}. You will see it move to filed once he approves.
              </div>
            ) : (
              <Button variant="primary" onClick={requestApproval} data-tour="request-approval" className="w-full">
                <PaperPlaneTilt size={16} />
                Request approval from {APPROVER.name} · {usd(d.amount)}
              </Button>
            )}
            <LinkButton href="/ledger" variant={sent ? "secondary" : "tertiary"} className="w-full" data-tour={sent ? "request-approval" : undefined}>
              Open the ledger
              <ArrowRight size={16} />
            </LinkButton>
          </div>
        </Card>
      </div>
    </Page>
  );
}
