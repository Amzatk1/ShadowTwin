from django.db import models


class IntegrationConnection(models.Model):
    workspace = models.ForeignKey("workspaces.Workspace", on_delete=models.CASCADE)
    provider = models.CharField(max_length=64)
    provider_account_id = models.CharField(max_length=255, blank=True)
    provider_email = models.EmailField(blank=True)
    display_name = models.CharField(max_length=255)
    account_label = models.CharField(max_length=255, blank=True)
    mode = models.CharField(max_length=32, default="read-only")
    status = models.CharField(max_length=32, default="connected")
    scopes = models.JSONField(default=list)
    granted_scopes = models.JSONField(default=list)
    metadata = models.JSONField(default=dict)
    capabilities = models.JSONField(default=dict)
    sync_state = models.JSONField(default=dict)
    sync_cursor = models.JSONField(default=dict)
    sync_mode = models.CharField(max_length=32, default="bootstrap")
    last_sync_started_at = models.DateTimeField(null=True, blank=True)
    last_sync_completed_at = models.DateTimeField(null=True, blank=True)
    last_sync_status = models.CharField(max_length=32, default="never-run")
    last_sync_error_code = models.CharField(max_length=64, blank=True)
    last_sync_error_message = models.TextField(blank=True)
    last_sync_error = models.TextField(blank=True)
    requires_reauth = models.BooleanField(default=False)
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
    access_token_ciphertext = models.TextField(blank=True)
    refresh_token_ciphertext = models.TextField(blank=True)
    granted_scopes = models.JSONField(default=list)
    token_type = models.CharField(max_length=32, default="Bearer")
    issued_at = models.DateTimeField(null=True, blank=True)
    expires_at = models.DateTimeField(null=True, blank=True)
