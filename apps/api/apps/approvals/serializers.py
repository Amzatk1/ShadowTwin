from rest_framework import serializers


class ApprovalDecisionSerializer(serializers.Serializer):
    decision = serializers.ChoiceField(choices=["approve", "reject", "snooze", "edit"])
    note = serializers.CharField(required=False, allow_blank=True)

