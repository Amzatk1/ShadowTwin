import { createApiClient } from "@shadowtwin/api-client";
import { appConfig } from "@shadowtwin/config";

import { useSessionStore } from "@/stores/session-store";

export const apiClient = createApiClient({
  baseUrl: appConfig.web.apiBaseUrl,
  getAccessToken: () => useSessionStore.getState().accessToken,
  getRefreshToken: () => useSessionStore.getState().refreshToken,
  onAuthTokens: (payload) => {
    useSessionStore.getState().applyAuthPayload(payload);
  },
});
