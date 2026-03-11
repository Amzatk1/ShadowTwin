"use client";

import type { SessionPayload } from "@shadowtwin/shared-types";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type SessionState = {
  accessToken: string | null;
  refreshToken: string | null;
  workspaceSlug: string | null;
  workspace: SessionPayload["workspace"] | null;
  user: SessionPayload["user"] | null;
  hasHydrated: boolean;
  setSession: (payload: SessionPayload) => void;
  applyAuthPayload: (payload: SessionPayload | null) => void;
  clearSession: () => void;
  markHydrated: () => void;
};

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      workspaceSlug: null,
      workspace: null,
      user: null,
      hasHydrated: false,
      setSession: (payload) => set(payload),
      applyAuthPayload: (payload) =>
        set(
          payload
            ? payload
            : {
                accessToken: null,
                refreshToken: null,
                workspaceSlug: null,
                workspace: null,
                user: null,
              },
        ),
      clearSession: () =>
        set({
          accessToken: null,
          refreshToken: null,
          workspaceSlug: null,
          workspace: null,
          user: null,
        }),
      markHydrated: () => set({ hasHydrated: true }),
    }),
    {
      name: "shadowtwin-session",
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        state?.markHydrated();
      },
    },
  ),
);
