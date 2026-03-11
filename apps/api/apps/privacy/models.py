from django.db import models


class PrivacyPolicySetting(models.Model):
    workspace = models.OneToOneField("workspaces.Workspace", on_delete=models.CASCADE)
    local_first_enabled = models.BooleanField(default=True)
    action_disabled_mode = models.BooleanField(default=False)
    retention_days = models.PositiveIntegerField(default=90)
    sensitive_boundaries = models.JSONField(default=list)
    approval_mode = models.CharField(max_length=32, default="required")
    learning_enabled = models.BooleanField(default=True)


class DataSourceScope(models.Model):
    workspace = models.ForeignKey("workspaces.Workspace", on_delete=models.CASCADE)
    connection = models.ForeignKey("integrations.IntegrationConnection", on_delete=models.CASCADE)
    display_name = models.CharField(max_length=255, blank=True)
    source_type = models.CharField(max_length=64, default="folder")
    source_path = models.CharField(max_length=255)
    mode = models.CharField(max_length=32, default="read-only")
    learn_enabled = models.BooleanField(default=True)
    is_excluded = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("connection", "source_path")
