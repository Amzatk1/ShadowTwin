export type TwinStage = "observe" | "suggest" | "assist" | "delegate";

export interface UserProfile {
  id: string;
  name: string;
  role: string;
  workspaceId: string;
  workspace?: WorkspaceProfile;
}

export interface TodayMetric {
  label: string;
  value: string;
  delta: string;
}

export interface WorkspaceProfile {
  id: string;
  name: string;
  slug: string;
  stage: TwinStage;
}

export interface TwinInsight {
  id: string;
  title: string;
  detail: string;
  confidence: number;
  rationale: string;
  createdAt: string;
}

export interface ActionItem {
  id: string;
  title: string;
  description: string;
  status: "approval" | "attention" | "ready";
  source: string;
  dueLabel: string;
}

export interface MeetingBrief {
  id: string;
  title: string;
  startTime: string;
  participants: string[];
  priority: "high" | "medium" | "low";
  summary: string;
}

export interface TwinObservation {
  id: string;
  kind: "observation" | "suggestion" | "pattern" | "warning";
  title: string;
  detail: string;
  confidence: number;
  why: string;
  createdAt: string;
}

export interface WorkflowSuggestion {
  id: string;
  title: string;
  trigger: string;
  actions: string[];
  confidence: number;
}

export interface PrivacyControl {
  id: string;
  name: string;
  scope: string;
  mode: "read-only" | "approval-required" | "action-enabled";
  retention: string;
}

export interface ApprovalRequest {
  id: string;
  proposedAction: string;
  whySuggested: string;
  confidence: number;
  status: "pending" | "approved" | "rejected" | "snoozed" | "edited";
  sourceLabel: string;
  dueLabel: string;
}

export interface NotificationEvent {
  id: string;
  category: string;
  title: string;
  body: string;
  channel: "push" | "email" | "in-app";
  createdAt: string;
}

export interface TodayDashboard {
  metrics: TodayMetric[];
  priorities: string[];
  actionQueue: ActionItem[];
  meetings: MeetingBrief[];
  insights: TwinInsight[];
}

export interface SessionUser {
  id: string;
  email: string;
  fullName: string;
}

export interface SessionPayload {
  accessToken: string;
  refreshToken: string;
  workspaceSlug: string;
  workspace: WorkspaceProfile;
  user: SessionUser;
}

export interface IntegrationScope {
  id: string;
  sourcePath: string;
  displayName: string;
  sourceType: string;
  mode: "read-only" | "approval-required" | "action-enabled";
  learnEnabled: boolean;
  excluded: boolean;
}

export interface IntegrationConnection {
  id: string;
  provider: string;
  displayName: string;
  accountLabel: string;
  mode: "read-only" | "approval-required" | "action-enabled";
  status: string;
  lastSyncedAt: string | null;
  scopes: IntegrationScope[];
}

export interface PrivacySettings {
  retentionDays: number;
  actionDisabledMode: boolean;
  localFirstEnabled: boolean;
  learningEnabled: boolean;
  approvalMode: string;
}

export interface PrivacySnapshot {
  controls: Array<
    PrivacyControl & {
      learnEnabled: boolean;
      excluded: boolean;
    }
  >;
  settings: PrivacySettings;
}

export interface AuditEventRecord {
  id: string;
  actionType: string;
  objectType: string;
  objectId: string;
  integration: string;
  createdAt: string;
  metadata: Record<string, unknown>;
}
