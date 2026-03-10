from django.db import models


class EmailThread(models.Model):
    workspace = models.ForeignKey("workspaces.Workspace", on_delete=models.CASCADE)
    external_id = models.CharField(max_length=255)
    subject = models.CharField(max_length=255)
    summary = models.TextField(blank=True)
    status = models.CharField(max_length=32, default="active")


class EmailMessage(models.Model):
    thread = models.ForeignKey(EmailThread, on_delete=models.CASCADE)
    sender = models.EmailField()
    direction = models.CharField(max_length=16)
    body = models.TextField()
    sent_at = models.DateTimeField()

