from rest_framework import serializers


class LoginSerializer(serializers.Serializer):
    email = serializers.EmailField()
    password = serializers.CharField()


class TokenResponseSerializer(serializers.Serializer):
    accessToken = serializers.CharField()
    refreshToken = serializers.CharField()
    workspaceSlug = serializers.CharField()
    workspace = serializers.DictField()
    user = serializers.DictField()


class RefreshSerializer(serializers.Serializer):
    refreshToken = serializers.CharField()
