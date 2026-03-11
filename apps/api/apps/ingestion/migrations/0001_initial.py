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
            name="IngestionEvent",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("event_type", models.CharField(max_length=64)),
                ("channel", models.CharField(default="email", max_length=32)),
                ("source_object_id", models.CharField(max_length=255)),
                ("actor_email", models.EmailField(blank=True, max_length=254)),
                ("counterparties", models.JSONField(default=list)),
                ("scope_mode", models.CharField(default="read-only", max_length=32)),
                ("sensitivity", models.CharField(default="standard", max_length=32)),
                ("status", models.CharField(default="queued", max_length=32)),
                ("payload", models.JSONField(default=dict)),
                ("processed_at", models.DateTimeField(blank=True, null=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("connection", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to="integrations.integrationconnection")),
                ("workspace", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to="workspaces.workspace")),
            ],
        ),
    ]
