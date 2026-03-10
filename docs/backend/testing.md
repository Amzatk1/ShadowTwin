# Backend Testing Strategy

- Unit tests for serializers, permissions, recommendation rules, and privacy policies in `apps/api/tests/unit/`
- Integration tests for authenticated flows, approval actions, and onboarding in `apps/api/tests/integration/`
- Contract tests for stable API responses in `apps/api/tests/contracts/`
- Worker tests for Celery jobs and retry behavior
- Webhook tests for signature verification and malformed payload handling
- Permission tests for role boundaries, read-only integrations, and action-disabled workspaces

