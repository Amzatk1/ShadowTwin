from django.db import models


class TwinProfile(models.Model):
    workspace = models.ForeignKey("workspaces.Workspace", on_delete=models.CASCADE)
    owner = models.ForeignKey("accounts.User", on_delete=models.CASCADE)
    stage = models.CharField(max_length=32, default="observe")
    operator_role = models.CharField(max_length=64, default="founder")
    goals = models.JSONField(default=list)
    minimal_mode_enabled = models.BooleanField(default=True)
    onboarding_completed_at = models.DateTimeField(null=True, blank=True)
    confidence_score = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    priorities_summary = models.TextField(blank=True)


class StyleProfile(models.Model):
    twin = models.ForeignKey(TwinProfile, on_delete=models.CASCADE)
    tone_summary = models.TextField(blank=True)
    response_length_preference = models.CharField(max_length=32, default="concise")
    follow_up_pattern_summary = models.TextField(blank=True)
    updated_at = models.DateTimeField(auto_now=True)
