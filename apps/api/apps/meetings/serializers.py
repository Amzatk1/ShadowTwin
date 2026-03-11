from rest_framework import serializers


class MeetingWorkspaceSerializer(serializers.Serializer):
    id = serializers.CharField()
    title = serializers.CharField()
    startTime = serializers.DateTimeField()
    endTime = serializers.DateTimeField(allow_null=True)
    participants = serializers.ListField(child=serializers.CharField())
    priority = serializers.CharField()
    summary = serializers.CharField()
    extractedActions = serializers.ListField(child=serializers.CharField())


class MeetingWorkspaceListSerializer(serializers.Serializer):
    items = MeetingWorkspaceSerializer(many=True)
