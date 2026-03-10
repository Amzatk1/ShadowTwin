"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { SiteFooter, SiteHeader } from "@/components/site";

export function RootShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isWorkspace = pathname.startsWith("/workspace");

  if (isWorkspace) {
    return <>{children}</>;
  }

  return (
    <>
      <SiteHeader />
      {children}
      <SiteFooter />
    </>
  );
}

