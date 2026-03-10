from celery import shared_task


@shared_task
def refresh_recommendations(workspace_id: str) -> str:
    return f"refreshed recommendations for {workspace_id}"


@shared_task
def detect_workflow_patterns(workspace_id: str) -> str:
    return f"detected workflow patterns for {workspace_id}"


@shared_task
def compute_confidence_scores(workspace_id: str) -> str:
    return f"recomputed confidence scores for {workspace_id}"

