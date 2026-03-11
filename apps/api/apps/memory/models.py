from django.db import models


class MemoryItem(models.Model):
    workspace = models.ForeignKey("workspaces.Workspace", on_delete=models.CASCADE)
    twin = models.ForeignKey("twins.TwinProfile", on_delete=models.CASCADE)
    item_type = models.CharField(max_length=64)
    source_label = models.CharField(max_length=128, blank=True)
    source_object_id = models.CharField(max_length=255, blank=True)
    title = models.CharField(max_length=255, blank=True)
    summary = models.TextField(blank=True)
    content = models.TextField()
    is_hidden = models.BooleanField(default=False)
    is_deleted = models.BooleanField(default=False)
    learn_enabled = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)


class KnowledgeNode(models.Model):
    workspace = models.ForeignKey("workspaces.Workspace", on_delete=models.CASCADE)
    label = models.CharField(max_length=255)
    node_type = models.CharField(max_length=64)
    summary = models.TextField(blank=True)


class RelationshipEdge(models.Model):
    workspace = models.ForeignKey("workspaces.Workspace", on_delete=models.CASCADE)
    from_node = models.ForeignKey(KnowledgeNode, on_delete=models.CASCADE, related_name="outgoing_edges")
    to_node = models.ForeignKey(KnowledgeNode, on_delete=models.CASCADE, related_name="incoming_edges")
    edge_type = models.CharField(max_length=64)
    confidence = models.DecimalField(max_digits=5, decimal_places=2, default=0)
