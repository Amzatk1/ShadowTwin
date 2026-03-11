import type { SessionPayload } from "@shadowtwin/shared-types";
import * as SecureStore from "expo-secure-store";
import { create } from "zustand";

const STORAGE_KEY = "shadowtwin-mobile-session";

type SessionState = {
  accessToken: string | null;
  refreshToken: string | null;
  workspaceSlug: string | null;
  workspace: SessionPayload["workspace"] | null;
  user: SessionPayload["user"] | null;
  hasHydrated: boolean;
  hydrateSession: () => Promise<void>;
  setSession: (payload: SessionPayload) => Promise<void>;
  applyAuthPayload: (payload: SessionPayload | null) => Promise<void>;
  clearSession: () => Promise<void>;
};

async function persistSession(payload: SessionPayload | null) {
  if (!payload) {
    await SecureStore.deleteItemAsync(STORAGE_KEY);
    return;
  }
  await SecureStore.setItemAsync(STORAGE_KEY, JSON.stringify(payload));
}

export const useSessionStore = create<SessionState>((set) => ({
  accessToken: null,
  refreshToken: null,
  workspaceSlug: null,
  workspace: null,
  user: null,
  hasHydrated: false,
  hydrateSession: async () => {
    const stored = await SecureStore.getItemAsync(STORAGE_KEY);
    if (stored) {
      const payload = JSON.parse(stored) as SessionPayload;
      set({
        accessToken: payload.accessToken,
        refreshToken: payload.refreshToken,
        workspaceSlug: payload.workspaceSlug,
        workspace: payload.workspace,
        user: payload.user,
        hasHydrated: true,
      });
      return;
    }
    set({ hasHydrated: true });
  },
  setSession: async (payload) => {
    await persistSession(payload);
    set({
      accessToken: payload.accessToken,
      refreshToken: payload.refreshToken,
      workspaceSlug: payload.workspaceSlug,
      workspace: payload.workspace,
      user: payload.user,
    });
  },
  applyAuthPayload: async (payload) => {
    await persistSession(payload);
    set(
      payload
        ? {
            accessToken: payload.accessToken,
            refreshToken: payload.refreshToken,
            workspaceSlug: payload.workspaceSlug,
            workspace: payload.workspace,
            user: payload.user,
          }
        : {
            accessToken: null,
            refreshToken: null,
            workspaceSlug: null,
            workspace: null,
            user: null,
          },
    );
  },
  clearSession: async () => {
    await persistSession(null);
    set({
      accessToken: null,
      refreshToken: null,
      workspaceSlug: null,
      workspace: null,
      user: null,
    });
  },
}));
