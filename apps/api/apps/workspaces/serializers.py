from rest_framework import serializers


class TodayMetricSerializer(serializers.Serializer):
    label = serializers.CharField()
    value = serializers.CharField()
    delta = serializers.CharField()


class ActionQueueItemSerializer(serializers.Serializer):
    id = serializers.CharField()
    title = serializers.CharField()
    description = serializers.CharField()
    status = serializers.CharField()
    source = serializers.CharField()
    dueLabel = serializers.CharField()


class MeetingBriefSerializer(serializers.Serializer):
    id = serializers.CharField()
    title = serializers.CharField()
    startTime = serializers.CharField()
    participants = serializers.ListField(child=serializers.CharField())
    priority = serializers.CharField()
    summary = serializers.CharField()


class TwinInsightSerializer(serializers.Serializer):
    id = serializers.CharField()
    title = serializers.CharField()
    detail = serializers.CharField()
    confidence = serializers.FloatField()
    rationale = serializers.CharField()
    createdAt = serializers.DateTimeField()


class TodaySerializer(serializers.Serializer):
    metrics = TodayMetricSerializer(many=True)
    priorities = serializers.ListField(child=serializers.CharField())
    actionQueue = ActionQueueItemSerializer(many=True)
    meetings = MeetingBriefSerializer(many=True)
    insights = TwinInsightSerializer(many=True)
