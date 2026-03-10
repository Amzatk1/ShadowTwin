from django.db import models


class Insight(models.Model):
    workspace = models.ForeignKey("workspaces.Workspace", on_delete=models.CASCADE)
    twin = models.ForeignKey("twins.TwinProfile", on_delete=models.CASCADE)
    title = models.CharField(max_length=255)
    detail = models.TextField()
    rationale = models.TextField()
    confidence = models.DecimalField(max_digits=5, decimal_places=2)


class Recommendation(models.Model):
    workspace = models.ForeignKey("workspaces.Workspace", on_delete=models.CASCADE)
    twin = models.ForeignKey("twins.TwinProfile", on_delete=models.CASCADE)
    recommendation_type = models.CharField(max_length=64)
    title = models.CharField(max_length=255)
    detail = models.TextField()
    why_visible = models.TextField()
    confidence = models.DecimalField(max_digits=5, decimal_places=2)
    approval_required = models.BooleanField(default=True)
    status = models.CharField(max_length=32, default="pending")


class WorkflowPattern(models.Model):
    workspace = models.ForeignKey("workspaces.Workspace", on_delete=models.CASCADE)
    twin = models.ForeignKey("twins.TwinProfile", on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    trigger_description = models.CharField(max_length=255)
    action_blueprint = models.JSONField(default=list)
    confidence = models.DecimalField(max_digits=5, decimal_places=2)

