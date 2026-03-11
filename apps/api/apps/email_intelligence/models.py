from django.db import models


class Contact(models.Model):
    workspace = models.ForeignKey("workspaces.Workspace", on_delete=models.CASCADE)
    full_name = models.CharField(max_length=255)
    email = models.EmailField()
    organization = models.CharField(max_length=255, blank=True)
    relationship_tier = models.CharField(max_length=32, default="active")
    risk_tier = models.CharField(max_length=32, default="normal")
    is_internal = models.BooleanField(default=False)
    importance_score = models.DecimalField(max_digits=5, decimal_places=2, default=0)
    last_interaction_at = models.DateTimeField(null=True, blank=True)
    metadata = models.JSONField(default=dict)

    class Meta:
        unique_together = ("workspace", "email")


class EmailThread(models.Model):
    workspace = models.ForeignKey("workspaces.Workspace", on_delete=models.CASCADE)
    external_id = models.CharField(max_length=255)
    subject = models.CharField(max_length=255)
    participants = models.JSONField(default=list)
    last_message_at = models.DateTimeField(null=True, blank=True)
    waiting_on = models.CharField(max_length=128, blank=True)
    needs_reply = models.BooleanField(default=False)
    is_sensitive = models.BooleanField(default=False)
    summary = models.TextField(blank=True)
    status = models.CharField(max_length=32, default="active")
    source_url = models.URLField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)


class EmailMessage(models.Model):
    thread = models.ForeignKey(EmailThread, on_delete=models.CASCADE, related_name="messages")
    sender = models.EmailField()
    recipients = models.JSONField(default=list)
    direction = models.CharField(max_length=16)
    body = models.TextField()
    summary = models.TextField(blank=True)
    extracted_commitments = models.JSONField(default=list)
    sent_at = models.DateTimeField()
