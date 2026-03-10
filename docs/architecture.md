# ShadowTwin Architecture Blueprint

## Final monorepo tree

```text
shadowtwin/
  apps/
    web/
    mobile/
    api/
      apps/
        accounts/
        authn/
        workspaces/
        twins/
        integrations/
        ingestion/
        memory/
        meetings/
        email_intelligence/
        actions/
        recommendations/
        approvals/
        automations/
        audit/
        privacy/
        notifications/
        billing/
        analytics/
      shadowtwin_api/
        settings/
    worker/
      worker/
        jobs/
        services/
  packages/
    ui/
    design-tokens/
    shared-types/
    api-client/
    validation/
    config/
    utils/
    sample-data/
  infrastructure/
    docker/
    nginx/
  scripts/
  docs/
    backend/
    frontend/
    security/
    ops/
  .github/
    workflows/
```

## Why this architecture

- Django owns core SaaS concerns: auth, admin, relational models, migrations, permissions, and domain modularity.
- Celery separates event-driven sync and AI-adjacent processing from request latency.
- Next.js and Expo remain thin clients over a typed REST contract.
- Shared packages prevent drift in validation, API shapes, and design tokens without forcing web and mobile into identical UI code.
- Privacy and approvals map to dedicated backend domains instead of living as vague booleans in unrelated modules.

## Data flow

1. An integration sync or user capture creates an `IngestionEvent`.
2. Worker jobs normalize source content and persist structured domain records.
3. Memory, relationship, and style systems update derived knowledge.
4. Recommendation jobs generate explainable suggestions with confidence and source context.
5. The Today dashboard and Feed query those derived objects through versioned APIs.
6. User approvals create audit events and may trigger controlled outbound actions.

## Event flow examples

### Gmail sync

1. Gmail webhook or poll detects new thread.
2. `IngestionEvent` is created in `apps.ingestion`.
3. Worker normalizes thread and messages into `EmailThread` and `EmailMessage`.
4. Memory links and style profile candidates are refreshed.
5. Recommendation engine evaluates reply need, follow-up risk, and obligation extraction.
6. Approval request is created if a draft or write action is proposed.
7. Today and Feed caches are refreshed.

### Meeting transcript

1. Meeting transcript arrives from Zoom or recorder upload.
2. `MeetingTranscript` is stored and summarized.
3. Action items, decisions, and follow-up opportunities are extracted.
4. Memory graph is updated with people, project, and decision links.
5. Meeting follow-up approval is queued.

### Approval accepted

1. User approves an `ApprovalRequest`.
2. Audit event is recorded with actor, action type, source context, and payload snapshot.
3. If required, a worker executes the outbound action.
4. Notification and activity events are emitted.
5. Related recommendation status is updated.

## Phase plan

### Phase 1: Foundation

- Auth, workspaces, app shells, shared tokens, onboarding, settings, integration scaffolding.
Dependencies: monorepo, env strategy, Django project, web and mobile shells.

### Phase 2: Core intelligence

- Today dashboard, Feed, Gmail and Calendar sync, Meetings, Memory ingestion, Recommendations.
Dependencies: Phase 1 auth and workspace ownership, worker, audit events.

### Phase 3: Approvals and actions

- Approval system, email drafts, meeting follow-ups, automation suggestions.
Dependencies: recommendations, notification plumbing, audit log visibility.

### Phase 4: Advanced twin

- Style profile, workflow pattern detection, deeper knowledge graph, confidence and explanation layer.
Dependencies: stable ingestion, enough historical data, recommendation instrumentation.

### Phase 5: Scale and polish

- Billing, enterprise controls, observability, performance work, and privacy hardening.
Dependencies: stable product loops, plan gates, metrics, and enterprise policy needs.

## Engineering standards

- Strict typing in TypeScript and typed serializers or model boundaries in Python.
- Feature folders by domain, not shared dumping grounds.
- Shared validation for write payloads.
- Every AI suggestion requires rationale, confidence, and source references.
- Loading, empty, and error states are required on every user-facing surface.
- Accessibility and reduced-motion support are baseline requirements, not polish.

## Improvement over the earlier starter

- The backend is now Django-first instead of FastAPI-first.
- Privacy, approvals, audit, and billing are explicit modules.
- Worker and infrastructure layers exist in the repo instead of being only described.
- Shared API client and validation packages reduce drift between web and mobile.
- Local ops, route maps, jobs, testing, and privacy docs are broken out into dedicated documents.

## Recommended first implementation files

1. `package.json`
2. `docker-compose.yml`
3. `apps/api/manage.py`
4. `apps/api/shadowtwin_api/settings/base.py`
5. `apps/api/shadowtwin_api/urls.py`
6. `apps/api/apps/accounts/models.py`
7. `apps/api/apps/workspaces/models.py`
8. `apps/api/apps/approvals/models.py`
9. `packages/design-tokens/index.ts`
10. `packages/api-client/index.ts`
11. `apps/web/app/layout.tsx`
12. `apps/mobile/App.tsx`
