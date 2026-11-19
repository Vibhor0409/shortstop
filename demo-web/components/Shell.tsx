"use client";

import {
  Bell,
  ChartBar,
  GearSix,
  Gavel,
  List,
  ListChecks,
  MagnifyingGlass,
  ShieldCheck,
  SquaresFour,
  Storefront,
  UserCircle,
  X,
} from "@phosphor-icons/react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { BRAND, PERIOD, USER } from "@/lib/data";
import { cx } from "./ui";

const NAV = [
  { label: "Dashboard", href: "/dashboard", match: "/dashboard", icon: SquaresFour },
  { label: "Guard", href: "/guard/4471", match: "/guard", icon: ShieldCheck },
  { label: "Deductions", href: "/recover", match: "/recover", icon: ListChecks },
  { label: "Disputes", href: "/approvals/target-promo", match: "/approvals", icon: Gavel },
  { label: "Retailers", href: "/connect", match: "/connect", icon: Storefront },
  { label: "Reports", href: "/ledger", match: "/ledger", icon: ChartBar },
  { label: "Settings", href: "/settings", match: "/settings", icon: GearSix },
];

export function Wordmark({ sub = true }: { sub?: boolean }) {
  return (
    <div>
      <div className="text-xl leading-7 font-medium">Shortstop</div>
      <div className="mt-0.5 h-1 w-16 rounded-full bg-lime" />
      {sub && <div className="mt-1.5 text-xs text-t3">{BRAND}</div>}
    </div>
  );
}

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-col gap-1">
      {NAV.map((n) => {
        const active = pathname.startsWith(n.match);
        const Icon = n.icon;
        return (
          <Link
            key={n.label}
            href={n.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cx(
              "flex h-10 items-center gap-3 rounded-lg border px-3 text-sm transition-colors duration-150",
              active ? "border-line bg-card font-medium text-t1" : "border-transparent text-t2 hover:bg-canvas-selected",
            )}
          >
            <Icon size={18} />
            {n.label}
          </Link>
        );
      })}
    </nav>
  );
}

function UserChip() {
  return (
    <div className="flex items-center gap-3 rounded-lg border border-line bg-card px-3 py-2">
      <UserCircle size={28} />
      <div>
        <div className="text-sm font-medium">{USER.name}</div>
        <div className="text-xs text-t3">{USER.role}</div>
      </div>
    </div>
  );
}

export function Shell({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();
  useEffect(() => setOpen(false), [pathname]);

  return (
    <div className="flex flex-1 flex-col min-[900px]:flex-row">
      {/* Desktop sidebar */}
      <aside className="sticky top-10 hidden h-[calc(100dvh-var(--sp-500))] w-60 shrink-0 flex-col bg-canvas-hover p-4 min-[900px]:flex">
        <div className="px-2 pt-2 pb-6">
          <Wordmark />
        </div>
        <NavList />
        <div className="mt-auto">
          <UserChip />
        </div>
      </aside>
      <div className="hidden w-px shrink-0 bg-line min-[900px]:block" />

      {/* Mobile top bar */}
      <header className="sticky top-10 z-30 flex h-14 items-center justify-between bg-canvas-hover px-4 min-[900px]:hidden">
        <Wordmark sub={false} />
        <button type="button" aria-label={open ? "Close menu" : "Open menu"} aria-expanded={open} onClick={() => setOpen((o) => !o)} className="rounded-lg p-2 hover:bg-canvas-selected">
          {open ? <X size={22} /> : <List size={22} />}
        </button>
      </header>
      <div className="h-px bg-line min-[900px]:hidden" />
      {open && (
        <div className="fixed inset-x-0 top-24 bottom-0 z-30 flex flex-col gap-4 bg-canvas-hover p-4 min-[900px]:hidden">
          <NavList onNavigate={() => setOpen(false)} />
          <div className="mt-auto">
            <UserChip />
          </div>
        </div>
      )}

      <main className="min-w-0 flex-1">{children}</main>
    </div>
  );
}

/** Page frame: breadcrumb, title, and the decorative search, period chip and bell. */
export function Page({ crumb, title, children, meta }: { crumb: string; title: string; children: ReactNode; meta?: ReactNode }) {
  return (
    <div className="mx-auto flex w-full max-w-[1200px] flex-col gap-5 px-4 pt-5 pb-40 sm:px-6 min-[1440px]:px-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="text-xs text-t3">{crumb}</div>
          <h1 className="mt-1 text-2xl font-normal">{title}</h1>
          {meta && <div className="mt-2 flex flex-wrap items-center gap-2">{meta}</div>}
        </div>
        <TopRight />
      </div>
      {children}
    </div>
  );
}

export function TopRight() {
  return (
    <div className="hidden items-center gap-3 lg:flex">
      <label className="flex h-10 w-56 items-center gap-2 rounded-lg border border-line bg-card px-3 text-sm text-t3 xl:w-64">
        <MagnifyingGlass size={16} />
        <input aria-label="Search" placeholder="Search PO, invoice or retailer" className="w-full bg-transparent text-t1 outline-none placeholder:text-t3" />
      </label>
      <span className="flex h-10 items-center rounded-lg border border-line bg-card px-3 text-sm font-medium whitespace-nowrap">{PERIOD}</span>
      <button type="button" aria-label="Notifications" className="flex h-10 w-10 items-center justify-center rounded-lg border border-line bg-card hover:bg-canvas-hover">
        <Bell size={18} />
      </button>
    </div>
  );
}
