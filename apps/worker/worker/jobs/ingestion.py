from celery import shared_task

from apps.integrations.models import IntegrationConnection
from apps.integrations.services import sync_google_connection
from apps.workspaces.models import Membership


@shared_task
def sync_gmail_threads(connection_id: str) -> str:
    connection = IntegrationConnection.objects.select_related("workspace").get(pk=connection_id)
    owner = (
        Membership.objects.select_related("user")
        .filter(workspace=connection.workspace, role="owner")
        .order_by("created_at")
        .first()
    )
    if owner is None:
        return f"no owner found for {connection_id}"
    sync_google_connection(connection=connection, workspace=connection.workspace, user=owner.user)
    return f"synced Gmail threads for {connection_id}"


@shared_task
def sync_calendar_events(connection_id: str) -> str:
    return sync_gmail_threads(connection_id)


@shared_task
def process_meeting_transcript(meeting_id: str) -> str:
    return f"processed transcript for {meeting_id}"
