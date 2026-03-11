from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("recommendations", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="recommendation",
            name="source_refs",
            field=models.JSONField(default=list),
        ),
        migrations.AddField(
            model_name="recommendation",
            name="risk_level",
            field=models.CharField(default="medium", max_length=16),
        ),
        migrations.AddField(
            model_name="recommendation",
            name="pinned_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="recommendation",
            name="dismissed_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
