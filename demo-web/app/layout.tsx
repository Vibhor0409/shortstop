import type { Metadata, Viewport } from "next";
import "@fontsource-variable/geist";
import "@fontsource-variable/geist-mono";
import "./tokens.css";
import "./globals.css";
import { DemoBar, GuideCard, HydrateGate, Toaster } from "@/components/Chrome";

export const metadata: Metadata = {
  title: "Shortstop · working demo",
  description: "Stop deductions before they ship. Recover the ones that slipped through.",
};
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="flex min-h-dvh flex-col">
        <DemoBar />
        <HydrateGate>{children}</HydrateGate>
        <GuideCard />
        <Toaster />
      </body>
    </html>
  );
}
