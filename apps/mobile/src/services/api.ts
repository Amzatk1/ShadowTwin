import { createApiClient } from "@shadowtwin/api-client";
import { appConfig } from "@shadowtwin/config";

import { useSessionStore } from "../store/useSessionStore";

export const apiClient = createApiClient({
  baseUrl: appConfig.mobile.apiBaseUrl,
  getAccessToken: () => useSessionStore.getState().accessToken,
  getRefreshToken: () => useSessionStore.getState().refreshToken,
  onAuthTokens: async (payload) => {
    await useSessionStore.getState().applyAuthPayload(payload);
  },
});
