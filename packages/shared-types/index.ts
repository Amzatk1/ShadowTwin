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

export interface TwinOverview {
  operatorRole: string;
  stage: TwinStage;
  minimalModeEnabled: boolean;
  confidenceScore: number;
  prioritiesSummary: string;
  goals: string[];
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
  riskLevel: "high" | "medium" | "low";
  sourceRefs: string[];
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
  payloadKind?: string;
  sourceCount?: number;
}

export interface NotificationEvent {
  id: string;
  category: string;
  title: string;
  body: string;
  channel: "push" | "email" | "in-app";
  createdAt: string;
  status?: string;
  actionUrl?: string;
}

export interface TodayDashboard {
  twinOverview: TwinOverview;
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

export interface IntegrationCapabilities {
  emailRead: boolean;
  calendarRead: boolean;
  emailSend: boolean;
  calendarWrite: boolean;
  messagingSend: boolean;
  demoMode: boolean;
}

export interface IntegrationSyncCursor {
  gmailHistoryId?: string;
  calendarSyncToken?: string;
}

export interface IntegrationSyncState {
  lastSyncMode?: string;
  syncedThreadCount?: number;
  syncedMeetingCount?: number;
  gmailSyncMode?: string;
  gmailRecoveryPerformed?: boolean;
  gmailSyncedThreadCount?: number;
  gmailLastSyncAt?: string;
  calendarSyncMode?: string;
  calendarRecoveryPerformed?: boolean;
  calendarSyncedMeetingCount?: number;
  calendarLastSyncAt?: string;
}

export interface IntegrationConnection {
  id: string;
  provider: string;
  displayName: string;
  accountLabel: string;
  providerEmail: string;
  mode: "read-only" | "approval-required" | "action-enabled";
  status: string;
  syncHealthState:
    | "idle"
    | "syncing"
    | "healthy"
    | "degraded"
    | "needs_reconnect"
    | "recovering"
    | "failed";
  grantedScopes: string[];
  requiresReauth: boolean;
  lastSyncError: string | null;
  lastSyncStatus: string;
  lastSyncStartedAt: string | null;
  lastSyncCompletedAt: string | null;
  lastSyncErrorCode: string;
  syncMode: string;
  syncCursor: IntegrationSyncCursor;
  capabilities: IntegrationCapabilities;
  syncState: IntegrationSyncState;
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

export interface MemoryRecord {
  id: string;
  itemType: string;
  sourceLabel: string;
  title: string;
  summary: string;
  content: string;
  learnEnabled: boolean;
  hidden: boolean;
  createdAt: string;
}

export interface EmailThreadRecord {
  id: string;
  subject: string;
  participants: string[];
  waitingOn: string;
  needsReply: boolean;
  isSensitive: boolean;
  summary: string;
  status: string;
  sourceUrl: string;
  lastMessageAt: string | null;
  messageCount: number;
  extractedCommitments: string[];
}

export interface MeetingRecord {
  id: string;
  title: string;
  startTime: string;
  endTime: string | null;
  participants: string[];
  priority: "high" | "medium" | "low";
  summary: string;
  extractedActions: string[];
}

export interface OnboardingProfile {
  workspaceSlug: string;
  operatorRole: string;
  goals: string[];
  minimalModeEnabled: boolean;
  stage: TwinStage;
  completedAt: string | null;
}
