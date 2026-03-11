from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("integrations", "0002_live_oauth_fields"),
    ]

    operations = [
        migrations.AddField(
            model_name="integrationconnection",
            name="last_sync_completed_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="integrationconnection",
            name="last_sync_error_code",
            field=models.CharField(blank=True, max_length=64),
        ),
        migrations.AddField(
            model_name="integrationconnection",
            name="last_sync_error_message",
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name="integrationconnection",
            name="last_sync_started_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="integrationconnection",
            name="last_sync_status",
            field=models.CharField(default="never-run", max_length=32),
        ),
        migrations.AddField(
            model_name="integrationconnection",
            name="sync_cursor",
            field=models.JSONField(default=dict),
        ),
        migrations.AddField(
            model_name="integrationconnection",
            name="sync_mode",
            field=models.CharField(default="bootstrap", max_length=32),
        ),
    ]
