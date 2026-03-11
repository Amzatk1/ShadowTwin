import django.db.models.deletion
from django.db import migrations, models


class Migration(migrations.Migration):
    initial = True

    dependencies = [
        ("twins", "0001_initial"),
        ("workspaces", "0001_initial"),
    ]

    operations = [
        migrations.CreateModel(
            name="KnowledgeNode",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("label", models.CharField(max_length=255)),
                ("node_type", models.CharField(max_length=64)),
                ("summary", models.TextField(blank=True)),
                ("workspace", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to="workspaces.workspace")),
            ],
        ),
        migrations.CreateModel(
            name="MemoryItem",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("item_type", models.CharField(max_length=64)),
                ("source_label", models.CharField(blank=True, max_length=128)),
                ("source_object_id", models.CharField(blank=True, max_length=255)),
                ("title", models.CharField(blank=True, max_length=255)),
                ("summary", models.TextField(blank=True)),
                ("content", models.TextField()),
                ("is_hidden", models.BooleanField(default=False)),
                ("is_deleted", models.BooleanField(default=False)),
                ("learn_enabled", models.BooleanField(default=True)),
                ("created_at", models.DateTimeField(auto_now_add=True)),
                ("twin", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to="twins.twinprofile")),
                ("workspace", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to="workspaces.workspace")),
            ],
        ),
        migrations.CreateModel(
            name="RelationshipEdge",
            fields=[
                ("id", models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name="ID")),
                ("edge_type", models.CharField(max_length=64)),
                ("confidence", models.DecimalField(decimal_places=2, default=0, max_digits=5)),
                ("from_node", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="outgoing_edges", to="memory.knowledgenode")),
                ("to_node", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name="incoming_edges", to="memory.knowledgenode")),
                ("workspace", models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to="workspaces.workspace")),
            ],
        ),
    ]
