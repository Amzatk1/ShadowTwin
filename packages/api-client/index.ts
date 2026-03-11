import type {
  ActionItem,
  ApprovalRequest,
  AuditEventRecord,
  IntegrationConnection,
  MeetingBrief,
  PrivacySnapshot,
  SessionPayload,
  TodayMetric,
  UserProfile,
  TwinInsight,
  TwinObservation,
  WorkflowSuggestion,
} from "@shadowtwin/shared-types";

export type ApiClientOptions = {
  baseUrl: string;
  getAccessToken?: () => Promise<string | null> | string | null;
  getRefreshToken?: () => Promise<string | null> | string | null;
  onAuthTokens?: (payload: SessionPayload | null) => Promise<void> | void;
};

export type TodayResponse = {
  metrics: TodayMetric[];
  priorities: string[];
  actionQueue: ActionItem[];
  meetings: MeetingBrief[];
  insights: TwinInsight[];
};

export type FeedResponse = {
  items: TwinObservation[];
};

export type PrivacyResponse = {
  controls: PrivacySnapshot["controls"];
  settings: PrivacySnapshot["settings"];
};

export type ApprovalDecisionRequest = {
  decision: "approve" | "reject" | "snooze" | "edit";
  note?: string;
};

export type ApprovalDecisionResponse = {
  approvalId: string;
  status: "approved" | "rejected" | "snoozed" | "edited";
};

export type ApprovalQueueResponse = {
  items: ApprovalRequest[];
};

export type LoginResponse = SessionPayload;

export type AutomationsResponse = {
  suggestions: WorkflowSuggestion[];
};

export type IntegrationsResponse = {
  items: IntegrationConnection[];
};

export type GoogleConnectRequest = {
  workspaceSlug: string;
  mode?: "read-only" | "approval-required" | "action-enabled";
  selectedScopes?: string[];
};

export type GoogleConnectResponse = {
  integration: IntegrationConnection;
  demoMode?: boolean;
  requiresExternalConsent?: boolean;
};

export type PrivacyUpdateRequest = {
  workspaceSlug: string;
  retentionDays?: number;
  actionDisabledMode?: boolean;
  localFirstEnabled?: boolean;
  learningEnabled?: boolean;
};

export type PrivacyExclusionRequest = {
  workspaceSlug: string;
  connectionId: number;
  sourcePath: string;
  displayName?: string;
};

export type RecommendationStatusResponse = {
  id: string;
  status: string;
};

export type AuditResponse = {
  items: AuditEventRecord[];
};

async function request<T>(
  path: string,
  init: RequestInit,
  options: ApiClientOptions,
  retryOnUnauthorized = true,
): Promise<T> {
  const token = options.getAccessToken ? await options.getAccessToken() : null;
  const response = await fetch(`${options.baseUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init.headers ?? {}),
    },
  });

  if (response.status === 401 && retryOnUnauthorized && options.getRefreshToken && options.onAuthTokens) {
    const refreshToken = await options.getRefreshToken();
    if (refreshToken) {
      const refreshResponse = await fetch(`${options.baseUrl}/auth/refresh/`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ refreshToken }),
      });
      if (refreshResponse.ok) {
        const payload = (await refreshResponse.json()) as SessionPayload;
        await options.onAuthTokens(payload);
        return request<T>(path, init, options, false);
      }
      await options.onAuthTokens(null);
    }
  }

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`API ${response.status}: ${body}`);
  }

  return (await response.json()) as T;
}

export function createApiClient(options: ApiClientOptions) {
  return {
    auth: {
      token(email: string, password: string) {
        return request<LoginResponse>(
          "/auth/token/",
          {
            method: "POST",
            body: JSON.stringify({ email, password }),
          },
          options,
        );
      },
      login(email: string, password: string) {
        return this.token(email, password);
      },
      refresh(refreshToken: string) {
        return request<LoginResponse>(
          "/auth/refresh/",
          {
            method: "POST",
            body: JSON.stringify({ refreshToken }),
          },
          options,
          false,
        );
      },
      logout(refreshToken?: string) {
        return request<void>(
          "/auth/logout/",
          {
            method: "POST",
            body: JSON.stringify({ refreshToken }),
          },
          options,
          false,
        );
      },
    },
    me() {
      return request<UserProfile>("/auth/me/", { method: "GET" }, options);
    },
    today(workspaceSlug: string) {
      return request<TodayResponse>(`/today/${workspaceSlug}/`, { method: "GET" }, options);
    },
    feed(workspaceSlug: string) {
      return request<FeedResponse>(`/feed/${workspaceSlug}/`, { method: "GET" }, options);
    },
    approvals(workspaceSlug: string) {
      return request<ApprovalQueueResponse>(`/approvals/${workspaceSlug}/`, { method: "GET" }, options);
    },
    privacy(workspaceSlug: string) {
      return request<PrivacyResponse>(`/privacy/?workspaceSlug=${workspaceSlug}`, { method: "GET" }, options);
    },
    updatePrivacy(payload: PrivacyUpdateRequest) {
      return request<PrivacyResponse>(
        "/privacy/",
        {
          method: "PATCH",
          body: JSON.stringify(payload),
        },
        options,
      );
    },
    addPrivacyExclusion(payload: PrivacyExclusionRequest) {
      return request<PrivacyResponse>(
        "/privacy/exclusions/",
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
        options,
      );
    },
    integrations(workspaceSlug: string) {
      return request<IntegrationsResponse>(
        `/integrations/?workspaceSlug=${workspaceSlug}`,
        { method: "GET" },
        options,
      );
    },
    connectGoogle(payload: GoogleConnectRequest) {
      return request<GoogleConnectResponse>(
        "/integrations/google/connect/",
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
        options,
      );
    },
    updateIntegrationMode(connectionId: string, mode: GoogleConnectRequest["mode"]) {
      return request<GoogleConnectResponse>(
        `/integrations/${connectionId}/mode/`,
        {
          method: "PATCH",
          body: JSON.stringify({ mode }),
        },
        options,
      );
    },
    updateIntegrationScopes(connectionId: string, scopes: Array<{ id: string; mode?: string; learnEnabled?: boolean; excluded?: boolean }>) {
      return request<GoogleConnectResponse>(
        `/integrations/${connectionId}/scopes/`,
        {
          method: "PATCH",
          body: JSON.stringify(scopes),
        },
        options,
      );
    },
    audit(workspaceSlug: string) {
      return request<AuditResponse>(`/audit/?workspaceSlug=${workspaceSlug}`, { method: "GET" }, options);
    },
    dismissRecommendation(recommendationId: string) {
      return request<RecommendationStatusResponse>(
        `/feed/${recommendationId}/dismiss/`,
        { method: "POST" },
        options,
      );
    },
    pinRecommendation(recommendationId: string) {
      return request<RecommendationStatusResponse>(
        `/feed/${recommendationId}/pin/`,
        { method: "POST" },
        options,
      );
    },
    hideMemory(memoryId: string) {
      return request<{ id: string; hidden: boolean }>(
        `/memory/${memoryId}/hide/`,
        { method: "POST" },
        options,
      );
    },
    excludeMemoryLearning(memoryId: string) {
      return request<{ id: string; learnEnabled: boolean }>(
        `/memory/${memoryId}/exclude-learning/`,
        { method: "POST" },
        options,
      );
    },
    automations(workspaceSlug: string) {
      return request<AutomationsResponse>(`/automations/${workspaceSlug}/`, { method: "GET" }, options);
    },
    decideApproval(approvalId: string, payload: ApprovalDecisionRequest) {
      return request<ApprovalDecisionResponse>(
        `/approvals/requests/${approvalId}/decision/`,
        {
          method: "POST",
          body: JSON.stringify(payload),
        },
        options,
      );
    },
  };
}
