from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.audit.models import AuditEvent
from apps.privacy.models import DataSourceScope
from apps.workspaces.models import Membership, Workspace

from .models import IntegrationConnection
from .serializers import (
    GoogleConnectSerializer,
    IntegrationConnectionSerializer,
    IntegrationListSerializer,
    IntegrationModeSerializer,
    IntegrationScopeSerializer,
    IntegrationScopeUpdateSerializer,
)
from .services import ensure_google_demo_connection


def _serialize_connection(connection: IntegrationConnection):
    scopes = DataSourceScope.objects.filter(connection=connection).order_by("source_path")
    return {
        "id": str(connection.id),
        "provider": connection.provider,
        "displayName": connection.display_name,
        "accountLabel": connection.account_label,
        "mode": connection.mode,
        "status": connection.status,
        "lastSyncedAt": connection.last_synced_at,
        "scopes": IntegrationScopeSerializer(
            [
                {
                    "id": str(scope.id),
                    "sourcePath": scope.source_path,
                    "displayName": scope.display_name or scope.source_path,
                    "sourceType": scope.source_type,
                    "mode": scope.mode,
                    "learnEnabled": scope.learn_enabled,
                    "excluded": scope.is_excluded,
                }
                for scope in scopes
            ],
            many=True,
        ).data,
    }


def _resolve_workspace(request, workspace_slug: str | None = None):
    if workspace_slug:
        workspace = get_object_or_404(Workspace, slug=workspace_slug)
        get_object_or_404(Membership, workspace=workspace, user=request.user)
        return workspace
    membership = (
        Membership.objects.select_related("workspace")
        .filter(user=request.user)
        .order_by("created_at")
        .first()
    )
    if membership is None:
        raise Workspace.DoesNotExist
    return membership.workspace


class IntegrationListView(APIView):
    def get(self, request):
        workspace = _resolve_workspace(request, request.query_params.get("workspaceSlug"))
        items = [
            _serialize_connection(connection)
            for connection in IntegrationConnection.objects.filter(workspace=workspace).order_by("provider")
        ]
        return Response(IntegrationListSerializer({"items": items}).data)


class GoogleConnectView(APIView):
    def post(self, request):
        serializer = GoogleConnectSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        workspace = _resolve_workspace(request, serializer.validated_data["workspaceSlug"])
        connection = ensure_google_demo_connection(
            workspace=workspace,
            user=request.user,
            mode=serializer.validated_data["mode"],
            selected_scopes=serializer.validated_data.get("selectedScopes", []),
        )
        AuditEvent.objects.create(
            workspace=workspace,
            actor=request.user,
            action_type="integration.google.connect",
            object_type="integration_connection",
            object_id=str(connection.id),
            integration="google",
            metadata={"mode": connection.mode},
        )
        return Response(
            {
                "integration": IntegrationConnectionSerializer(_serialize_connection(connection)).data,
                "demoMode": True,
                "requiresExternalConsent": False,
            }
        )


class GoogleCallbackView(APIView):
    def post(self, request):
        serializer = GoogleConnectSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        workspace = _resolve_workspace(request, serializer.validated_data["workspaceSlug"])
        connection = ensure_google_demo_connection(
            workspace=workspace,
            user=request.user,
            mode=serializer.validated_data["mode"],
            selected_scopes=serializer.validated_data.get("selectedScopes", []),
        )
        return Response({"integration": IntegrationConnectionSerializer(_serialize_connection(connection)).data})


class IntegrationModeView(APIView):
    def patch(self, request, connection_id: str):
        serializer = IntegrationModeSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        connection = get_object_or_404(IntegrationConnection, pk=connection_id)
        get_object_or_404(Membership, workspace=connection.workspace, user=request.user)
        connection.mode = serializer.validated_data["mode"]
        connection.save(update_fields=["mode", "updated_at"])
        AuditEvent.objects.create(
            workspace=connection.workspace,
            actor=request.user,
            action_type="integration.mode.updated",
            object_type="integration_connection",
            object_id=str(connection.id),
            integration=connection.provider,
            metadata={"mode": connection.mode},
        )
        return Response({"integration": IntegrationConnectionSerializer(_serialize_connection(connection)).data})


class IntegrationScopesView(APIView):
    def patch(self, request, connection_id: str):
        serializer = IntegrationScopeUpdateSerializer(data=request.data, many=True)
        serializer.is_valid(raise_exception=True)
        connection = get_object_or_404(IntegrationConnection, pk=connection_id)
        get_object_or_404(Membership, workspace=connection.workspace, user=request.user)

        for item in serializer.validated_data:
            scope = get_object_or_404(DataSourceScope, pk=item["id"], connection=connection)
            if "mode" in item:
                scope.mode = item["mode"]
            if "learnEnabled" in item:
                scope.learn_enabled = item["learnEnabled"]
            if "excluded" in item:
                scope.is_excluded = item["excluded"]
                if scope.is_excluded:
                    scope.learn_enabled = False
            scope.save()

        AuditEvent.objects.create(
            workspace=connection.workspace,
            actor=request.user,
            action_type="integration.scopes.updated",
            object_type="integration_connection",
            object_id=str(connection.id),
            integration=connection.provider,
            metadata={"scopeCount": len(serializer.validated_data)},
        )
        return Response({"integration": IntegrationConnectionSerializer(_serialize_connection(connection)).data})
