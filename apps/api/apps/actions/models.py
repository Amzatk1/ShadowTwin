from django.db import models


class Task(models.Model):
    workspace = models.ForeignKey("workspaces.Workspace", on_delete=models.CASCADE)
    owner = models.ForeignKey("accounts.User", null=True, blank=True, on_delete=models.SET_NULL)
    title = models.CharField(max_length=255)
    status = models.CharField(max_length=32, default="suggested")
    source_type = models.CharField(max_length=64, blank=True)
    source_id = models.CharField(max_length=255, blank=True)
    due_at = models.DateTimeField(null=True, blank=True)

