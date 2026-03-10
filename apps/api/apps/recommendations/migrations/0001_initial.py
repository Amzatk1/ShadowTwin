from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ("twins", "0001_initial"),
        ("workspaces", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="Insight",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("title", models.CharField(max_length=255)),
                ("detail", models.TextField()),
                ("rationale", models.TextField()),
                ("confidence", models.DecimalField(decimal_places=2, max_digits=5)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("twin", models.ForeignKey(on_delete=models.deletion.CASCADE, to="twins.twinprofile")),
                ("workspace", models.ForeignKey(on_delete=models.deletion.CASCADE, to="workspaces.workspace")),
            ],
        ),
        migrations.CreateModel(
            name="Recommendation",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("recommendation_type", models.CharField(max_length=64)),
                ("title", models.CharField(max_length=255)),
                ("detail", models.TextField()),
                ("why_visible", models.TextField()),
                ("confidence", models.DecimalField(decimal_places=2, max_digits=5)),
                ("approval_required", models.BooleanField(default=True)),
                ("status", models.CharField(default="pending", max_length=32)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("twin", models.ForeignKey(on_delete=models.deletion.CASCADE, to="twins.twinprofile")),
                ("workspace", models.ForeignKey(on_delete=models.deletion.CASCADE, to="workspaces.workspace")),
            ],
        ),
        migrations.CreateModel(
            name="WorkflowPattern",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("name", models.CharField(max_length=255)),
                ("trigger_description", models.CharField(max_length=255)),
                ("action_blueprint", models.JSONField(default=list)),
                ("confidence", models.DecimalField(decimal_places=2, max_digits=5)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("twin", models.ForeignKey(on_delete=models.deletion.CASCADE, to="twins.twinprofile")),
                ("workspace", models.ForeignKey(on_delete=models.deletion.CASCADE, to="workspaces.workspace")),
            ],
        ),
    ]

