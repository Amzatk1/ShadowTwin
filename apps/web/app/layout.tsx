import type { Metadata } from "next";
import { Fraunces, Manrope } from "next/font/google";
import type { ReactNode } from "react";

import "@/app/globals.css";

import { RootShell } from "@/components/root-shell";

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
  description: "A private operational twin for founders, operators, and high-performance teams.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${heading.variable} ${body.variable} bg-canvas font-body text-ink`}>
        <RootShell>{children}</RootShell>
      </body>
    </html>
  );
}
