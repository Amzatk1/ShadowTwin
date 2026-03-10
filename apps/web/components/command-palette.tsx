"use client";

import { Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import { cn } from "@/lib/utils";

const commands = [
  "Open Today",
  "Review pending approvals",
  "View privacy scopes",
  "Search memory for Daniel Moss",
  "Open workflow suggestions",
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setOpen((current) => !current);
      }
      if (event.key === "Escape") {
        setOpen(false);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const commandItems = useMemo(
    () =>
      commands.map((command) => (
        <button
          className="flex w-full items-center justify-between rounded-2xl border border-transparent px-4 py-3 text-left text-sm text-ink-muted transition hover:border-line hover:bg-surface-muted hover:text-ink"
          key={command}
          type="button"
        >
          <span>{command}</span>
          <span className="text-xs uppercase tracking-[0.18em] text-ink-muted/60">
            Enter
          </span>
        </button>
      )),
    [],
  );

  return (
    <>
      <button
        className="inline-flex items-center gap-2 rounded-full border border-line bg-surface px-4 py-2 text-sm text-ink-muted shadow-card transition hover:text-ink"
        onClick={() => setOpen(true)}
        type="button"
      >
        <Search size={16} />
        Command
        <span className="rounded-full border border-line px-2 py-0.5 text-xs">
          Cmd/Ctrl K
        </span>
      </button>
      <div
        aria-hidden={!open}
        className={cn(
          "fixed inset-0 z-50 flex items-start justify-center bg-black/30 px-4 pt-24 transition",
          open ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
      >
        <div className="w-full max-w-2xl rounded-[32px] border border-line bg-surface p-5 shadow-panel">
          <div className="mb-3 flex items-center gap-3 rounded-2xl border border-line bg-canvas px-4 py-3 text-sm text-ink-muted">
            <Search size={16} />
            Search commands, memory, approvals, and people
          </div>
          <div className="space-y-2">{commandItems}</div>
        </div>
      </div>
    </>
  );
}
