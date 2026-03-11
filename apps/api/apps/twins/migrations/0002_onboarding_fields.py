from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("twins", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="twinprofile",
            name="operator_role",
            field=models.CharField(default="founder", max_length=64),
        ),
        migrations.AddField(
            model_name="twinprofile",
            name="goals",
            field=models.JSONField(default=list),
        ),
        migrations.AddField(
            model_name="twinprofile",
            name="minimal_mode_enabled",
            field=models.BooleanField(default=True),
        ),
        migrations.AddField(
            model_name="twinprofile",
            name="onboarding_completed_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
    ]
