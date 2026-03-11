from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.audit.models import AuditEvent
from apps.integrations.models import IntegrationConnection
from apps.workspaces.models import Membership, Workspace

from .models import DataSourceScope, PrivacyPolicySetting
from .serializers import PrivacyExclusionSerializer, PrivacySerializer, PrivacyUpdateSerializer


def _resolve_workspace(request, workspace_slug: str):
    workspace = get_object_or_404(Workspace, slug=workspace_slug)
    get_object_or_404(Membership, workspace=workspace, user=request.user)
    return workspace


def _serialize_privacy(workspace):
    setting, _ = PrivacyPolicySetting.objects.get_or_create(workspace=workspace)
    controls = []
    for scope in DataSourceScope.objects.select_related("connection").filter(workspace=workspace).order_by(
        "connection__provider", "source_path"
    ):
        controls.append(
            {
                "id": str(scope.id),
                "name": f"{scope.connection.display_name} / {scope.display_name or scope.source_path}",
                "scope": scope.source_path,
                "mode": scope.mode,
                "retention": f"{setting.retention_days} day retention",
                "learnEnabled": scope.learn_enabled,
                "excluded": scope.is_excluded,
            }
        )
    return {
        "controls": controls,
        "settings": {
            "retentionDays": setting.retention_days,
            "actionDisabledMode": setting.action_disabled_mode,
            "localFirstEnabled": setting.local_first_enabled,
            "learningEnabled": setting.learning_enabled,
            "approvalMode": setting.approval_mode,
        },
    }


class PrivacyView(APIView):
    def get(self, request):
        workspace = _resolve_workspace(request, request.query_params.get("workspaceSlug"))
        return Response(PrivacySerializer(_serialize_privacy(workspace)).data)

    def patch(self, request):
        serializer = PrivacyUpdateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        workspace = _resolve_workspace(request, serializer.validated_data["workspaceSlug"])
        setting, _ = PrivacyPolicySetting.objects.get_or_create(workspace=workspace)
        if "retentionDays" in serializer.validated_data:
            setting.retention_days = serializer.validated_data["retentionDays"]
        if "actionDisabledMode" in serializer.validated_data:
            setting.action_disabled_mode = serializer.validated_data["actionDisabledMode"]
        if "localFirstEnabled" in serializer.validated_data:
            setting.local_first_enabled = serializer.validated_data["localFirstEnabled"]
        if "learningEnabled" in serializer.validated_data:
            setting.learning_enabled = serializer.validated_data["learningEnabled"]
        setting.save()
        AuditEvent.objects.create(
            workspace=workspace,
            actor=request.user,
            action_type="privacy.updated",
            object_type="privacy_policy",
            object_id=str(setting.id),
            metadata=serializer.validated_data,
        )
        return Response(PrivacySerializer(_serialize_privacy(workspace)).data)


class PrivacyExclusionView(APIView):
    def post(self, request):
        serializer = PrivacyExclusionSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        workspace = _resolve_workspace(request, serializer.validated_data["workspaceSlug"])
        connection = get_object_or_404(
            IntegrationConnection,
            pk=serializer.validated_data["connectionId"],
            workspace=workspace,
        )
        scope, _ = DataSourceScope.objects.update_or_create(
            workspace=workspace,
            connection=connection,
            source_path=serializer.validated_data["sourcePath"],
            defaults={
                "display_name": serializer.validated_data.get("displayName", ""),
                "source_type": "manual-exclusion",
                "mode": "read-only",
                "learn_enabled": False,
                "is_excluded": True,
            },
        )
        AuditEvent.objects.create(
            workspace=workspace,
            actor=request.user,
            action_type="privacy.exclusion.created",
            object_type="data_source_scope",
            object_id=str(scope.id),
            integration=connection.provider,
            metadata={"sourcePath": scope.source_path},
        )
        return Response(PrivacySerializer(_serialize_privacy(workspace)).data)
