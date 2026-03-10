"use client";

import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

type SessionUser = {
  email: string;
  fullName: string;
};

type SessionState = {
  accessToken: string | null;
  refreshToken: string | null;
  workspaceSlug: string | null;
  user: SessionUser | null;
  hasHydrated: boolean;
  setSession: (payload: {
    accessToken: string;
    refreshToken: string;
    workspaceSlug: string;
    user: SessionUser;
  }) => void;
  clearSession: () => void;
  markHydrated: () => void;
};

export const useSessionStore = create<SessionState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      workspaceSlug: null,
      user: null,
      hasHydrated: false,
      setSession: (payload) => set(payload),
      clearSession: () =>
        set({
          accessToken: null,
          refreshToken: null,
          workspaceSlug: null,
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

