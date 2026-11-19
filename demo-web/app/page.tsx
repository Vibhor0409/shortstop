"use client";

import { ArrowRight, ArrowSquareOut, ShieldCheck, ArrowUUpLeft } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { Wordmark } from "@/components/Shell";
import { Button, Card } from "@/components/ui";
import { BRAND, INVOICED, SEED_DEDUCTIONS, sum, usd } from "@/lib/data";
import { useStore } from "@/lib/store";
import { FIGMA_URL, STEPS } from "@/lib/tour";

export default function Start() {
  const router = useRouter();
  const startTour = useStore((s) => s.startTour);
  const explore = useStore((s) => s.explore);
  const short = sum(SEED_DEDUCTIONS.map((d) => d.amount));

  return (
    <div className="mx-auto flex w-full max-w-[1100px] flex-1 flex-col justify-center gap-10 px-4 py-12 sm:px-8">
      <Wordmark sub={false} />
      <div className="flex flex-col gap-5">
        <h1 className="max-w-[18ch] text-4xl font-normal sm:text-5xl sm:leading-[1.05] lg:text-6xl lg:leading-none">
          Stop deductions before they ship. Recover the ones that slipped through.
        </h1>
        <p className="max-w-[62ch] text-base text-t2">
          Retailers short pay invoices. In this demo, {BRAND} invoiced {usd(INVOICED)} in October and {usd(short)} never arrived, across {SEED_DEDUCTIONS.length} deductions. Walk
          through how Shortstop prevents one and wins one back, with a person approving every filing.
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button
          variant="primary"
          size="lg"
          onClick={() => {
            startTour();
            router.push(STEPS[0].route);
          }}
        >
          Start guided tour
          <ArrowRight size={18} />
        </Button>
        <Button
          variant="secondary"
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
      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="flex gap-4 p-5">
          <ShieldCheck size={24} className="shrink-0" />
          <div>
            <div className="text-base font-medium">Guard</div>
            <p className="mt-1 text-sm text-t2">Checks every shipment against its PO before the truck leaves, so the paperwork cannot cause a claim.</p>
          </div>
        </Card>
        <Card className="flex gap-4 p-5">
          <ArrowUUpLeft size={24} className="shrink-0" />
          <div>
            <div className="text-base font-medium">Recover</div>
            <p className="mt-1 text-sm text-t2">Ranks the queue, matches the evidence, drafts the dispute and tracks it until the cash is in the ledger.</p>
          </div>
        </Card>
      </div>
      <p className="text-xs text-t3">About {STEPS.length} short steps. All data is fixed sample data. Nothing is sent to any retailer.</p>
    </div>
  );
}
