from rest_framework import serializers


class PrivacyControlSerializer(serializers.Serializer):
    id = serializers.CharField()
    name = serializers.CharField()
    scope = serializers.CharField()
    mode = serializers.CharField()
    retention = serializers.CharField()
    learnEnabled = serializers.BooleanField()
    excluded = serializers.BooleanField()


class PrivacySerializer(serializers.Serializer):
    controls = PrivacyControlSerializer(many=True)
    settings = serializers.DictField()


class PrivacyUpdateSerializer(serializers.Serializer):
    workspaceSlug = serializers.SlugField()
    retentionDays = serializers.IntegerField(required=False, min_value=1, max_value=3650)
    actionDisabledMode = serializers.BooleanField(required=False)
    localFirstEnabled = serializers.BooleanField(required=False)
    learningEnabled = serializers.BooleanField(required=False)


class PrivacyExclusionSerializer(serializers.Serializer):
    workspaceSlug = serializers.SlugField()
    connectionId = serializers.IntegerField()
    sourcePath = serializers.CharField()
    displayName = serializers.CharField(required=False, allow_blank=True)
