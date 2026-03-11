from rest_framework import serializers


class OnboardingSerializer(serializers.Serializer):
    workspaceSlug = serializers.SlugField()
    operatorRole = serializers.CharField()
    goals = serializers.ListField(child=serializers.CharField())
    minimalModeEnabled = serializers.BooleanField()
    stage = serializers.CharField()
    completedAt = serializers.DateTimeField(allow_null=True)


class OnboardingUpdateSerializer(serializers.Serializer):
    workspaceSlug = serializers.SlugField()
    operatorRole = serializers.CharField(required=False)
    goals = serializers.ListField(child=serializers.CharField(), required=False)
    minimalModeEnabled = serializers.BooleanField(required=False)
    stage = serializers.ChoiceField(
        choices=["observe", "suggest", "assist", "delegate"],
        required=False,
    )
