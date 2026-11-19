"use client";

import { ArrowRight, CheckCircle, Eye, LockSimple, PencilSimpleLine, Plugs, PlugsConnected, WarningCircle } from "@phosphor-icons/react";
import { motion } from "motion/react";
import { useState } from "react";
import { Page } from "@/components/Shell";
import { Button, Card, Divider, EASE, LinkButton, Milestones, Modal, Pill, Toggle, cx, useMilestones } from "@/components/ui";
import { CONNECT } from "@/lib/cases";
import { SEED_DEDUCTIONS, SOURCES, sum, usd, type SourceId } from "@/lib/data";
import { useStore } from "@/lib/store";

const IMPORT_STEPS = [
  "Connected 8 sources",
  "Pulled October remittances",
  "Matched payments to invoices",
  "Found 15 deductions",
  "Ranked by deadline and amount",
];

/* How one source is connected: method, what it can read, what it may do, then a simulated authorisation. */
function ConnectModal({ id, onClose }: { id: SourceId | null; onClose: () => void }) {
  const connections = useStore((s) => s.connections);
  const connect = useStore((s) => s.connect);
  const [running, setRunning] = useState(false);
  const src = SOURCES.find((s) => s.id === id);
  const info = id ? CONNECT[id] : null;
  const count = info?.authSteps.length ?? 4;
  const done = useMilestones(count, running, () => {
    if (id) connect(id);
    setRunning(false);
  });
  const state = id ? connections[id] : "idle";
  const connected = state === "connected";
  const close = () => {
    setRunning(false);
    onClose();
  };

  return (
    <Modal
      open={!!id}
      onClose={close}
      title={src ? (connected ? `${src.name} is connected` : `Connect ${src.name}`) : "Connect"}
      footer={
        connected ? (
          <Button variant="primary" onClick={close}>
            Done
          </Button>
        ) : (
          <>
            <Button variant="tertiary" onClick={close}>
              Cancel
            </Button>
            <Button variant="primary" disabled={running} onClick={() => setRunning(true)}>
              <PlugsConnected size={16} />
              {running ? "Connecting" : state === "disconnected" ? `Reconnect ${src?.name ?? ""}` : `Authorise ${src?.name ?? ""}`}
            </Button>
          </>
        )
      }
    >
      {src && info && (
        <div className="flex flex-col gap-5">
          <div>
            <div className="text-xs font-semibold text-t3">How it connects</div>
            <div className="mt-1 text-sm font-medium">{info.method}</div>
            <ol className="mt-2 flex flex-col gap-1.5 text-sm text-t2">
              {info.how.map((h, i) => (
                <li key={h} className="flex gap-2.5">
                  <span className="num mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-subtle text-xs font-medium">{i + 1}</span>
                  <span>{h}</span>
                </li>
              ))}
            </ol>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-xl border border-line bg-canvas p-3.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-t3">
                <Eye size={14} />
                Shortstop can read
              </div>
              <ul className="mt-2 flex flex-col gap-1 text-sm">
                {info.reads.map((r) => (
                  <li key={r} className="flex items-start gap-2">
                    <CheckCircle size={16} className="mt-0.5 shrink-0 text-icon-success" />
                    {r}
                  </li>
                ))}
              </ul>
            </div>
            <div className="rounded-xl border border-line bg-canvas p-3.5">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-t3">
                <PencilSimpleLine size={14} />
                Shortstop can change
              </div>
              <p className="mt-2 text-sm">{info.writes}</p>
              <p className="mt-2 flex items-start gap-2 text-xs text-t3">
                <LockSimple size={14} className="mt-0.5 shrink-0" />
                Nothing else. No password is typed into Shortstop.
              </p>
            </div>
          </div>
          {(running || connected) && (
            <div>
              <div className="text-xs font-semibold text-t3">{connected ? "Connection check" : "Connecting"}</div>
              <div className="mt-2">
                <Milestones items={info.authSteps} done={connected ? info.authSteps.length : done} />
              </div>
            </div>
          )}
          <p className="text-xs text-t3">
            <span className="font-semibold text-t2">Demo only.</span> No real account is contacted. In the product this step opens {src.name} in a new window.
          </p>
        </div>
      )}
    </Modal>
  );
}

export default function Connect() {
  const connections = useStore((s) => s.connections);
  const importStage = useStore((s) => s.importStage);
  const connectAll = useStore((s) => s.connectAll);
  const finishImport = useStore((s) => s.finishImport);
  const toggleDrop = useStore((s) => s.togglePortalDrop);
  const done = useMilestones(IMPORT_STEPS.length, importStage === "importing", finishImport);
  const [open, setOpen] = useState<SourceId | null>(null);

  const connected = SOURCES.filter((s) => connections[s.id] === "connected").length;
  const all = connected === SOURCES.length;
  const total = sum(SEED_DEDUCTIONS.map((d) => d.amount));
  const dropped = connections.kroger === "disconnected";

  return (
    <Page crumb="Retailers" title="Connect your sources">
      <Card className="mb-5 p-5">
        <div className="text-base font-medium">How connecting works</div>
        <div className="mt-3 grid gap-4 md:grid-cols-3">
          {[
            ["1", "Pick a source", "Click Connect on a retailer portal, the carrier, NetSuite or Ramp to see exactly how it is linked."],
            ["2", "Approve read only access", "Portals: your admin adds Shortstop as a read only user. NetSuite and Ramp: you sign in on their site and approve. No password is typed here."],
            ["3", "Shortstop reads October", "It pulls remittances, matches each payment to its invoice and lists every short payment."],
          ].map(([n, t, d]) => (
            <div key={n} className="flex gap-3">
              <span className="num flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-ink text-sm font-medium text-tinv">{n}</span>
              <div>
                <div className="text-sm font-medium">{t}</div>
                <div className="mt-0.5 text-xs text-t3">{d}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_360px]">
        <Card>
          <div className="flex flex-wrap items-center justify-between gap-3 p-5">
            <div>
              <div className="text-base font-medium">Sources</div>
              <div className="num mt-0.5 text-xs text-t3">{connected} of 8 connected</div>
            </div>
            {importStage === "idle" && (
              <Button variant="primary" onClick={connectAll} data-tour="connect-all">
                <PlugsConnected size={18} />
                {all ? "Import October" : "Connect all 8 and import October"}
              </Button>
            )}
          </div>
          <Divider />
          <ul>
            {SOURCES.map((s, i) => {
              const st = connections[s.id];
              return (
                <li key={s.id}>
                  {i > 0 && <Divider />}
                  <div className={cx("flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3.5", st === "disconnected" && "bg-error-subtle")}>
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-subtle text-sm font-semibold">{s.name[0]}</span>
                    <div className="min-w-0 flex-1 basis-48">
                      <div className="text-sm font-medium">{s.name}</div>
                      <div className="text-xs text-t3">
                        {s.kind} · {s.brings}
                      </div>
                      <div className="mt-0.5 text-xs text-t3">
                        {st === "connected" ? "Read only · " : "Connects by: "}
                        {CONNECT[s.id].method.charAt(0).toLowerCase() + CONNECT[s.id].method.slice(1)}
                      </div>
                    </div>
                    {st === "idle" && (
                      <Button size="sm" variant="tertiary" onClick={() => setOpen(s.id)}>
                        <Plugs size={14} />
                        Connect
                      </Button>
                    )}
                    {st === "connected" && (
                      <>
                        <motion.span initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.3, ease: EASE }}>
                          <Pill tone="success">
                            <CheckCircle size={14} />
                            Connected
                          </Pill>
                        </motion.span>
                        <Button size="sm" variant="tertiary" onClick={() => setOpen(s.id)}>
                          Access details
                        </Button>
                      </>
                    )}
                    {st === "disconnected" && (
                      <>
                        <Pill tone="error">
                          <WarningCircle size={14} />
                          Portal disconnected
                        </Pill>
                        <Button size="sm" onClick={() => setOpen(s.id)}>
                          Reconnect
                        </Button>
                      </>
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
          <Divider />
          <div className="flex items-center justify-between gap-4 px-5 py-3.5">
            <div className="text-xs text-t3">
              <span className="font-semibold text-t2">Demo only.</span> Simulate the Kroger portal dropping its session, to see the reconnect state.
            </div>
            <Toggle on={dropped} onChange={toggleDrop} label="Simulate a dropped portal" />
          </div>
        </Card>

        <div className="flex flex-col gap-5">
          <Card className="p-5">
            <div className="text-base font-medium">Import</div>
            <div className="mt-0.5 text-xs text-t3">
              {importStage === "idle" && (all ? "All 8 sources are connected. Import October to continue." : "Connect the sources one by one, or all at once, and Shortstop reads October.")}
              {importStage === "importing" && "Reading October, step by step."}
              {importStage === "done" && "October is in."}
            </div>
            <div className="mt-4">
              <Milestones items={IMPORT_STEPS} done={importStage === "done" ? IMPORT_STEPS.length : importStage === "importing" ? done : -1} />
            </div>
          </Card>

          {importStage === "done" && (
            <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, ease: EASE }}>
              <Card className="p-5">
                <div className="text-xs text-t3">Import complete</div>
                <div className="mt-1 text-xl font-medium">
                  October: <span className="num">{SEED_DEDUCTIONS.length}</span> deductions · <span className="num">{usd(total)}</span> short-paid
                </div>
                <LinkButton href="/dashboard" variant="primary" className="mt-4 w-full" data-tour="open-dashboard">
                  Open the dashboard
                  <ArrowRight size={16} />
                </LinkButton>
              </Card>
            </motion.div>
          )}
        </div>
      </div>
      <ConnectModal id={open} onClose={() => setOpen(null)} />
    </Page>
  );
}
