from django.db import models


class BillingPlan(models.Model):
    code = models.CharField(max_length=64, unique=True)
    name = models.CharField(max_length=255)
    is_enterprise = models.BooleanField(default=False)
    monthly_price = models.DecimalField(max_digits=10, decimal_places=2, default=0)


class Subscription(models.Model):
    workspace = models.ForeignKey("workspaces.Workspace", on_delete=models.CASCADE)
    plan = models.ForeignKey(BillingPlan, on_delete=models.PROTECT)
    status = models.CharField(max_length=32, default="trialing")
    seats = models.PositiveIntegerField(default=1)
    trial_ends_at = models.DateTimeField(null=True, blank=True)

