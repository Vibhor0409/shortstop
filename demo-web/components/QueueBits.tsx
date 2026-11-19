"use client";

import { CaretRight, CheckCircle, Clock, MagnifyingGlass, UsersThree } from "@phosphor-icons/react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { THRESHOLD, days, usd, type Deduction } from "@/lib/data";
import { Button, Checkbox, Divider, Evidence, FlagRow, Pill, Skeleton, StatusPill, cx } from "./ui";


/** Compact queue row used on the dashboard. */
export function MiniRow({ d, n }: { d: Deduction; n: number }) {
  return (
    <Link href={`/recover/${d.id}`} className="flex items-center gap-4 rounded-xl bg-card px-4 py-3 transition-colors duration-150 hover:bg-card-hover sm:px-5">
      <span className="num hidden w-4 text-xs text-t3 sm:block">{n}</span>
      <div className="min-w-0 flex-1">
        <div className="text-sm font-semibold">{d.retailer}</div>
        <div className="truncate text-xs text-t3">
          {d.type}
          {d.ref ? ` · ${d.ref}` : ""}
        </div>
      </div>
      <span className="num text-sm font-medium">{usd(d.amount)}</span>
      <span className={cx("hidden items-center gap-1.5 text-sm sm:flex", d.deadlineDays <= 3 ? "text-terror" : "text-t2")}>
        <Clock size={16} />
        {days(d.deadlineDays)}
      </span>
      <span className="hidden md:block">
        <Evidence n={d.evidence} />
      </span>
      <CaretRight size={16} className="shrink-0" />
    </Link>
  );
}

export function EmptyQueue({ filtered }: { filtered?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-2 px-6 py-16 text-center">
      <CheckCircle size={32} className="text-icon-success" />
      <div className="text-lg font-medium">All caught up</div>
      <p className="max-w-[40ch] text-sm text-t3">
        {filtered ? "Nothing in the queue matches this filter." : "Every deduction is filed, recovered or waiting on someone else."}
      </p>
    </div>
  );
}

export function QueueSkeleton({ rows = 6 }: { rows?: number }) {
  return (
    <div aria-busy="true" aria-label="Loading queue">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i}>
          {i > 0 && <Divider />}
          <div className="flex items-center gap-4 px-5 py-4">
            <Skeleton className="h-5 w-5" />
            <div className="flex flex-1 flex-col gap-2">
              <Skeleton className="h-3.5 w-24" />
              <Skeleton className="h-3 w-36" />
            </div>
            <Skeleton className="h-4 w-14" />
            <Skeleton className="hidden h-4 w-16 sm:block" />
            <Skeleton className="hidden h-4 w-28 md:block" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function QueueRow({
  d,
  selected,
  onSelect,
  requested,
  onGather,
  tour,
}: {
  d: Deduction;
  selected: boolean;
  onSelect: (v: boolean) => void;
  requested: boolean;
  onGather: () => void;
  tour?: string;
}) {
  const router = useRouter();
  const href = `/recover/${d.id}`;
  return (
    <div className={cx("transition-colors duration-150", selected && "bg-canvas")}>
      <div
        role="link"
        tabIndex={0}
        onClick={() => router.push(href)}
        onKeyDown={(e) => e.key === "Enter" && router.push(href)}
        data-tour={tour}
        className="grid cursor-pointer grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-x-3 gap-y-2 px-4 py-3.5 hover:bg-card-hover sm:gap-x-4 sm:px-5 md:grid-cols-[auto_24px_minmax(0,1.3fr)_80px_88px_132px_minmax(132px,auto)_16px]"
      >
        <Checkbox checked={selected} onChange={onSelect} label={`Select ${d.retailer} ${d.type}`} />
        <span className="num hidden text-xs text-t3 md:block">{d.rank}</span>
        <div className="min-w-0">
          <div className="text-sm font-semibold">{d.retailer}</div>
          <div className="truncate text-xs text-t3">
            {d.type}
            {d.ref ? ` · ${d.ref}` : ""}
          </div>
        </div>
        <span className="num text-right text-sm font-medium">{usd(d.amount)}</span>
        <span className={cx("hidden items-center gap-1.5 text-sm md:flex", d.deadlineDays <= 3 ? "font-medium text-terror" : "text-t2")}>
          <Clock size={16} />
          {days(d.deadlineDays)}
        </span>
        <span className="hidden md:block">
          <Evidence n={d.evidence} />
        </span>
        <span className="hidden justify-start md:flex">
          <RowAction d={d} requested={requested} onGather={onGather} />
        </span>
        <CaretRight size={16} className="shrink-0" />
        {/* Phone: second line */}
        <div className="col-span-4 flex flex-wrap items-center gap-x-4 gap-y-2 pl-8 md:hidden">
          <span className={cx("flex items-center gap-1.5 text-xs", d.deadlineDays <= 3 ? "font-medium text-terror" : "text-t2")}>
            <Clock size={14} />
            {days(d.deadlineDays)}
          </span>
          <Evidence n={d.evidence} />
          <RowAction d={d} requested={requested} onGather={onGather} />
        </div>
      </div>
      {d.flag && (
        <div className="px-4 pb-3 sm:px-5 md:pl-[88px]">
          <FlagRow flag={d.flag} />
        </div>
      )}
    </div>
  );
}

function RowAction({ d, requested, onGather }: { d: Deduction; requested: boolean; onGather: () => void }) {
  if (d.status === "needs-approval") return <StatusPill status="needs-approval" />;
  if (d.evidence === 3) return <Pill tone="accent">Ready to file</Pill>;
  if (d.amount > THRESHOLD)
    return (
      <Pill tone="warning">
        <UsersThree size={14} />
        Second approver
      </Pill>
    );
  if (d.evidence === 1)
    return requested ? (
      <Pill>Evidence requested</Pill>
    ) : (
      <Button
        size="sm"
        variant="tertiary"
        onClick={(e) => {
          e.stopPropagation();
          onGather();
        }}
      >
        <MagnifyingGlass size={14} />
        Gather evidence
      </Button>
    );
  return <span className="text-xs text-t3">1 document missing</span>;
}

