export const appConfig = {
  web: {
    apiBaseUrl: process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1",
  },
  mobile: {
    apiBaseUrl: process.env.EXPO_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1",
  },
  featureFlags: {
    approvalAutomations: process.env.FEATURE_APPROVAL_AUTOMATIONS !== "false",
    delegateMode: process.env.FEATURE_DELEGATE_MODE === "true",
  },
} as const;

