from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
        ("workspaces", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="TwinProfile",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("stage", models.CharField(default="observe", max_length=32)),
                ("confidence_score", models.DecimalField(decimal_places=2, default=0, max_digits=5)),
                ("priorities_summary", models.TextField(blank=True)),
                ("owner", models.ForeignKey(on_delete=models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
                ("workspace", models.ForeignKey(on_delete=models.deletion.CASCADE, to="workspaces.workspace")),
            ],
        ),
        migrations.CreateModel(
            name="StyleProfile",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("tone_summary", models.TextField(blank=True)),
                ("response_length_preference", models.CharField(default="concise", max_length=32)),
                ("follow_up_pattern_summary", models.TextField(blank=True)),
                ("updated_at", models.DateTimeField(auto_now=True)),
                ("twin", models.ForeignKey(on_delete=models.deletion.CASCADE, to="twins.twinprofile")),
            ],
        ),
    ]

