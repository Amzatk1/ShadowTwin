from django.db import models


class IntegrationConnection(models.Model):
    workspace = models.ForeignKey("workspaces.Workspace", on_delete=models.CASCADE)
    provider = models.CharField(max_length=64)
    display_name = models.CharField(max_length=255)
    account_label = models.CharField(max_length=255, blank=True)
    mode = models.CharField(max_length=32, default="read-only")
    status = models.CharField(max_length=32, default="connected")
    scopes = models.JSONField(default=list)
    metadata = models.JSONField(default=dict)
    is_enabled = models.BooleanField(default=True)
    last_synced_at = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        unique_together = ("workspace", "provider", "account_label")


class ExternalAccount(models.Model):
    connection = models.ForeignKey(IntegrationConnection, on_delete=models.CASCADE)
    external_id = models.CharField(max_length=255)
    account_label = models.CharField(max_length=255)


class OAuthTokenRef(models.Model):
    connection = models.ForeignKey(IntegrationConnection, on_delete=models.CASCADE)
    token_reference = models.CharField(max_length=255)
    refresh_reference = models.CharField(max_length=255, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)
