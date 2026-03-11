import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ("workspaces", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="Contact",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("full_name", models.CharField(max_length=255)),
                ("email", models.EmailField(max_length=254)),
                ("organization", models.CharField(blank=True, max_length=255)),
                ("relationship_tier", models.CharField(default="active", max_length=32)),
                ("risk_tier", models.CharField(default="normal", max_length=32)),
                ("is_internal", models.BooleanField(default=False)),
                ("importance_score", models.DecimalField(decimal_places=2, default=0, max_digits=5)),
                ("last_interaction_at", models.DateTimeField(blank=True, null=True)),
                ("metadata", models.JSONField(default=dict)),
                ("workspace", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to="workspaces.workspace")),
            ],
            options={"unique_together": {("workspace", "email")}},
        ),
        migrations.CreateModel(
            name="EmailThread",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("external_id", models.CharField(max_length=255)),
                ("subject", models.CharField(max_length=255)),
                ("participants", models.JSONField(default=list)),
                ("last_message_at", models.DateTimeField(blank=True, null=True)),
                ("waiting_on", models.CharField(blank=True, max_length=128)),
                ("needs_reply", models.BooleanField(default=False)),
                ("is_sensitive", models.BooleanField(default=False)),
                ("summary", models.TextField(blank=True)),
                ("status", models.CharField(default="active", max_length=32)),
                ("source_url", models.URLField(blank=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("workspace", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to="workspaces.workspace")),
            ],
        ),
        migrations.CreateModel(
            name="EmailMessage",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("sender", models.EmailField(max_length=254)),
                ("recipients", models.JSONField(default=list)),
                ("direction", models.CharField(max_length=16)),
                ("body", models.TextField()),
                ("summary", models.TextField(blank=True)),
                ("extracted_commitments", models.JSONField(default=list)),
                ("sent_at", models.DateTimeField()),
                ("thread", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="messages", to="email_intelligence.emailthread")),
            ],
        ),
    ]
