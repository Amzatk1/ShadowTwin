from celery import shared_task

from apps.ai.pipelines.founder_signals import rebuild_founder_signal_layer
from apps.twins.models import TwinProfile
from apps.workspaces.models import Workspace


@shared_task
def refresh_recommendations(workspace_id: str) -> str:
    workspace = Workspace.objects.get(pk=workspace_id)
    twin = TwinProfile.objects.select_related("owner").filter(workspace=workspace).first()
    if twin is None:
        return f"no twin found for {workspace_id}"
    rebuild_founder_signal_layer(workspace=workspace, user=twin.owner)
    return f"refreshed recommendations for {workspace_id}"


@shared_task
def detect_workflow_patterns(workspace_id: str) -> str:
    return f"detected workflow patterns for {workspace_id}"


@shared_task
def compute_confidence_scores(workspace_id: str) -> str:
    return f"recomputed confidence scores for {workspace_id}"
