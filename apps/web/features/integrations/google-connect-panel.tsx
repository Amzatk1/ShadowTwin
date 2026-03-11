"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Check, Loader2, Mail, ShieldCheck } from "lucide-react";
import { useState } from "react";

import { Button, Panel } from "@/components/ui";
import { apiClient } from "@/lib/api";

const defaultScopes = [
  {
    sourcePath: "gmail://label/Inbox",
    label: "Gmail inbox",
    copy: "Read threads, commitments, and reply risk from the working inbox.",
  },
  {
    sourcePath: "gmail://label/Board",
    label: "Board and investor label",
    copy: "Keep board and investor threads visible but excluded from learning by default.",
  },
  {
    sourcePath: "calendar://primary",
    label: "Primary calendar",
    copy: "Generate meeting briefs and follow-up timing signals from scheduled events.",
  },
];

export function GoogleConnectPanel({
  workspaceSlug,
}: {
  workspaceSlug: string;
}) {
  const queryClient = useQueryClient();
  const [selectedScopes, setSelectedScopes] = useState<string[]>(
    defaultScopes.map((scope) => scope.sourcePath),
  );
  const [statusCopy, setStatusCopy] = useState<string | null>(null);

  const connectMutation = useMutation({
    mutationFn: () =>
      apiClient.connectGoogle({
        workspaceSlug,
        mode: "read-only",
        selectedScopes,
      }),
    onSuccess: async (payload) => {
      if (payload.authUrl) {
        window.location.assign(payload.authUrl);
        return;
      }
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["integrations", workspaceSlug] }),
        queryClient.invalidateQueries({ queryKey: ["today", workspaceSlug] }),
        queryClient.invalidateQueries({ queryKey: ["feed", workspaceSlug] }),
        queryClient.invalidateQueries({ queryKey: ["email-threads", workspaceSlug] }),
        queryClient.invalidateQueries({ queryKey: ["meetings-workspace", workspaceSlug] }),
        queryClient.invalidateQueries({ queryKey: ["notifications", workspaceSlug] }),
        queryClient.invalidateQueries({ queryKey: ["privacy", workspaceSlug] }),
        queryClient.invalidateQueries({ queryKey: ["audit", workspaceSlug] }),
      ]);
      setStatusCopy(
        payload.demoMode
          ? "Google OAuth is not configured in this environment yet, so ShadowTwin connected the local demo workspace to keep the observe/suggest loop usable."
          : "Google consent started. Finish account approval in the opened window to begin the first live sync.",
      );
    },
  });

  function toggleScope(scopePath: string) {
    setSelectedScopes((current) =>
      current.includes(scopePath)
        ? current.filter((item) => item !== scopePath)
        : [...current, scopePath],
    );
  }

  return (
    <Panel
      title="Connect Google in read-only mode"
      description="This first milestone is observe and suggest only. ShadowTwin reads selected Gmail and Calendar sources, explains why it surfaces something, and never sends anything."
      tone="accent"
    >
      <div className="grid gap-3">
        {defaultScopes.map((scope) => {
          const active = selectedScopes.includes(scope.sourcePath);
          return (
            <button
              className="rounded-2xl border border-line bg-surface p-4 text-left transition hover:bg-canvas"
              key={scope.sourcePath}
              onClick={() => toggleScope(scope.sourcePath)}
              type="button"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-medium text-ink">{scope.label}</div>
                  <div className="mt-1 text-sm leading-6 text-ink-muted">{scope.copy}</div>
                </div>
                <div className="rounded-full border border-line bg-canvas p-2 text-accent">
                  {active ? <Check size={16} /> : <Mail size={16} />}
                </div>
              </div>
            </button>
          );
        })}
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-3 text-sm text-ink-muted">
        <ShieldCheck size={16} className="text-accent" />
        Board and investor label stays connected in read-only mode and starts with learning excluded.
      </div>
      <div className="mt-5 flex flex-wrap gap-3">
        <Button onClick={() => connectMutation.mutate()}>
          {connectMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : null}
          Connect Google
        </Button>
      </div>
      {statusCopy ? (
        <div className="mt-4 rounded-2xl border border-line bg-canvas px-4 py-3 text-sm text-ink-muted">
          {statusCopy}
        </div>
      ) : null}
      {connectMutation.isError ? (
        <div className="mt-4 rounded-2xl border border-line bg-canvas px-4 py-3 text-sm text-ink-muted">
          {connectMutation.error instanceof Error
            ? connectMutation.error.message
            : "Unable to start the Google connection flow."}
        </div>
      ) : null}
    </Panel>
  );
}
