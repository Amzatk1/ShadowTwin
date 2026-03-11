import uuid

from django.conf import settings
from django.db import models


class AuthSession(models.Model):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    workspace = models.ForeignKey("workspaces.Workspace", on_delete=models.CASCADE)
    access_jti = models.UUIDField(default=uuid.uuid4, unique=True)
    refresh_jti = models.UUIDField(default=uuid.uuid4, unique=True)
    user_agent = models.CharField(max_length=255, blank=True)
    ip_address = models.GenericIPAddressField(null=True, blank=True)
    last_seen_at = models.DateTimeField(auto_now=True)
    expires_at = models.DateTimeField()
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-created_at"]

    def __str__(self) -> str:
        return f"{self.user_id}:{self.workspace.slug}:{self.refresh_jti}"
