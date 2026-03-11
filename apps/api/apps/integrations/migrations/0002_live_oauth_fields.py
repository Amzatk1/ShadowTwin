from django.db import migrations, models


class Migration(migrations.Migration):
    dependencies = [
        ("integrations", "0001_initial"),
    ]

    operations = [
        migrations.AddField(
            model_name="integrationconnection",
            name="capabilities",
            field=models.JSONField(default=dict),
        ),
        migrations.AddField(
            model_name="integrationconnection",
            name="granted_scopes",
            field=models.JSONField(default=list),
        ),
        migrations.AddField(
            model_name="integrationconnection",
            name="last_sync_error",
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name="integrationconnection",
            name="provider_account_id",
            field=models.CharField(blank=True, max_length=255),
        ),
        migrations.AddField(
            model_name="integrationconnection",
            name="provider_email",
            field=models.EmailField(blank=True, max_length=254),
        ),
        migrations.AddField(
            model_name="integrationconnection",
            name="requires_reauth",
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name="integrationconnection",
            name="sync_state",
            field=models.JSONField(default=dict),
        ),
        migrations.AddField(
            model_name="oauthtokenref",
            name="access_token_ciphertext",
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name="oauthtokenref",
            name="granted_scopes",
            field=models.JSONField(default=list),
        ),
        migrations.AddField(
            model_name="oauthtokenref",
            name="issued_at",
            field=models.DateTimeField(blank=True, null=True),
        ),
        migrations.AddField(
            model_name="oauthtokenref",
            name="refresh_token_ciphertext",
            field=models.TextField(blank=True),
        ),
        migrations.AddField(
            model_name="oauthtokenref",
            name="token_type",
            field=models.CharField(default="Bearer", max_length=32),
        ),
    ]
