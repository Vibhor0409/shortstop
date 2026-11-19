"use client";

import { ArrowRight, ArrowSquareOut } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { Wordmark } from "@/components/Shell";
import { Button, Card, Divider, Money } from "@/components/ui";
import { GUARD, SEED_DEDUCTIONS, sum, usd } from "@/lib/data";
import { selAtRisk, selFiledPending, selQueueCount, selRecovered, useStore } from "@/lib/store";
import { FIGMA_URL, STEPS } from "@/lib/tour";

export default function Done() {
  const router = useRouter();
  const atRisk = useStore(selAtRisk);
  const filed = useStore(selFiledPending);
  const recovered = useStore(selRecovered);
  const count = useStore(selQueueCount);
  const guard = useStore((s) => s.guard);
  const startTour = useStore((s) => s.startTour);
  const explore = useStore((s) => s.explore);
  const startRisk = sum(SEED_DEDUCTIONS.map((d) => d.amount));

  const rows: [string, React.ReactNode, React.ReactNode][] = [
    ["Open deductions", <span key="a" className="num">{SEED_DEDUCTIONS.length}</span>, <span key="b" className="num">{count}</span>],
    ["At risk", <span key="a" className="num">{usd(startRisk)}</span>, <Money key="b" value={atRisk} />],
    ["Filed, pending", <span key="a" className="num">{usd(0)}</span>, <Money key="b" value={filed} />],
    ["Recovered", <span key="a" className="num">{usd(0)}</span>, <Money key="b" value={recovered} />],
    ["Shortage avoided by Guard", <span key="a" className="num">{usd(0)}</span>, <span key="b" className="num">{usd(guard === "fixed" ? GUARD.claim : 0)}</span>],
  ];

  return (
    <div className="mx-auto flex w-full max-w-[900px] flex-1 flex-col justify-center gap-8 px-4 py-12 pb-40 sm:px-8">
      <Wordmark sub={false} />
      <div>
        <h1 className="text-4xl font-normal sm:text-5xl">That is the loop.</h1>
        <p className="mt-3 max-w-[60ch] text-base text-t2">
          Guard stops a deduction before the truck leaves. Recover wins back the invalid ones, with every claim cited and a person filing. These totals come from what you did in this session.
        </p>
      </div>
      <Card className="overflow-hidden">
        <div className="grid grid-cols-[1.4fr_1fr_1fr] gap-3 px-5 py-3 text-xs text-t3">
          <span />
          <span className="text-right">Before</span>
          <span className="text-right">Now</span>
        </div>
        {rows.map(([k, a, b]) => (
          <div key={k}>
            <Divider />
            <div className="grid grid-cols-[1.4fr_1fr_1fr] items-center gap-3 px-5 py-3.5">
              <span className="text-sm">{k}</span>
              <span className="text-right text-base text-t3">{a}</span>
              <span className="text-right text-xl font-medium">{b}</span>
            </div>
          </div>
        ))}
      </Card>
      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="primary"
          size="lg"
          onClick={() => {
            startTour();
            router.push(STEPS[0].route);
          }}
        >
          Restart
          <ArrowRight size={18} />
        </Button>
        <Button
          size="lg"
          onClick={() => {
            explore();
            router.push("/dashboard");
          }}
        >
          Explore freely
        </Button>
        <a href={FIGMA_URL} target="_blank" rel="noreferrer" className="flex h-12 items-center gap-1.5 px-2 text-sm font-medium underline underline-offset-4">
          View the Figma mockup
          <ArrowSquareOut size={16} />
        </a>
      </div>
    </div>
  );
}
