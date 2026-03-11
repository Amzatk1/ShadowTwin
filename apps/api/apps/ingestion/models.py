from django.db import models


class IngestionEvent(models.Model):
    workspace = models.ForeignKey("workspaces.Workspace", on_delete=models.CASCADE)
    connection = models.ForeignKey("integrations.IntegrationConnection", on_delete=models.CASCADE)
    event_type = models.CharField(max_length=64)
    channel = models.CharField(max_length=32, default="email")
    source_object_id = models.CharField(max_length=255)
    actor_email = models.EmailField(blank=True)
    counterparties = models.JSONField(default=list)
    scope_mode = models.CharField(max_length=32, default="read-only")
    sensitivity = models.CharField(max_length=32, default="standard")
    status = models.CharField(max_length=32, default="queued")
    payload = models.JSONField(default=dict)
    processed_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
