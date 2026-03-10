from django.db import models


class IntegrationConnection(models.Model):
    workspace = models.ForeignKey("workspaces.Workspace", on_delete=models.CASCADE)
    provider = models.CharField(max_length=64)
    display_name = models.CharField(max_length=255)
    mode = models.CharField(max_length=32, default="read-only")
    is_enabled = models.BooleanField(default=True)


class ExternalAccount(models.Model):
    connection = models.ForeignKey(IntegrationConnection, on_delete=models.CASCADE)
    external_id = models.CharField(max_length=255)
    account_label = models.CharField(max_length=255)


class OAuthTokenRef(models.Model):
    connection = models.ForeignKey(IntegrationConnection, on_delete=models.CASCADE)
    token_reference = models.CharField(max_length=255)
    expires_at = models.DateTimeField(null=True, blank=True)

