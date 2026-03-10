from django.db import models


class Meeting(models.Model):
    workspace = models.ForeignKey("workspaces.Workspace", on_delete=models.CASCADE)
    external_id = models.CharField(max_length=255)
    title = models.CharField(max_length=255)
    starts_at = models.DateTimeField()
    ends_at = models.DateTimeField(null=True, blank=True)
    summary = models.TextField(blank=True)


class MeetingTranscript(models.Model):
    meeting = models.OneToOneField(Meeting, on_delete=models.CASCADE)
    transcript = models.TextField()
    extracted_actions = models.JSONField(default=list)

