from rest_framework import serializers


class EmailThreadSerializer(serializers.Serializer):
    id = serializers.CharField()
    subject = serializers.CharField()
    participants = serializers.ListField(child=serializers.CharField())
    waitingOn = serializers.CharField(allow_blank=True)
    needsReply = serializers.BooleanField()
    isSensitive = serializers.BooleanField()
    summary = serializers.CharField()
    status = serializers.CharField()
    sourceUrl = serializers.CharField(allow_blank=True)
    lastMessageAt = serializers.DateTimeField(allow_null=True)
    messageCount = serializers.IntegerField()
    extractedCommitments = serializers.ListField(child=serializers.CharField())


class EmailThreadListSerializer(serializers.Serializer):
    items = EmailThreadSerializer(many=True)
