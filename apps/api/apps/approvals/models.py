from django.db import models


class ApprovalRequest(models.Model):
    workspace = models.ForeignKey("workspaces.Workspace", on_delete=models.CASCADE)
    recommendation = models.ForeignKey("recommendations.Recommendation", null=True, blank=True, on_delete=models.SET_NULL)
    proposed_action = models.CharField(max_length=255)
    editable_payload = models.JSONField(default=dict)
    source_context = models.JSONField(default=dict)
    source_label = models.CharField(max_length=128, default="ShadowTwin")
    due_label = models.CharField(max_length=64, default="Today")
    why_suggested = models.TextField()
    confidence = models.DecimalField(max_digits=5, decimal_places=2)
    status = models.CharField(max_length=32, default="pending")
    snoozed_until = models.DateTimeField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
