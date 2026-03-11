from rest_framework import serializers


class AuditEventSerializer(serializers.Serializer):
    id = serializers.CharField()
    actionType = serializers.CharField()
    objectType = serializers.CharField()
    objectId = serializers.CharField()
    integration = serializers.CharField()
    createdAt = serializers.DateTimeField()
    metadata = serializers.DictField()


class AuditListSerializer(serializers.Serializer):
    items = AuditEventSerializer(many=True)
