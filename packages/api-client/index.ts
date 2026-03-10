import type {
  ActionItem,
  ApprovalRequest,
  MeetingBrief,
  PrivacyControl,
  TodayMetric,
  TwinInsight,
  TwinObservation,
  WorkflowSuggestion,
} from "@shadowtwin/shared-types";

export type ApiClientOptions = {
  baseUrl: string;
  getAccessToken?: () => Promise<string | null> | string | null;
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
  controls: PrivacyControl[];
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

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  workspaceSlug: string;
  user: {
    email: string;
    fullName: string;
  };
};

export type AutomationsResponse = {
  suggestions: WorkflowSuggestion[];
};

async function request<T>(
  path: string,
  init: RequestInit,
  options: ApiClientOptions,
): Promise<T> {
  const token = options.getAccessToken ? await options.getAccessToken() : null;
  const response = await fetch(`${options.baseUrl}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Token ${token}` } : {}),
      ...(init.headers ?? {}),
    },
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`API ${response.status}: ${body}`);
  }

  return (await response.json()) as T;
}

export function createApiClient(options: ApiClientOptions) {
  return {
    auth: {
      login(email: string, password: string) {
        return request<LoginResponse>(
          "/auth/login/",
          {
            method: "POST",
            body: JSON.stringify({ email, password }),
          },
          options,
        );
      },
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
      return request<PrivacyResponse>(`/privacy/${workspaceSlug}/`, { method: "GET" }, options);
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
