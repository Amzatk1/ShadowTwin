from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ("workspaces", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="Meeting",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("external_id", models.CharField(max_length=255)),
                ("title", models.CharField(max_length=255)),
                ("starts_at", models.DateTimeField()),
                ("ends_at", models.DateTimeField(blank=True, null=True)),
                ("participants", models.JSONField(default=list)),
                ("priority", models.CharField(default="medium", max_length=16)),
                ("summary", models.TextField(blank=True)),
                ("workspace", models.ForeignKey(on_delete=models.deletion.CASCADE, to="workspaces.workspace")),
            ],
        ),
        migrations.CreateModel(
            name="MeetingTranscript",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("transcript", models.TextField()),
                ("extracted_actions", models.JSONField(default=list)),
                ("meeting", models.OneToOneField(on_delete=models.deletion.CASCADE, to="meetings.meeting")),
            ],
        ),
    ]

