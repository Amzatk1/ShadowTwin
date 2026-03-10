from fastapi import APIRouter

from app.schemas.domain import (
    AutomationResponse,
    FeedResponse,
    PrivacyResponse,
    TodayResponse,
)
from app.services.twin_engine import (
    get_feed,
    get_privacy_controls,
    get_today_snapshot,
    get_workflow_suggestions,
)

router = APIRouter()


@router.get("/workspaces/{workspace_id}/today", response_model=TodayResponse)
def workspace_today(workspace_id: str) -> TodayResponse:
    return get_today_snapshot()


@router.get("/workspaces/{workspace_id}/feed", response_model=FeedResponse)
def workspace_feed(workspace_id: str) -> FeedResponse:
    return get_feed()


@router.get("/workspaces/{workspace_id}/privacy", response_model=PrivacyResponse)
def workspace_privacy(workspace_id: str) -> PrivacyResponse:
    return get_privacy_controls()


@router.get("/workspaces/{workspace_id}/automations", response_model=AutomationResponse)
def workspace_automations(workspace_id: str) -> AutomationResponse:
    return get_workflow_suggestions()

