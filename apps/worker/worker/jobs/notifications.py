from celery import shared_task


@shared_task
def send_notification(notification_id: str) -> str:
    return f"sent notification {notification_id}"


@shared_task
def cleanup_expired_data() -> str:
    return "cleanup complete"

