"use client";

import { useParams } from "next/navigation";
import { AmazonDetail, GenericDetail } from "@/components/Detail";
import { LinkButton } from "@/components/ui";
import { AMAZON_ID } from "@/lib/data";
import { useStore } from "@/lib/store";

export default function DeductionPage() {
  const { id } = useParams<{ id: string }>();
  const d = useStore((s) => s.deductions.find((x) => x.id === id));
  if (!d)
    return (
      <div className="flex flex-col items-start gap-4 p-8">
        <h1 className="text-2xl">Deduction not found</h1>
        <LinkButton href="/recover">Back to the queue</LinkButton>
      </div>
    );
  return d.id === AMAZON_ID ? <AmazonDetail d={d} /> : <GenericDetail key={d.id} d={d} />;
}
