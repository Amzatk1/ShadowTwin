"use client";

import { useMutation } from "@tanstack/react-query";
import { Loader2, Lock } from "lucide-react";
import { useState } from "react";

import { apiClient } from "@/lib/api";
import { Badge, Panel } from "@/components/ui";
import { useSessionStore } from "@/stores/session-store";

export function LoginPanel() {
  const setSession = useSessionStore((state) => state.setSession);
  const [email, setEmail] = useState("ayo@shadowtwin.demo");
  const [password, setPassword] = useState("shadowtwin123");

  const loginMutation = useMutation({
    mutationFn: async () => apiClient.auth.login(email, password),
    onSuccess: (payload) => {
      setSession({
        accessToken: payload.accessToken,
        refreshToken: payload.refreshToken,
        workspaceSlug: payload.workspaceSlug,
        user: {
          email: payload.user.email,
          fullName: payload.user.fullName,
        },
      });
    },
  });

  return (
    <div className="mx-auto max-w-xl">
      <Panel
        title="Sign in to the workspace"
        description="This milestone uses a seeded founder demo so the real Today and approval flow can run end to end."
        tone="accent"
      >
        <div className="mb-4 flex items-center gap-3 rounded-2xl border border-line bg-surface px-4 py-3 text-sm text-ink-muted">
          <Lock size={16} className="text-accent" />
          Demo credentials are prefilled from the seed command.
        </div>
        <div className="grid gap-4">
          <label className="grid gap-2 text-sm text-ink-muted">
            Email
            <input
              className="rounded-2xl border border-line bg-canvas px-4 py-3 text-ink outline-none ring-0"
              onChange={(event) => setEmail(event.target.value)}
              value={email}
            />
          </label>
          <label className="grid gap-2 text-sm text-ink-muted">
            Password
            <input
              className="rounded-2xl border border-line bg-canvas px-4 py-3 text-ink outline-none ring-0"
              onChange={(event) => setPassword(event.target.value)}
              type="password"
              value={password}
            />
          </label>
          <button
            className="inline-flex items-center justify-center gap-2 rounded-full bg-ink px-4 py-3 text-sm font-semibold text-white transition hover:bg-black/90 disabled:opacity-60"
            disabled={loginMutation.isPending}
            onClick={() => loginMutation.mutate()}
            type="button"
          >
            {loginMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : null}
            Continue
          </button>
          {loginMutation.isError ? (
            <Badge>{loginMutation.error instanceof Error ? loginMutation.error.message : "Unable to sign in"}</Badge>
          ) : null}
        </div>
      </Panel>
    </div>
  );
}

