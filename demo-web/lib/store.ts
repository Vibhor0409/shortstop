"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import {
  AMAZON_CASE,
  AMAZON_ID,
  APPROVER,
  BRAND as BRAND_NAME,
  DEFAULT_GROUNDS,
  GUARD,
  SEED_DEDUCTIONS,
  SOURCES,
  TARGET_ID,
  USER,
  usd,
  sum,
  type Deduction,
  type Retailer,
  type SourceId,
} from "./data";
import { STEPS } from "./tour";

export type ConnState = "idle" | "connected" | "disconnected";
export type DraftStage = "none" | "drafting" | "ready";

export interface AuditEvent {
  id: string;
  date: string;
  actor: string;
  text: string;
  dedId?: string;
  kind: "import" | "guard" | "rule" | "draft" | "filed" | "approval" | "payout" | "sync";
}

export interface Toast {
  id: string;
  text: string;
  undo?: { kind: "file"; ids: string[] } | { kind: "approval" } | { kind: "asn" };
}

export interface Settings {
  autoDraft: boolean;
  secondApprover: boolean;
  flagDuplicates: boolean;
  syncLedger: boolean;
}

interface Data {
  deductions: Deduction[];
  guard: "open" | "fixed";
  connections: Record<SourceId, ConnState>;
  importStage: "idle" | "importing" | "done";
  draft: DraftStage;
  grounds: string;
  podRuleSaved: boolean;
  requested: string[];
  settings: Settings;
  events: AuditEvent[];
  tour: { mode: "guided" | "explore"; step: number; hidden: boolean };
}

interface Actions {
  hydrated: boolean;
  toasts: Toast[];
  setHydrated: () => void;
  connect: (id: SourceId) => void;
  connectAll: () => void;
  finishImport: () => void;
  togglePortalDrop: () => void;
  updateAsn: () => void;
  undoAsn: () => void;
  startDraft: () => void;
  finishDraft: () => void;
  setGrounds: (t: string) => void;
  fileDisputes: (ids: string[]) => void;
  unfile: (ids: string[]) => void;
  requestApproval: () => void;
  undoApproval: () => void;
  simulatePayout: () => void;
  saveRule: () => void;
  requestEvidence: (id: string) => void;
  toggleSetting: (k: keyof Settings) => void;
  toast: (text: string, undo?: Toast["undo"]) => void;
  dismissToast: (id: string) => void;
  runUndo: (t: Toast) => void;
  startTour: () => void;
  explore: () => void;
  setStep: (n: number) => void;
  hideGuide: (h: boolean) => void;
  tourEvent: (name: string) => void;
  reset: () => void;
}

export type Store = Data & Actions;

/* History that already exists before the analyst touches anything. Dates and figures are from demo-data.md. */
const seedEvents = (): AuditEvent[] => [
  { id: "seed-1", date: AMAZON_CASE.dates.shipped, actor: BRAND_NAME, kind: "import", dedId: AMAZON_ID, text: `Shipped PO ${AMAZON_CASE.po}. The ASN said ${AMAZON_CASE.asnCases} cases` },
  { id: "seed-2", date: AMAZON_CASE.dates.delivered, actor: "Carrier", kind: "import", dedId: AMAZON_ID, text: `Delivered PO ${AMAZON_CASE.po}. POD signed at ${AMAZON_CASE.podTime} for ${AMAZON_CASE.podCases} cases` },
  { id: "seed-3", date: AMAZON_CASE.dates.shortPaid, actor: "Amazon", kind: "import", dedId: AMAZON_ID, text: `Paid invoice ${AMAZON_CASE.invoice} short by ${usd(AMAZON_CASE.amount)}, shortage claim for ${AMAZON_CASE.shortCases} cases` },
  { id: "seed-4", date: AMAZON_CASE.dates.today, actor: "Shortstop", kind: "import", dedId: AMAZON_ID, text: `Matched PO ${AMAZON_CASE.po}, ASN, POD and invoice ${AMAZON_CASE.invoice}. 3 of 3 documents found` },
  { id: "seed-5", date: AMAZON_CASE.dates.today, actor: "Shortstop", kind: "import", text: `Guard flagged Walmart PO ${GUARD.po}: ASN ${GUARD.asnCases} cases against PO ${GUARD.poCases}, pickup at ${GUARD.pickup}` },
];

const allConn = (s: ConnState) =>
  Object.fromEntries(SOURCES.map((x) => [x.id, s])) as Record<SourceId, ConnState>;

const initial = (): Data => ({
  deductions: SEED_DEDUCTIONS.map((d) => ({ ...d })),
  guard: "open",
  connections: allConn("idle"),
  importStage: "idle",
  draft: "none",
  grounds: DEFAULT_GROUNDS,
  podRuleSaved: false,
  requested: [],
  settings: { autoDraft: true, secondApprover: true, flagDuplicates: true, syncLedger: true },
  events: seedEvents(),
  tour: { mode: "explore", step: 0, hidden: false },
});

let n = 0;
const uid = () => `${Date.now().toString(36)}-${n++}`;
const TODAY = AMAZON_CASE.dates.today;

export const useStore = create<Store>()(
  persist(
    (set, get) => {
      const log = (e: Omit<AuditEvent, "id">) => set((s) => ({ events: [...s.events, { ...e, id: uid() }] }));
      const setStatus = (ids: string[], status: Deduction["status"]) =>
        set((s) => ({ deductions: s.deductions.map((d) => (ids.includes(d.id) ? { ...d, status } : d)) }));

      return {
        ...initial(),
        hydrated: false,
        toasts: [],
        setHydrated: () => set({ hydrated: true }),

        connect: (id) => set((s) => ({ connections: { ...s.connections, [id]: "connected" } })),
        connectAll: () => {
          if (get().importStage !== "idle") return;
          set({ connections: allConn("connected"), importStage: "importing" });
        },
        finishImport: () => {
          if (get().importStage === "done") return;
          set({ importStage: "done" });
          const total = sum(SEED_DEDUCTIONS.map((d) => d.amount));
          log({
            date: TODAY,
            actor: "Shortstop",
            kind: "import",
            text: `Imported October from 8 sources: ${SEED_DEDUCTIONS.length} deductions, ${usd(total)} short-paid`,
          });
          get().tourEvent("imported");
        },
        togglePortalDrop: () =>
          set((s) => ({
            connections: {
              ...s.connections,
              kroger: s.connections.kroger === "disconnected" ? "connected" : "disconnected",
            },
          })),

        updateAsn: () => {
          if (get().guard === "fixed") return;
          set({ guard: "fixed" });
          log({
            date: TODAY,
            actor: USER.name,
            kind: "guard",
            text: `Updated ASN for Walmart PO ${GUARD.po} to ${GUARD.poCases} cases. ${usd(GUARD.claim)} shortage avoided`,
          });
          get().toast(`ASN updated to ${GUARD.poCases} cases · ${usd(GUARD.claim)} shortage avoided`, { kind: "asn" });
          get().tourEvent("asn-updated");
        },
        undoAsn: () => set((s) => ({ guard: "open", events: s.events.filter((e) => e.kind !== "guard") })),

        startDraft: () => {
          if (get().draft === "none") set({ draft: "drafting" });
        },
        finishDraft: () => {
          if (get().draft !== "drafting") return;
          set({ draft: "ready" });
          log({
            date: TODAY,
            actor: "Shortstop",
            kind: "draft",
            dedId: AMAZON_ID,
            text: "Drafted the Amazon shortage dispute, 4 fields, from 3 matched documents",
          });
          get().tourEvent("drafted");
        },
        setGrounds: (grounds) => set({ grounds }),

        fileDisputes: (ids) => {
          const rows = get().deductions.filter((d) => ids.includes(d.id) && d.status === "open" && d.evidence === 3);
          if (!rows.length) return;
          const fileIds = rows.map((d) => d.id);
          setStatus(fileIds, "filed");
          rows.forEach((d) =>
            log({
              date: TODAY,
              actor: USER.name,
              kind: "filed",
              dedId: d.id,
              text: `Filed ${d.type.toLowerCase()} dispute with ${d.retailer} · ${usd(d.amount)}`,
            }),
          );
          const total = sum(rows.map((d) => d.amount));
          get().toast(
            rows.length === 1
              ? `Dispute filed with ${rows[0].retailer} · ${usd(total)}`
              : `${rows.length} disputes filed · ${usd(total)}`,
            { kind: "file", ids: fileIds },
          );
          if (fileIds.includes(AMAZON_ID)) get().tourEvent("filed");
        },
        unfile: (ids) => {
          set((s) => ({
            deductions: s.deductions.map((d) =>
              ids.includes(d.id) && d.status === "filed" ? { ...d, status: "open" } : d,
            ),
            events: s.events.filter((e) => !(e.kind === "filed" && e.dedId && ids.includes(e.dedId))),
          }));
        },

        requestApproval: () => {
          const d = get().deductions.find((x) => x.id === TARGET_ID);
          if (!d || d.status !== "open") return;
          setStatus([TARGET_ID], "needs-approval");
          log({
            date: TODAY,
            actor: USER.name,
            kind: "approval",
            dedId: TARGET_ID,
            text: `Requested approval from ${APPROVER.name}, ${APPROVER.role} · ${d.retailer} ${d.type.toLowerCase()} ${usd(d.amount)}`,
          });
          get().toast(`Approval requested from ${APPROVER.name} · ${usd(d.amount)}`, { kind: "approval" });
          get().tourEvent("approval-requested");
        },
        undoApproval: () =>
          set((s) => ({
            deductions: s.deductions.map((d) =>
              d.id === TARGET_ID && d.status === "needs-approval" ? { ...d, status: "open" } : d,
            ),
            events: s.events.filter((e) => e.kind !== "approval"),
          })),

        simulatePayout: () => {
          const d = get().deductions.find((x) => x.id === AMAZON_ID);
          if (!d || d.status !== "filed") return;
          setStatus([AMAZON_ID], "recovered");
          const paid = AMAZON_CASE.dates.paid;
          log({ date: paid, actor: "Amazon", kind: "payout", dedId: AMAZON_ID, text: `Paid ${usd(d.amount)} on the shortage dispute for PO ${AMAZON_CASE.po}` });
          log({ date: paid, actor: "Shortstop", kind: "sync", dedId: AMAZON_ID, text: `Synced ${usd(d.amount)} to NetSuite against invoice ${AMAZON_CASE.invoice}` });
          log({ date: paid, actor: "Shortstop", kind: "sync", dedId: AMAZON_ID, text: `Synced ${usd(d.amount)} to Ramp` });
          get().toast(`Amazon paid ${usd(d.amount)} · synced to NetSuite and Ramp`);
          get().tourEvent("payout");
        },

        saveRule: () => {
          if (get().podRuleSaved) return;
          set({ podRuleSaved: true });
          log({
            date: TODAY,
            actor: USER.name,
            kind: "rule",
            dedId: AMAZON_ID,
            text: "Saved rule: treat a signed POD quantity as delivered quantity for Amazon shortages",
          });
          get().toast("Rule saved · applies to future Amazon shortages");
          get().tourEvent("rule-saved");
        },
        requestEvidence: (id) => {
          if (get().requested.includes(id)) return;
          set((s) => ({ requested: [...s.requested, id] }));
          const d = get().deductions.find((x) => x.id === id);
          if (d) get().toast(`Evidence requested for ${d.retailer} ${d.type.toLowerCase()} · ${usd(d.amount)}`);
        },
        toggleSetting: (k) => set((s) => ({ settings: { ...s.settings, [k]: !s.settings[k] } })),

        toast: (text, undo) => set((s) => ({ toasts: [...s.toasts.slice(-2), { id: uid(), text, undo }] })),
        dismissToast: (id) => set((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) })),
        runUndo: (t) => {
          if (!t.undo) return;
          if (t.undo.kind === "file") get().unfile(t.undo.ids);
          if (t.undo.kind === "approval") get().undoApproval();
          if (t.undo.kind === "asn") get().undoAsn();
          get().dismissToast(t.id);
          get().toast("Undone");
        },

        startTour: () => set({ ...initial(), toasts: [], tour: { mode: "guided", step: 0, hidden: false } }),
        explore: () => set((s) => ({ tour: { ...s.tour, mode: "explore" } })),
        setStep: (step) =>
          set((s) => ({ tour: { ...s.tour, step: Math.max(0, Math.min(STEPS.length - 1, step)) } })),
        hideGuide: (hidden) => set((s) => ({ tour: { ...s.tour, hidden } })),
        tourEvent: (name) => {
          const { tour } = get();
          if (tour.mode !== "guided") return;
          if (STEPS[tour.step]?.waitFor === name) get().setStep(tour.step + 1);
        },
        reset: () => set((s) => ({ ...initial(), toasts: [], tour: { ...s.tour, step: 0 } })),
      };
    },
    {
      name: "shortstop-demo-v2",
      storage: createJSONStorage(() => sessionStorage),
      skipHydration: true,
      partialize: (s) => {
        const { deductions, guard, connections, importStage, draft, grounds, podRuleSaved, requested, settings, events, tour } = s;
        return {
          deductions,
          guard,
          connections,
          // A reload in the middle of a milestone run restarts that run.
          importStage,
          draft,
          grounds,
          podRuleSaved,
          requested,
          settings,
          events,
          tour,
        };
      },
    },
  ),
);

/* Derived selectors. Everything on screen reads from these. */
export const inQueue = (d: Deduction) => d.status === "open" || d.status === "needs-approval";
export const selAtRisk = (s: Store) => sum(s.deductions.filter(inQueue).map((d) => d.amount));
export const selFiledPending = (s: Store) => sum(s.deductions.filter((d) => d.status === "filed").map((d) => d.amount));
export const selRecovered = (s: Store) => sum(s.deductions.filter((d) => d.status === "recovered").map((d) => d.amount));
export const selQueueCount = (s: Store) => s.deductions.filter(inQueue).length;
export const selShortPaid = (s: Store) => sum(s.deductions.map((d) => d.amount));

export function byRetailer(deductions: Deduction[], retailers: Retailer[]) {
  return retailers.map((r) => {
    const rows = deductions.filter((d) => d.retailer === r);
    return { retailer: r, total: sum(rows.map((d) => d.amount)), lines: rows.length };
  });
}
