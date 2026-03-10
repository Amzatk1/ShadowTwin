# ShadowTwin Backend

FastAPI is used here because the product needs:

- API ergonomics for mobile and web clients
- event-driven ingestion endpoints
- background task orchestration with Celery
- clear schema-driven contracts for approvals, suggestions, and privacy controls

## Proposed stack

- FastAPI + Pydantic for API contracts
- PostgreSQL + `pgvector` for structured data and semantic memory
- Redis for caching, queues, and rate-friendly workflow orchestration
- Celery for ingestion, summarization, embedding, and automation jobs

## Initial API highlights

- `GET /health`
- `GET /api/v1/workspaces/{workspace_id}/today`
- `GET /api/v1/workspaces/{workspace_id}/feed`
- `GET /api/v1/workspaces/{workspace_id}/privacy`
- `GET /api/v1/workspaces/{workspace_id}/automations`

See [`app/models/schema.sql`](/Users/ayooluwakarim/ShadowTwin/apps/backend/app/models/schema.sql) for the initial relational schema.

