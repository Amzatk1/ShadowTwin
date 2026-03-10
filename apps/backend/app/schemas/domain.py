from datetime import datetime
from typing import Literal

from pydantic import BaseModel, Field


class TodayMetric(BaseModel):
    label: str
    value: str
    delta: str


class ActionQueueItem(BaseModel):
    id: str
    title: str
    description: str
    status: Literal["approval", "attention", "ready"]
    source: str
    due_label: str = Field(alias="dueLabel")


class MeetingBrief(BaseModel):
    id: str
    title: str
    start_time: str = Field(alias="startTime")
    participants: list[str]
    priority: Literal["high", "medium", "low"]
    summary: str


class TwinInsight(BaseModel):
    id: str
    title: str
    detail: str
    confidence: float
    rationale: str
    created_at: datetime = Field(alias="createdAt")


class TwinObservation(BaseModel):
    id: str
    kind: Literal["observation", "suggestion", "pattern", "warning"]
    title: str
    detail: str
    confidence: float
    why: str
    created_at: str = Field(alias="createdAt")


class PrivacyControl(BaseModel):
    id: str
    name: str
    scope: str
    mode: Literal["read-only", "approval-required", "action-enabled"]
    retention: str


class WorkflowSuggestion(BaseModel):
    id: str
    title: str
    trigger: str
    actions: list[str]
    confidence: float


class TodayResponse(BaseModel):
    metrics: list[TodayMetric]
    priorities: list[str]
    action_queue: list[ActionQueueItem]
    meetings: list[MeetingBrief]
    insights: list[TwinInsight]


class FeedResponse(BaseModel):
    items: list[TwinObservation]


class PrivacyResponse(BaseModel):
    controls: list[PrivacyControl]


class AutomationResponse(BaseModel):
    suggestions: list[WorkflowSuggestion]

