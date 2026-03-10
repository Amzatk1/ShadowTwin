from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ("recommendations", "0001_initial"),
        ("workspaces", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="ApprovalRequest",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("proposed_action", models.CharField(max_length=255)),
                ("editable_payload", models.JSONField(default=dict)),
                ("source_context", models.JSONField(default=dict)),
                ("source_label", models.CharField(default="ShadowTwin", max_length=128)),
                ("due_label", models.CharField(default="Today", max_length=64)),
                ("why_suggested", models.TextField()),
                ("confidence", models.DecimalField(decimal_places=2, max_digits=5)),
                ("status", models.CharField(default="pending", max_length=32)),
                ("snoozed_until", models.DateTimeField(blank=True, null=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("recommendation", models.ForeignKey(blank=True, null=True, on_delete=models.deletion.SET_NULL, to="recommendations.recommendation")),
                ("workspace", models.ForeignKey(on_delete=models.deletion.CASCADE, to="workspaces.workspace")),
            ],
        ),
    ]

