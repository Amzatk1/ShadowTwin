"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

import { Button, Panel } from "@/components/ui";
import { LoginPanel } from "@/features/auth/login-panel";
import { apiClient } from "@/lib/api";
import { useSessionStore } from "@/stores/session-store";

export function GoogleCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const hasStarted = useRef(false);
  const { accessToken, workspaceSlug, hasHydrated } = useSessionStore((state) => ({
    accessToken: state.accessToken,
    workspaceSlug: state.workspaceSlug,
    hasHydrated: state.hasHydrated,
  }));
  const code = searchParams.get("code");
  const state = searchParams.get("state");

  const callbackMutation = useMutation({
    mutationFn: () => apiClient.completeGoogleCallback({ code: code ?? "", state: state ?? "" }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["integrations", workspaceSlug] }),
        queryClient.invalidateQueries({ queryKey: ["today", workspaceSlug] }),
        queryClient.invalidateQueries({ queryKey: ["feed", workspaceSlug] }),
        queryClient.invalidateQueries({ queryKey: ["email-threads", workspaceSlug] }),
        queryClient.invalidateQueries({ queryKey: ["meetings-workspace", workspaceSlug] }),
        queryClient.invalidateQueries({ queryKey: ["privacy", workspaceSlug] }),
        queryClient.invalidateQueries({ queryKey: ["audit", workspaceSlug] }),
      ]);
      router.replace("/workspace/integrations?connected=google");
    },
  });

  useEffect(() => {
    if (!hasHydrated || !accessToken || !workspaceSlug || !code || !state || hasStarted.current) {
      return;
    }
    hasStarted.current = true;
    callbackMutation.mutate();
  }, [accessToken, callbackMutation, code, hasHydrated, state, workspaceSlug]);

  if (!hasHydrated) {
    return (
      <Panel
        title="Finishing Google connection"
        description="ShadowTwin is restoring your workspace session before it completes the first live sync."
        tone="accent"
      >
        <div className="flex items-center gap-3 text-sm text-ink-muted">
          <Loader2 className="animate-spin" size={16} />
          Restoring session...
        </div>
      </Panel>
    );
  }

  if (!accessToken || !workspaceSlug) {
    return <LoginPanel />;
  }

  if (!code || !state) {
    return (
      <Panel
        title="Google callback is missing details"
        description="The consent flow returned without the code or state that ShadowTwin needs to finish the connection."
      >
        <Button href="/workspace/integrations" variant="secondary">
          Return to integrations
        </Button>
      </Panel>
    );
  }

  return (
    <Panel
      title="Finishing Google connection"
      description="ShadowTwin is exchanging the Google consent code, storing tokens securely, and starting the first mailbox and calendar sync."
      tone="accent"
    >
      {callbackMutation.isError ? (
        <div className="space-y-4">
          <div className="rounded-2xl border border-line bg-canvas px-4 py-3 text-sm text-ink-muted">
            {callbackMutation.error instanceof Error
              ? callbackMutation.error.message
              : "Unable to complete the Google callback."}
          </div>
          <Button href="/workspace/integrations" variant="secondary">
            Return to integrations
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-3 text-sm text-ink-muted">
          <Loader2 className="animate-spin" size={16} />
          Completing account connection and triggering the first sync...
        </div>
      )}
    </Panel>
  );
}
