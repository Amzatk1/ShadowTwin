import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ("workspaces", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="IntegrationConnection",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("provider", models.CharField(max_length=64)),
                ("display_name", models.CharField(max_length=255)),
                ("account_label", models.CharField(blank=True, max_length=255)),
                ("mode", models.CharField(default="read-only", max_length=32)),
                ("status", models.CharField(default="connected", max_length=32)),
                ("scopes", models.JSONField(default=list)),
                ("metadata", models.JSONField(default=dict)),
                ("is_enabled", models.BooleanField(default=True)),
                ("last_synced_at", models.DateTimeField(blank=True, null=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("workspace", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to="workspaces.workspace")),
            ],
            options={"unique_together": {("workspace", "provider", "account_label")}},
        ),
        migrations.CreateModel(
            name="ExternalAccount",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("external_id", models.CharField(max_length=255)),
                ("account_label", models.CharField(max_length=255)),
                ("connection", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to="integrations.integrationconnection")),
            ],
        ),
        migrations.CreateModel(
            name="OAuthTokenRef",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("token_reference", models.CharField(max_length=255)),
                ("refresh_reference", models.CharField(blank=True, max_length=255)),
                ("expires_at", models.DateTimeField(blank=True, null=True)),
                ("connection", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to="integrations.integrationconnection")),
            ],
        ),
    ]
