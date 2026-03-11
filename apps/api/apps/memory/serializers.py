from rest_framework import serializers


class MemoryItemSerializer(serializers.Serializer):
    id = serializers.CharField()
    itemType = serializers.CharField()
    sourceLabel = serializers.CharField()
    title = serializers.CharField()
    summary = serializers.CharField()
    content = serializers.CharField()
    learnEnabled = serializers.BooleanField()
    hidden = serializers.BooleanField()
    createdAt = serializers.DateTimeField()


class MemoryListSerializer(serializers.Serializer):
    items = MemoryItemSerializer(many=True)
