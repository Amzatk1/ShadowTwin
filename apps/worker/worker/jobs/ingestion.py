from celery import shared_task


@shared_task
def sync_gmail_threads(connection_id: str) -> str:
    return f"queued Gmail sync for {connection_id}"


@shared_task
def sync_calendar_events(connection_id: str) -> str:
    return f"queued calendar sync for {connection_id}"


@shared_task
def process_meeting_transcript(meeting_id: str) -> str:
    return f"processed transcript for {meeting_id}"

