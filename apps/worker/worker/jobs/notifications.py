from celery import shared_task

from apps.notifications.models import Notification


@shared_task
def send_notification(notification_id: str) -> str:
    notification = Notification.objects.get(pk=notification_id)
    notification.status = "sent"
    notification.save(update_fields=["status"])
    return f"sent notification {notification_id}"


@shared_task
def cleanup_expired_data() -> str:
    return "cleanup complete"
