from django.conf import settings
from django.db import models


class Notification(models.Model):
    workspace = models.ForeignKey("workspaces.Workspace", on_delete=models.CASCADE)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    category = models.CharField(max_length=64)
    channel = models.CharField(max_length=32)
    title = models.CharField(max_length=255)
    body = models.TextField()
    status = models.CharField(max_length=32, default="queued")
    created_at = models.DateTimeField(auto_now_add=True)

