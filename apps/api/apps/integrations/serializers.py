from rest_framework import serializers


class IntegrationScopeUpdateSerializer(serializers.Serializer):
    id = serializers.IntegerField()
    mode = serializers.CharField(required=False)
    learnEnabled = serializers.BooleanField(required=False)
    excluded = serializers.BooleanField(required=False)


class GoogleConnectSerializer(serializers.Serializer):
    workspaceSlug = serializers.SlugField()
    mode = serializers.ChoiceField(choices=["read-only", "approval-required", "action-enabled"], default="read-only")
    selectedScopes = serializers.ListField(
        child=serializers.CharField(),
        required=False,
        allow_empty=True,
    )


class IntegrationModeSerializer(serializers.Serializer):
    mode = serializers.ChoiceField(choices=["read-only", "approval-required", "action-enabled"])


class IntegrationScopeSerializer(serializers.Serializer):
    id = serializers.CharField()
    sourcePath = serializers.CharField()
    displayName = serializers.CharField()
    sourceType = serializers.CharField()
    mode = serializers.CharField()
    learnEnabled = serializers.BooleanField()
    excluded = serializers.BooleanField()


class IntegrationConnectionSerializer(serializers.Serializer):
    id = serializers.CharField()
    provider = serializers.CharField()
    displayName = serializers.CharField()
    accountLabel = serializers.CharField()
    mode = serializers.CharField()
    status = serializers.CharField()
    lastSyncedAt = serializers.DateTimeField(allow_null=True)
    scopes = IntegrationScopeSerializer(many=True)


class IntegrationListSerializer(serializers.Serializer):
    items = IntegrationConnectionSerializer(many=True)
