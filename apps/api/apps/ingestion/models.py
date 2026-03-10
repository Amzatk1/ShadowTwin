from django.db import models


class IngestionEvent(models.Model):
    workspace = models.ForeignKey("workspaces.Workspace", on_delete=models.CASCADE)
    connection = models.ForeignKey("integrations.IntegrationConnection", on_delete=models.CASCADE)
    event_type = models.CharField(max_length=64)
    source_object_id = models.CharField(max_length=255)
    status = models.CharField(max_length=32, default="queued")
    payload = models.JSONField(default=dict)
    created_at = models.DateTimeField(auto_now_add=True)

