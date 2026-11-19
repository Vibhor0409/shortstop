"use client";

import { AnimatePresence, animate, motion, useReducedMotion } from "motion/react";
import { Check, CheckCircle, CircleNotch, Clock, Warning, WarningCircle, X } from "@phosphor-icons/react";
import Link from "next/link";
import { useEffect, useRef, useState, type ButtonHTMLAttributes, type ReactNode } from "react";
import { usd, type Flag, type Status } from "@/lib/data";

export const EASE = [0.22, 1, 0.36, 1] as const;
export const cx = (...xs: (string | false | null | undefined)[]) => xs.filter(Boolean).join(" ");

/* Button */
type Variant = "primary" | "secondary" | "tertiary" | "danger" | "ghost" | "demo" | "inverted";
type Size = "sm" | "md" | "lg";
const variants: Record<Variant, string> = {
  primary: "bg-lime text-t1 hover:bg-lime-hover active:bg-lime-click disabled:bg-lime-disabled disabled:text-tdis",
  secondary: "bg-act2 text-tinv hover:bg-act2-hover active:bg-act2-click disabled:bg-act2-disabled",
  tertiary: "bg-act3 text-t1 border border-line-strong hover:bg-act3-hover active:bg-act3-click disabled:text-tdis",
  danger: "bg-act3 text-terror border border-line-error hover:bg-error-subtle disabled:text-tdis",
  ghost: "text-t1 hover:bg-canvas-hover active:bg-canvas-selected disabled:text-tdis",
  demo: "bg-card text-t1 border border-dashed border-line-ink hover:bg-canvas-hover disabled:text-tdis",
  inverted: "bg-inv-raised text-tinv border border-inv-line hover:bg-act2-hover",
};
const sizes: Record<Size, string> = {
  sm: "h-8 px-3 text-xs gap-1.5",
  md: "h-10 px-4 text-sm gap-2",
  lg: "h-12 px-5 text-base gap-2",
};
export const btn = (variant: Variant = "secondary", size: Size = "md", extra = "") =>
  cx(
    "inline-flex items-center justify-center rounded-lg font-semibold whitespace-nowrap transition-colors duration-150 select-none",
    variants[variant],
    sizes[size],
    extra,
  );

export function Button({
  variant = "secondary",
  size = "md",
  className,
  ...p
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size }) {
  return <button type="button" {...p} className={btn(variant, size, className)} />;
}

export function LinkButton({
  href,
  variant = "secondary",
  size = "md",
  className,
  children,
  ...rest
}: {
  href: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  children: ReactNode;
  target?: string;
  rel?: string;
  onClick?: () => void;
  "data-tour"?: string;
}) {
  return (
    <Link href={href} className={btn(variant, size, className)} {...rest}>
      {children}
    </Link>
  );
}

/* Card */
export function Card({ className, children, ...p }: { className?: string; children: ReactNode } & Record<string, unknown>) {
  return (
    <div {...p} className={cx("rounded-2xl border border-line bg-card", className)}>
      {children}
    </div>
  );
}
export function DarkCard({ className, children, ...p }: { className?: string; children: ReactNode } & Record<string, unknown>) {
  return (
    <div {...p} className={cx("rounded-2xl bg-ink text-tinv", className)}>
      {children}
    </div>
  );
}
export const Divider = ({ className }: { className?: string }) => <div className={cx("h-px w-full bg-line", className)} />;

/* Pill */
type Tone = "neutral" | "warning" | "error" | "success" | "accent" | "dark";
const tones: Record<Tone, string> = {
  neutral: "bg-subtle text-t2",
  warning: "bg-warning-subtle text-twarning",
  error: "bg-error-subtle text-terror",
  success: "bg-success-subtle text-tsuccess",
  accent: "bg-accent-subtle text-t1",
  dark: "bg-ink text-tinv",
};
export function Pill({ tone = "neutral", children, className }: { tone?: Tone; children: ReactNode; className?: string }) {
  return (
    <span className={cx("inline-flex h-6 items-center gap-1 rounded-full px-2.5 text-xs font-medium whitespace-nowrap", tones[tone], className)}>
      {children}
    </span>
  );
}

const statusMeta: Record<string, { tone: Tone; label: string; icon: ReactNode }> = {
  open: { tone: "neutral", label: "Open", icon: <Clock size={14} /> },
  draft: { tone: "neutral", label: "Draft · not sent", icon: <Clock size={14} /> },
  filed: { tone: "accent", label: "Filed", icon: <Check size={14} /> },
  recovered: { tone: "success", label: "Recovered", icon: <CheckCircle size={14} /> },
  "needs-approval": { tone: "warning", label: "Needs approval", icon: <Warning size={14} /> },
};
/** Status pill that crossfades when the status changes: Draft, Filed, Recovered. */
export function StatusPill({ status }: { status: Status | "draft" }) {
  const m = statusMeta[status];
  const reduce = useReducedMotion();
  return (
    <span className="inline-flex">
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={status}
          initial={reduce ? false : { opacity: 0, y: 6, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: -6 }}
          transition={{ duration: 0.3, ease: EASE }}
          className="inline-flex"
        >
          <Pill tone={m.tone}>
            {m.icon}
            {m.label}
          </Pill>
        </motion.span>
      </AnimatePresence>
    </span>
  );
}

/* Evidence as 3 segments */
export function Evidence({ n, label = true, inverted }: { n: number; label?: boolean; inverted?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2" aria-label={`${n} of 3 documents`}>
      <span className="inline-flex gap-1">
        {[1, 2, 3].map((i) => (
          <span
            key={i}
            className={cx("h-1 w-5 rounded-full", i <= n ? (inverted ? "bg-lime" : "bg-ink") : inverted ? "bg-inv-line" : "bg-canvas-selected")}
          />
        ))}
      </span>
      {label && <span className={cx("text-xs whitespace-nowrap", inverted ? "text-inv2" : "text-t3")}>{n} of 3 docs</span>}
    </span>
  );
}

/* Money that counts to its new value when a total changes */
export function Money({ value, className, sans }: { value: number; className?: string; sans?: boolean }) {
  const reduce = useReducedMotion();
  const [shown, setShown] = useState(value);
  const prev = useRef(value);
  useEffect(() => {
    if (prev.current === value) return;
    const from = prev.current;
    prev.current = value;
    if (reduce) {
      setShown(value);
      return;
    }
    const c = animate(from, value, { duration: 0.5, ease: EASE, onUpdate: (v) => setShown(Math.round(v)) });
    return () => c.stop();
  }, [value, reduce]);
  return <span className={cx(sans ? "tabular-nums" : "num", className)}>{usd(shown)}</span>;
}

/* Flag sub-row: a tinted row under a queue item */
export function FlagRow({ flag, className }: { flag: Flag; className?: string }) {
  const err = flag.tone === "error";
  return (
    <div className={cx("flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-medium", err ? "bg-error-subtle text-terror" : "bg-warning-subtle text-twarning", className)}>
      {err ? <WarningCircle size={16} className="shrink-0" /> : <Warning size={16} className="shrink-0" />}
      <span>{flag.text}</span>
    </div>
  );
}

/* Checkbox and toggle */
export function Checkbox({ checked, onChange, label, disabled }: { checked: boolean; onChange: (v: boolean) => void; label: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={(e) => {
        e.stopPropagation();
        onChange(!checked);
      }}
      className={cx(
        "flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border transition-colors duration-150",
        checked ? "border-line-ink bg-ink text-tinv" : "border-line-strong bg-card hover:bg-canvas-hover",
        disabled && "opacity-50",
      )}
    >
      {checked && <Check size={14} />}
    </button>
  );
}

export function Toggle({ on, onChange, label, disabled }: { on: boolean; onChange: () => void; label: string; disabled?: boolean }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      disabled={disabled}
      onClick={onChange}
      className={cx("relative h-6 w-11 shrink-0 rounded-full transition-colors duration-300", on ? "bg-ink" : "bg-act2-disabled", disabled && "opacity-60")}
    >
      <motion.span
        className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-card"
        animate={{ x: on ? 20 : 0 }}
        transition={{ duration: 0.3, ease: EASE }}
      />
    </button>
  );
}

/* Tabs */
export function Tabs<T extends string>({ tabs, value, onChange, className, id }: { tabs: { id: T; label: string; count?: number }[]; value: T; onChange: (t: T) => void; className?: string; id: string }) {
  return (
    <div className={cx("relative flex gap-6", className)} role="tablist">
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          role="tab"
          aria-selected={value === t.id}
          onClick={() => onChange(t.id)}
          className={cx("relative flex items-center gap-2 pb-3 text-sm font-medium transition-colors", value === t.id ? "text-t1" : "text-t3 hover:text-t1")}
        >
          {t.label}
          {t.count !== undefined && <span className="num rounded-full bg-subtle px-1.5 text-xs text-t2">{t.count}</span>}
          {value === t.id && (
            <motion.span layoutId={`tab-${id}`} className="absolute right-0 bottom-0 left-0 h-0.5 bg-ink" transition={{ duration: 0.3, ease: EASE }} />
          )}
        </button>
      ))}
      <span className="absolute right-0 bottom-0 left-0 -z-0 h-px bg-line" />
    </div>
  );
}

/* Milestones: the agent's progress, in sequence, not a spinner */
export function Milestones({ items, done, inverted }: { items: string[]; done: number; inverted?: boolean }) {
  return (
    <ol className="flex flex-col gap-3">
      {items.map((label, i) => {
        const state = i < done ? "done" : i === done ? "active" : "todo";
        return (
          <li key={label} className="flex items-center gap-3 text-sm">
            <span
              className={cx(
                "flex h-6 w-6 shrink-0 items-center justify-center rounded-full",
                state === "done" && (inverted ? "bg-lime text-t1" : "bg-ink text-tinv"),
                state === "active" && (inverted ? "bg-inv-raised text-tinv" : "bg-subtle text-t1"),
                state === "todo" && (inverted ? "border border-inv-line" : "border border-line-strong"),
              )}
            >
              {state === "done" && (
                <motion.span initial={{ scale: 0.4, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.3, ease: EASE }}>
                  <Check size={14} />
                </motion.span>
              )}
              {state === "active" && <CircleNotch size={14} className="animate-spin motion-reduce:animate-none" />}
            </span>
            <span className={cx(state === "todo" ? (inverted ? "text-inv3" : "text-tdis") : inverted ? "text-tinv" : "text-t1", state === "active" && "font-medium")}>
              {label}
            </span>
          </li>
        );
      })}
    </ol>
  );
}

/** Runs milestones in sequence while `running`, then calls onDone once. */
export function useMilestones(count: number, running: boolean, onDone: () => void, stepMs = 650) {
  const [done, setDone] = useState(0);
  const cb = useRef(onDone);
  cb.current = onDone;
  useEffect(() => {
    if (!running) return;
    setDone(0);
    let i = 0;
    const t = setInterval(() => {
      i += 1;
      setDone(i);
      if (i >= count) {
        clearInterval(t);
        setTimeout(() => cb.current(), 350);
      }
    }, stepMs);
    return () => clearInterval(t);
  }, [running, count, stepMs]);
  return done;
}

/* Status tracker: Filed, Retailer review, Paid, Synced */
export function Tracker({ steps, stage }: { steps: { label: string; note?: string }[]; stage: number }) {
  // stage = number of completed steps. The step at index `stage` is in progress.
  return (
    <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${steps.length}, minmax(0, 1fr))` }}>
      {steps.map((s, i) => {
        const done = i < stage;
        const active = i === stage;
        return (
          <div key={s.label} className="min-w-0">
            <div className="h-1.5 overflow-hidden rounded-full bg-canvas-selected">
              <motion.div
                className={cx("h-full rounded-full", done ? "bg-ink" : "bg-icon-subtle")}
                initial={false}
                animate={{ width: done ? "100%" : active ? "40%" : "0%" }}
                transition={{ duration: 0.5, ease: EASE, delay: done ? i * 0.18 : 0 }}
              />
            </div>
            <div className={cx("mt-2 flex items-center gap-1.5 text-xs font-medium", done || active ? "text-t1" : "text-tdis")}>
              {done && <CheckCircle size={14} className="shrink-0 text-icon-success" />}
              <span className="truncate">{s.label}</span>
            </div>
            {s.note && <div className={cx("num mt-0.5 text-xs", done || active ? "text-t3" : "text-tdis")}>{s.note}</div>}
          </div>
        );
      })}
    </div>
  );
}

/* Coach-mark: the dark pop-up that explains an automatic change */
export function CoachMark({ children, onClose, className }: { children: ReactNode; onClose?: () => void; className?: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 8 }}
      transition={{ duration: 0.3, ease: EASE }}
      className={cx("flex items-start gap-3 rounded-xl bg-ink px-4 py-3 text-sm text-tinv shadow-pop", className)}
      role="status"
    >
      <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-lime" />
      <span className="flex-1">{children}</span>
      {onClose && (
        <button type="button" onClick={onClose} aria-label="Dismiss" className="rounded-sm p-0.5 text-inv2 hover:text-tinv">
          <X size={16} />
        </button>
      )}
    </motion.div>
  );
}

/* Modal: focused, page dimmed behind */
export function Modal({ open, onClose, title, children, footer }: { open: boolean; onClose: () => void; title: string; children: ReactNode; footer: ReactNode }) {
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [open, onClose]);
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-end justify-center bg-overlay-lg p-4 sm:items-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, ease: EASE }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className="flex max-h-[85vh] w-full max-w-xl flex-col rounded-2xl border border-line bg-card shadow-pop"
            initial={{ opacity: 0, y: 16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ duration: 0.3, ease: EASE }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-6 pt-5 pb-4">
              <h2 className="text-lg font-medium">{title}</h2>
              <button type="button" onClick={onClose} aria-label="Close" className="rounded-lg p-1.5 hover:bg-canvas-hover">
                <X size={18} />
              </button>
            </div>
            <Divider />
            <div className="overflow-y-auto px-6 py-4">{children}</div>
            <Divider />
            <div className="flex flex-wrap items-center justify-end gap-3 px-6 py-4">{footer}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cx("skeleton", className)} />;
}

/* Stat card with a big numeral */
export function Stat({ label, value, sub, tone, tour }: { label: string; value: number; sub: ReactNode; tone?: "risk" | "good"; tour?: string }) {
  return (
    <Card className={cx("flex min-w-0 flex-col gap-2 p-4 min-[1440px]:p-5", tone === "good" && value > 0 && "border-line-success bg-success-subtle")} data-tour={tour}>
      <div className="text-sm text-t2">{label}</div>
      <Money sans value={value} className={cx("text-3xl font-medium min-[1440px]:text-4xl", tone === "risk" && value > 0 && "text-terror")} />
      <div className="text-xs text-t3">{sub}</div>
    </Card>
  );
}
