from rest_framework import serializers


class ApprovalQueueItemSerializer(serializers.Serializer):
    id = serializers.CharField()
    proposedAction = serializers.CharField()
    whySuggested = serializers.CharField()
    confidence = serializers.FloatField()
    status = serializers.CharField()
    sourceLabel = serializers.CharField()
    dueLabel = serializers.CharField()


class ApprovalQueueSerializer(serializers.Serializer):
    items = ApprovalQueueItemSerializer(many=True)


class ApprovalDecisionSerializer(serializers.Serializer):
    decision = serializers.ChoiceField(choices=["approve", "reject", "snooze", "edit"])
    note = serializers.CharField(required=False, allow_blank=True)
