"use client";

import { AnimatePresence, motion } from "motion/react";
import { ArrowCounterClockwise, ArrowLeft, ArrowRight, ArrowSquareOut, CheckCircle, EyeSlash, X } from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { AMAZON_ID } from "@/lib/data";
import { useStore } from "@/lib/store";
import { FIGMA_URL, STEPS } from "@/lib/tour";
import { Button, EASE, cx } from "./ui";

/** Rehydrates the session store after mount. Pages render once the saved state is in, so nothing flashes from the start state. */
export function HydrateGate({ children }: { children: ReactNode }) {
  const hydrated = useStore((s) => s.hydrated);
  useEffect(() => {
    Promise.resolve(useStore.persist.rehydrate()).then(() => useStore.getState().setHydrated());
  }, []);
  if (!hydrated) return <div className="flex-1" aria-busy="true" />;
  return <>{children}</>;
}

/* Slim demo bar: always present, holds the demo-only controls */
export function DemoBar() {
  const router = useRouter();
  const pathname = usePathname();
  const tour = useStore((s) => s.tour);
  const reset = useStore((s) => s.reset);
  const startTour = useStore((s) => s.startTour);
  const hideGuide = useStore((s) => s.hideGuide);
  const toast = useStore((s) => s.toast);
  const guided = tour.mode === "guided";

  return (
    <div className="sticky top-0 z-40 flex h-10 shrink-0 items-center justify-between gap-3 bg-canvas-selected px-4 text-xs">
      <div className="flex min-w-0 items-center gap-2 text-t2">
        <span className="rounded-sm bg-ink px-1.5 py-0.5 font-semibold text-tinv">Demo</span>
        <span className="hidden truncate sm:inline">
          {guided ? `Guided tour · step ${tour.step + 1} of ${STEPS.length}` : "Fixed sample data · nothing is sent anywhere"}
        </span>
      </div>
      <div className="flex shrink-0 items-center gap-1 font-medium">
        {guided && tour.hidden && pathname !== "/" && (
          <button type="button" className="rounded-sm px-2 py-1 hover:bg-line-strong" onClick={() => hideGuide(false)}>
            Show guide
          </button>
        )}
        <button
          type="button"
          className="rounded-sm px-2 py-1 hover:bg-line-strong"
          onClick={() => {
            startTour();
            router.push(STEPS[0].route);
          }}
        >
          Restart tour
        </button>
        <button
          type="button"
          className="flex items-center gap-1 rounded-sm px-2 py-1 hover:bg-line-strong"
          onClick={() => {
            reset();
            toast("Demo reset to the start");
            if (guided) router.push(STEPS[0].route);
          }}
        >
          <ArrowCounterClockwise size={14} />
          Reset demo
        </button>
        <a href={FIGMA_URL} target="_blank" rel="noreferrer" className="hidden items-center gap-1 rounded-sm px-2 py-1 hover:bg-line-strong sm:flex">
          Figma mockup
          <ArrowSquareOut size={14} />
        </a>
      </div>
    </div>
  );
}

/* Toasts */
function ToastItem({ id, children, long }: { id: string; children: ReactNode; long: boolean }) {
  const dismiss = useStore((s) => s.dismissToast);
  useEffect(() => {
    const t = setTimeout(() => dismiss(id), long ? 9000 : 5000);
    return () => clearTimeout(t);
  }, [id, long, dismiss]);
  return <>{children}</>;
}

export function Toaster() {
  const toasts = useStore((s) => s.toasts);
  const dismiss = useStore((s) => s.dismissToast);
  const runUndo = useStore((s) => s.runUndo);
  return (
    <div className="pointer-events-none fixed inset-x-0 z-[60] flex flex-col max-sm:top-28 sm:bottom-4 items-center gap-2 px-4" aria-live="polite">
      <AnimatePresence>
        {toasts.map((t) => (
          <motion.div
            key={t.id}
            layout
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="pointer-events-auto flex max-w-full items-center gap-3 rounded-xl border border-line bg-card py-2.5 pr-2.5 pl-4 text-sm shadow-pop"
          >
            <ToastItem id={t.id} long={!!t.undo}>
              <CheckCircle size={18} className="shrink-0 text-icon-success" />
              <span className="min-w-0 font-medium">{t.text}</span>
              {t.undo && (
                <Button size="sm" variant="tertiary" onClick={() => runUndo(t)}>
                  Undo
                </Button>
              )}
              <button type="button" aria-label="Dismiss" onClick={() => dismiss(t.id)} className="rounded-sm p-1 text-icon-subtle hover:bg-canvas-hover">
                <X size={16} />
              </button>
            </ToastItem>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}

/* Guided tour card */
export function GuideCard() {
  const router = useRouter();
  const pathname = usePathname();
  const hydrated = useStore((s) => s.hydrated);
  const tour = useStore((s) => s.tour);
  const setStep = useStore((s) => s.setStep);
  const hideGuide = useStore((s) => s.hideGuide);
  const step = STEPS[tour.step];
  const next = STEPS[tour.step + 1];
  const active = hydrated && tour.mode === "guided" && pathname !== "/";
  const onRoute = pathname === step.route;

  // Clicking a highlighted link moves to the next step's page: follow it.
  useEffect(() => {
    if (!active || !next) return;
    if (pathname !== step.route && pathname === next.route) setStep(tour.step + 1);
  }, [active, pathname, step.route, next, setStep, tour.step]);

  // Pulsing ring on the element to click next.
  useEffect(() => {
    const clear = () => document.querySelectorAll(".tour-ring").forEach((el) => el.classList.remove("tour-ring"));
    if (!active || !step.target || !onRoute) {
      clear();
      return;
    }
    const apply = () => {
      const el = document.querySelector(`[data-tour="${step.target}"]`);
      document.querySelectorAll(".tour-ring").forEach((x) => x !== el && x.classList.remove("tour-ring"));
      if (el && !el.classList.contains("tour-ring")) {
        el.classList.add("tour-ring");
        el.scrollIntoView({ block: "center", behavior: "smooth" });
      }
    };
    apply();
    const t = setInterval(apply, 250);
    return () => {
      clearInterval(t);
      clear();
    };
  }, [active, step.target, onRoute, tour.step]);

  if (!active) return null;

  const go = (i: number) => {
    setStep(i);
    if (STEPS[i].route !== pathname) router.push(STEPS[i].route);
  };
  const onNext = () => {
    if (!onRoute) {
      router.push(step.route);
      return;
    }
    if (step.auto) {
      const s = useStore.getState();
      const before = s.tour.step;
      if (step.auto === "connectAll") s.connectAll();
      if (step.auto === "updateAsn") s.updateAsn();
      if (step.auto === "startDraft") s.startDraft();
      if (step.auto === "file") s.fileDisputes([AMAZON_ID]);
      if (step.auto === "payout") s.simulatePayout();
      // If the action had already happened, or cannot run from here, just move on.
      const after = useStore.getState();
      const pending = (step.auto === "connectAll" && after.importStage === "importing") || (step.auto === "startDraft" && after.draft === "drafting");
      if (after.tour.step === before && !pending) go(before + 1);
      return;
    }
    if (next) go(tour.step + 1);
  };

  const last = tour.step === STEPS.length - 1;

  return (
    <AnimatePresence>
      {!tour.hidden && (
        <motion.aside
          key="guide"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.3, ease: EASE }}
          className="fixed right-3 bottom-3 z-50 w-[calc(100vw-var(--sp-300))] max-w-[360px] rounded-2xl bg-ink p-4 text-tinv shadow-pop sm:right-5 sm:bottom-5"
          aria-label="Guided tour"
        >
          <div className="flex items-center justify-between gap-3">
            <div className="text-xs font-medium text-inv2">
              <span className="num">
                Step {tour.step + 1} of {STEPS.length}
              </span>{" "}
              · {step.chapter}
            </div>
            <button type="button" onClick={() => hideGuide(true)} className="flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-xs text-inv2 hover:text-tinv">
              <EyeSlash size={14} />
              Hide guide
            </button>
          </div>
          <div className="mt-2 flex gap-1">
            {STEPS.map((_, i) => (
              <span key={i} className={cx("h-0.5 flex-1 rounded-full", i <= tour.step ? "bg-lime" : "bg-inv-line")} />
            ))}
          </div>
            <motion.dl
              key={tour.step}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3, ease: EASE }}
              className="mt-3 flex flex-col gap-2.5 text-sm"
            >
              {(
                [
                  ["What you see", step.see],
                  ["What Shortstop did", step.did],
                  ["Why it matters", step.why],
                ] as const
              ).map(([k, v]) => (
                <div key={k}>
                  <dt className="text-xs font-semibold text-inv3">{k}</dt>
                  <dd className="mt-0.5 text-inv2">{v}</dd>
                </div>
              ))}
            </motion.dl>
          {!onRoute && <div className="mt-3 text-xs text-inv3">You wandered off the tour. Next brings you back.</div>}
          {onRoute && step.target && !last && <div className="mt-3 text-xs text-inv3">Click the highlighted element, or press Next.</div>}
          <div className="mt-3 flex items-center justify-between gap-2">
            <Button size="sm" variant="inverted" disabled={tour.step === 0} onClick={() => go(tour.step - 1)} className="disabled:opacity-40">
              <ArrowLeft size={14} />
              Back
            </Button>
            {last ? (
              <Link href="/done" className="text-xs text-inv2">
                End of tour
              </Link>
            ) : (
              <Button size="sm" variant="primary" onClick={onNext}>
                Next
                <ArrowRight size={14} />
              </Button>
            )}
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
