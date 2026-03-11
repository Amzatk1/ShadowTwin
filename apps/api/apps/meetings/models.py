from django.db import models


class Meeting(models.Model):
    workspace = models.ForeignKey("workspaces.Workspace", on_delete=models.CASCADE)
    external_id = models.CharField(max_length=255)
    provider_source = models.CharField(max_length=64, default="google")
    provider_event_id = models.CharField(max_length=255, blank=True)
    title = models.CharField(max_length=255)
    organizer = models.CharField(max_length=255, blank=True)
    starts_at = models.DateTimeField()
    ends_at = models.DateTimeField(null=True, blank=True)
    participants = models.JSONField(default=list)
    source_timezone = models.CharField(max_length=64, blank=True)
    meeting_url = models.URLField(blank=True)
    event_status = models.CharField(max_length=32, default="confirmed")
    provider_updated_at = models.DateTimeField(null=True, blank=True)
    priority = models.CharField(max_length=16, default="medium")
    summary = models.TextField(blank=True)
    raw_payload_ref = models.CharField(max_length=255, blank=True)
    normalization_version = models.PositiveIntegerField(default=1)


class MeetingTranscript(models.Model):
    meeting = models.OneToOneField(Meeting, on_delete=models.CASCADE)
    transcript = models.TextField()
    extracted_actions = models.JSONField(default=list)
