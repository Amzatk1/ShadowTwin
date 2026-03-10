from django.db import models


class ProductMetric(models.Model):
    workspace = models.ForeignKey("workspaces.Workspace", on_delete=models.CASCADE)
    key = models.CharField(max_length=64)
    value = models.DecimalField(max_digits=12, decimal_places=2, default=0)
    captured_at = models.DateTimeField(auto_now_add=True)

