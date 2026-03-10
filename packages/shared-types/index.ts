export type TwinStage = "observe" | "suggest" | "assist" | "delegate";

export interface UserProfile {
  id: string;
  name: string;
  role: string;
  workspaceId: string;
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

