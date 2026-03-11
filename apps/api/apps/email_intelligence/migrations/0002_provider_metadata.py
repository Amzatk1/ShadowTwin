from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("email_intelligence", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="emailmessage",
            name="labels",
            field=models.JSONField(default=list),
        ),
        migrations.AddField(
            model_name="emailmessage",
            name="metadata",
            field=models.JSONField(default=dict),
        ),
        migrations.AddField(
            model_name="emailmessage",
            name="normalization_version",
            field=models.PositiveIntegerField(default=1),
        ),
        migrations.AddField(
            model_name="emailmessage",
            name="provider_message_id",
            field=models.CharField(blank=True, max_length=255),
        ),
        migrations.AddField(
            model_name="emailmessage",
            name="raw_payload_ref",
            field=models.CharField(blank=True, max_length=255),
        ),
        migrations.AddField(
            model_name="emailthread",
            name="labels",
            field=models.JSONField(default=list),
        ),
        migrations.AddField(
            model_name="emailthread",
            name="normalization_version",
            field=models.PositiveIntegerField(default=1),
        ),
        migrations.AddField(
            model_name="emailthread",
            name="provider_source",
            field=models.CharField(default="google", max_length=64),
        ),
        migrations.AddField(
            model_name="emailthread",
            name="provider_thread_id",
            field=models.CharField(blank=True, max_length=255),
        ),
        migrations.AddField(
            model_name="emailthread",
            name="provider_updated_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="emailthread",
            name="raw_payload_ref",
            field=models.CharField(blank=True, max_length=255),
        ),
    ]
