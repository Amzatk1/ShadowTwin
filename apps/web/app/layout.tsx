import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import type { ReactNode } from "react";

import "@/app/globals.css";

import { RootShell } from "@/components/root-shell";
import { AppProviders } from "@/providers/app-providers";

const heading = Fraunces({
  subsets: ["latin"],
  variable: "--font-heading",
});

const body = Manrope({
  subsets: ["latin"],
  variable: "--font-body",
});

export const metadata: Metadata = {
  title: "ShadowTwin",
  description: "A private operational twin built first for founders and CEOs, but usable by any high-context operator who needs a calm execution layer.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${heading.variable} ${body.variable} bg-canvas font-body text-ink`}>
        <AppProviders>
          <RootShell>{children}</RootShell>
        </AppProviders>
      </body>
    </html>
  );
}
