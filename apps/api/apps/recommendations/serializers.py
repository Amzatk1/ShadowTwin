from rest_framework import serializers


class FeedItemSerializer(serializers.Serializer):
    id = serializers.CharField()
    kind = serializers.CharField()
    title = serializers.CharField()
    detail = serializers.CharField()
    confidence = serializers.FloatField()
    why = serializers.CharField()
    riskLevel = serializers.CharField()
    sourceRefs = serializers.ListField(child=serializers.CharField())
    createdAt = serializers.DateTimeField()


class FeedSerializer(serializers.Serializer):
    items = FeedItemSerializer(many=True)
