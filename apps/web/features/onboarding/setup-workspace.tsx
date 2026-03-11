"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Check, Loader2, Orbit, ShieldCheck } from "lucide-react";
import { useMemo, useState } from "react";

import { Badge, Button, Panel } from "@/components/ui";
import { LoginPanel } from "@/features/auth/login-panel";
import { GoogleConnectPanel } from "@/features/integrations/google-connect-panel";
import { apiClient } from "@/lib/api";
import { useSessionStore } from "@/stores/session-store";

const roles = [
  {
    id: "founder",
    title: "Founder / CEO",
    copy: "Optimized for fundraising, recruiting, customer follow-up, and high-context decision load.",
  },
  {
    id: "chief-of-staff",
    title: "Chief of Staff / Operator",
    copy: "Designed for cross-functional coordination, follow-up hygiene, and keeping the principal informed.",
  },
  {
    id: "recruiter",
    title: "Recruiter / Talent Lead",
    copy: "Useful for candidate communication, interview debriefs, and consistent follow-up timing.",
  },
  {
    id: "sales-lead",
    title: "Sales / Revenue Lead",
    copy: "Useful for pipeline follow-up, meeting recap discipline, and relationship context.",
  },
];

const goalOptions = [
  "Reduce follow-up drops",
  "Prepare for meetings faster",
  "Manage inbox better",
  "Build a stronger memory layer",
  "Spot repeatable workflows",
];

export function SetupWorkspace() {
  const queryClient = useQueryClient();
  const { accessToken, workspaceSlug, hasHydrated } = useSessionStore((state) => ({
    accessToken: state.accessToken,
    workspaceSlug: state.workspaceSlug,
    hasHydrated: state.hasHydrated,
  }));

  const onboardingQuery = useQuery({
    queryKey: ["onboarding", workspaceSlug],
    queryFn: () => apiClient.onboarding(workspaceSlug!),
    enabled: Boolean(accessToken && workspaceSlug),
  });

  const [selectedRole, setSelectedRole] = useState("founder");
  const [selectedGoals, setSelectedGoals] = useState<string[]>([
    "Reduce follow-up drops",
    "Prepare for meetings faster",
  ]);
  const [minimalModeEnabled, setMinimalModeEnabled] = useState(true);

  const onboardingMutation = useMutation({
    mutationFn: () =>
      apiClient.updateOnboarding({
        workspaceSlug: workspaceSlug!,
        operatorRole: selectedRole,
        goals: selectedGoals,
        minimalModeEnabled,
        stage: minimalModeEnabled ? "observe" : "suggest",
      }),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["onboarding", workspaceSlug] }),
        queryClient.invalidateQueries({ queryKey: ["today", workspaceSlug] }),
      ]);
    },
  });

  const hydratedProfile = useMemo(() => onboardingQuery.data, [onboardingQuery.data]);

  if (!hasHydrated) {
    return <div className="rounded-[28px] border border-line bg-surface p-6 text-sm text-ink-muted">Loading setup...</div>;
  }

  if (!accessToken || !workspaceSlug) {
    return <LoginPanel />;
  }

  if (onboardingQuery.isLoading && !hydratedProfile) {
    return <div className="rounded-[28px] border border-line bg-surface p-6 text-sm text-ink-muted">Loading setup...</div>;
  }

  const isCompleted = Boolean(hydratedProfile?.completedAt);

  function toggleGoal(goal: string) {
    setSelectedGoals((current) =>
      current.includes(goal) ? current.filter((item) => item !== goal) : [...current, goal],
    );
  }

  return (
    <div className="space-y-6">
      <Panel
        title="Workspace setup"
        description="ShadowTwin is founder-first, but it should still fit any high-context operator. This setup decides what it should optimize for before any source is connected."
        tone="accent"
      >
        <div className="flex flex-wrap items-center gap-3 text-sm text-ink-muted">
          <Orbit size={16} className="text-accent" />
          Start in minimal mode if you want the twin to observe and explain before it suggests aggressively.
          {isCompleted ? <Badge tone="success">Setup saved</Badge> : null}
        </div>
      </Panel>

      <Panel title="Who is this twin for?" description="Choose the primary operating context. Founders remain the sharpest default, but the model should still work for other users.">
        <div className="grid gap-4 md:grid-cols-2">
          {roles.map((role) => (
            <button
              className="rounded-2xl border border-line bg-canvas p-4 text-left transition hover:bg-surface"
              key={role.id}
              onClick={() => setSelectedRole(role.id)}
              type="button"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="font-medium text-ink">{role.title}</div>
                {selectedRole === role.id ? <Check size={16} className="text-accent" /> : null}
              </div>
              <div className="mt-2 text-sm leading-6 text-ink-muted">{role.copy}</div>
            </button>
          ))}
        </div>
      </Panel>

      <Panel title="What should it optimize first?" description="These goals shape the early Today ranking, follow-up signals, and meeting brief emphasis.">
        <div className="grid gap-3 md:grid-cols-2">
          {goalOptions.map((goal) => (
            <button
              className="rounded-2xl border border-line bg-canvas p-4 text-left transition hover:bg-surface"
              key={goal}
              onClick={() => toggleGoal(goal)}
              type="button"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="font-medium text-ink">{goal}</div>
                {selectedGoals.includes(goal) ? <Check size={16} className="text-accent" /> : null}
              </div>
            </button>
          ))}
        </div>
      </Panel>

      <Panel title="Trust posture" description="Minimal mode keeps the twin in observe-first posture. You can move to suggest mode later without changing providers.">
        <button
          className="flex w-full items-center justify-between rounded-2xl border border-line bg-canvas p-4 text-left transition hover:bg-surface"
          onClick={() => setMinimalModeEnabled((current) => !current)}
          type="button"
        >
          <div>
            <div className="font-medium text-ink">Minimal mode</div>
            <div className="mt-2 text-sm leading-6 text-ink-muted">
              {minimalModeEnabled
                ? "Observe first, keep privacy posture conservative, and explain recommendations before building a larger queue."
                : "Allow the twin to enter suggest mode immediately after connect and surface a fuller Today feed."}
            </div>
          </div>
          <div className="flex items-center gap-2 text-sm text-ink-muted">
            <ShieldCheck size={16} className="text-accent" />
            {minimalModeEnabled ? "Enabled" : "Disabled"}
          </div>
        </button>
      </Panel>

      <div className="flex flex-wrap gap-3">
        <Button disabled={onboardingMutation.isPending} onClick={() => onboardingMutation.mutate()}>
          {onboardingMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : null}
          Save setup
        </Button>
      </div>

      {hydratedProfile?.completedAt ? <GoogleConnectPanel workspaceSlug={workspaceSlug} /> : null}
    </div>
  );
}
