"use client";

import { ArrowRight, GraduationCap, Lock, ShieldCheck, Warning } from "@phosphor-icons/react";
import { Page } from "@/components/Shell";
import { Card, Divider, LinkButton, Pill, Toggle } from "@/components/ui";
import { TEACH_RULE } from "@/components/Docs";
import { APPROVER, PORTALS, RETAILERS, THRESHOLD, USER, days, usd } from "@/lib/data";
import { inQueue, useStore, type Settings } from "@/lib/store";

const RULES: { key: keyof Settings; title: string; note: string }[] = [
  { key: "autoDraft", title: "Draft a dispute when all 3 documents are found", note: "Shortstop prepares the draft. It is never sent without a person." },
  { key: "secondApprover", title: `Require a second approver above ${usd(THRESHOLD)}`, note: "The proposer can never approve their own dispute." },
  { key: "flagDuplicates", title: "Flag possible duplicates before filing", note: "Shown as a tinted row under the deduction in the queue." },
  { key: "syncLedger", title: "Sync payouts to NetSuite and Ramp", note: "Recovered cash is posted against the original invoice." },
];

export default function SettingsPage() {
  const settings = useStore((s) => s.settings);
  const toggle = useStore((s) => s.toggleSetting);
  const podRuleSaved = useStore((s) => s.podRuleSaved);
  const deductions = useStore((s) => s.deductions);
  const tourMode = useStore((s) => s.tour.mode);

  return (
    <Page crumb="Settings" title="Settings and rules">
      <div className="grid items-start gap-5 xl:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-5">
          <Card className="p-5">
            <div className="text-base font-medium">Approval threshold</div>
            <div className="mt-4 flex flex-wrap items-end gap-x-6 gap-y-3">
              <div className="text-4xl font-medium tabular-nums">{usd(THRESHOLD)}</div>
              <div className="pb-1 text-sm text-t2">
                At or under: one approver ({USER.name}, {USER.role}).
                <br />
                Over: second approver ({APPROVER.name}, {APPROVER.role}).
              </div>
            </div>
          </Card>

          <Card>
            <div className="p-5 pb-3">
              <div className="text-base font-medium">Rules</div>
              <div className="mt-0.5 text-xs text-t3">Switch them on or off. Changes apply to the next deduction.</div>
            </div>
            {RULES.map((r) => (
              <div key={r.key}>
                <Divider />
                <div className="flex items-center justify-between gap-4 px-5 py-3.5">
                  <div>
                    <div className="text-sm font-medium">{r.title}</div>
                    <div className="text-xs text-t3">{r.note}</div>
                  </div>
                  <Toggle on={settings[r.key]} onChange={() => toggle(r.key)} label={r.title} />
                </div>
              </div>
            ))}
            <Divider />
            <div className="flex items-center justify-between gap-4 px-5 py-3.5">
              <div>
                <div className="flex items-center gap-2 text-sm font-medium">
                  <Lock size={16} />
                  File disputes without a person
                </div>
                <div className="text-xs text-t3">Always off. Shortstop drafts and cites, and a human always files.</div>
              </div>
              <Toggle on={false} onChange={() => {}} label="File disputes without a person" disabled />
            </div>
          </Card>
        </div>

        <div className="flex min-w-0 flex-col gap-5">
          <Card>
            <div className="p-5 pb-3">
              <div className="text-base font-medium">Retailer dispute windows</div>
              <div className="mt-0.5 text-xs text-t3">Each retailer sets its own window. Shortstop shows the closest open deadline it has seen.</div>
            </div>
            <div className="overflow-x-auto">
              <div className="min-w-[460px]">
                <div className="grid grid-cols-[1fr_1.4fr_1fr] gap-3 px-5 py-2.5 text-xs text-t3">
                  <span>Retailer</span>
                  <span>Window length</span>
                  <span>Closest deadline</span>
                </div>
                {RETAILERS.map((r) => {
                  const open = deductions.filter((d) => d.retailer === r && inQueue(d));
                  const nearest = open.length ? Math.min(...open.map((d) => d.deadlineDays)) : null;
                  return (
                    <div key={r}>
                      <Divider />
                      <div className="grid grid-cols-[1fr_1.4fr_1fr] items-center gap-3 px-5 py-3 text-sm">
                        <div>
                          <div className="font-medium">{r}</div>
                          <div className="truncate text-xs text-t3">{PORTALS[r]}</div>
                        </div>
                        <span>
                          <Pill tone="warning">
                            <Warning size={14} />
                            Set by retailer · verify
                          </Pill>
                        </span>
                        <span className="num text-sm">{nearest === null ? "None open" : days(nearest)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <div className="text-base font-medium">What Shortstop has learned</div>
            <ul className="mt-3 flex flex-col gap-3 text-sm">
              <li className="flex gap-3">
                <ShieldCheck size={18} className="mt-0.5 shrink-0" />
                <span>
                  <span className="font-medium">ASN undercount at pack out</span>
                  <span className="block text-xs text-t3">Learned from Amazon PO 4388. Guard checks every ASN for it before pickup.</span>
                </span>
              </li>
              <li className="flex gap-3">
                <GraduationCap size={18} className="mt-0.5 shrink-0" />
                {podRuleSaved ? (
                  <span>
                    <span className="font-medium">{TEACH_RULE}</span>
                    <span className="block text-xs text-t3">Taught by {USER.name} from a POD signature line.</span>
                  </span>
                ) : (
                  <span className="text-t3">No taught rules yet. Use Teach Shortstop on a document to add one.</span>
                )}
              </li>
            </ul>
          </Card>

          <LinkButton href="/done" variant={tourMode === "guided" ? "primary" : "secondary"} data-tour="open-done" className="self-start">
            See the before and after
            <ArrowRight size={16} />
          </LinkButton>
        </div>
      </div>
    </Page>
  );
}
