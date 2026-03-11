from rest_framework import serializers


class NotificationSerializer(serializers.Serializer):
    id = serializers.CharField()
    category = serializers.CharField()
    channel = serializers.CharField()
    title = serializers.CharField()
    body = serializers.CharField()
    status = serializers.CharField()
    actionUrl = serializers.CharField()
    createdAt = serializers.DateTimeField()


class NotificationListSerializer(serializers.Serializer):
    items = NotificationSerializer(many=True)
