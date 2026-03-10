from rest_framework import serializers


class TodaySerializer(serializers.Serializer):
    priorities = serializers.ListField(child=serializers.CharField())
    actionQueue = serializers.ListField(child=serializers.DictField())
    meetings = serializers.ListField(child=serializers.DictField())
    insights = serializers.ListField(child=serializers.DictField())

