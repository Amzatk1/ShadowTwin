import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ("integrations", "0001_initial"),
        ("workspaces", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="PrivacyPolicySetting",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("local_first_enabled", models.BooleanField(default=True)),
                ("action_disabled_mode", models.BooleanField(default=False)),
                ("retention_days", models.PositiveIntegerField(default=90)),
                ("sensitive_boundaries", models.JSONField(default=list)),
                ("approval_mode", models.CharField(default="required", max_length=32)),
                ("learning_enabled", models.BooleanField(default=True)),
                ("workspace", models.OneToOneField(on_delete=django.db.models.deletion.CASCADE, to="workspaces.workspace")),
            ],
        ),
        migrations.CreateModel(
            name="DataSourceScope",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("display_name", models.CharField(blank=True, max_length=255)),
                ("source_type", models.CharField(default="folder", max_length=64)),
                ("source_path", models.CharField(max_length=255)),
                ("mode", models.CharField(default="read-only", max_length=32)),
                ("learn_enabled", models.BooleanField(default=True)),
                ("is_excluded", models.BooleanField(default=False)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("connection", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to="integrations.integrationconnection")),
                ("workspace", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to="workspaces.workspace")),
            ],
            options={"unique_together": {("connection", "source_path")}},
        ),
    ]
