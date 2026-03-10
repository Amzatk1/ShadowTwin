from django.db import models


class AutomationRule(models.Model):
    workspace = models.ForeignKey("workspaces.Workspace", on_delete=models.CASCADE)
    workflow_pattern = models.ForeignKey("recommendations.WorkflowPattern", null=True, blank=True, on_delete=models.SET_NULL)
    name = models.CharField(max_length=255)
    trigger_config = models.JSONField(default=dict)
    action_config = models.JSONField(default=dict)
    approval_mode = models.CharField(max_length=32, default="required")
    is_enabled = models.BooleanField(default=False)

