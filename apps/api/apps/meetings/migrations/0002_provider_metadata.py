from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("meetings", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="meeting",
            name="event_status",
            field=models.CharField(default="confirmed", max_length=32),
        ),
        migrations.AddField(
            model_name="meeting",
            name="meeting_url",
            field=models.URLField(blank=True),
        ),
        migrations.AddField(
            model_name="meeting",
            name="normalization_version",
            field=models.PositiveIntegerField(default=1),
        ),
        migrations.AddField(
            model_name="meeting",
            name="organizer",
            field=models.CharField(blank=True, max_length=255),
        ),
        migrations.AddField(
            model_name="meeting",
            name="provider_event_id",
            field=models.CharField(blank=True, max_length=255),
        ),
        migrations.AddField(
            model_name="meeting",
            name="provider_source",
            field=models.CharField(default="google", max_length=64),
        ),
        migrations.AddField(
            model_name="meeting",
            name="provider_updated_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="meeting",
            name="raw_payload_ref",
            field=models.CharField(blank=True, max_length=255),
        ),
        migrations.AddField(
            model_name="meeting",
            name="source_timezone",
            field=models.CharField(blank=True, max_length=64),
        ),
    ]
