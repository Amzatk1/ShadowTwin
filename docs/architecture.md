# ShadowTwin Product System

## Monorepo structure

```text
shadowtwin/
  apps/
    web/        Next.js marketing site and logged-in dashboard
    mobile/     Expo mobile app for review, capture, and approvals
    backend/    FastAPI API, ingestion contracts, and schema
  packages/
    design-tokens/
    shared-types/
    sample-data/
  docs/
```

## Product surfaces

### Marketing site

- Home
- Product
- Privacy
- Security
- Pricing
- About
- Contact
- Insights
- Book demo

### Web app

- Today
- Twin Feed
- Email Intelligence
- Meetings
- Memory
- Automations
- Privacy Controls
- Settings

### Mobile app

- Onboarding
- Today
- Feed
- Memory
- Actions
- Settings
- Quick capture modal

## Backend service boundaries

- `api`: request and response contracts for clients
- `core`: environment and infrastructure config
- `services`: twin logic, summarization orchestration, workflow detection, approval routing
- `models`: relational schema and future ORM entities
- `schemas`: Pydantic models for API and background job payloads

## Onboarding flow logic

1. Welcome with clear product positioning and privacy posture.
2. Role selection to tune starter goals and suggested integrations.
3. Goal selection:
   - reduce follow-up drops
   - improve meeting prep
   - manage inbox better
   - automate repeat admin
   - improve execution
   - build personal memory
4. Minimal mode entry point:
   - calendar read-only
   - no write actions
   - do-not-learn defaults available
5. Progressive connection setup with per-source scope explanation.
6. Twin learning phase with visible confidence, examples, and missing-data hints.
7. First Today experience with explainable suggestions and editable drafts.

## Suggested API routes

- `GET /health`
- `POST /api/v1/auth/oauth/{provider}/connect`
- `GET /api/v1/workspaces/{workspace_id}/today`
- `GET /api/v1/workspaces/{workspace_id}/feed`
- `GET /api/v1/workspaces/{workspace_id}/meetings`
- `GET /api/v1/workspaces/{workspace_id}/meetings/{meeting_id}/brief`
- `GET /api/v1/workspaces/{workspace_id}/email/threads`
- `POST /api/v1/workspaces/{workspace_id}/recommendations/{id}/approve`
- `POST /api/v1/workspaces/{workspace_id}/recommendations/{id}/dismiss`
- `GET /api/v1/workspaces/{workspace_id}/memory/search?q=...`
- `GET /api/v1/workspaces/{workspace_id}/automations`
- `POST /api/v1/workspaces/{workspace_id}/automations/{id}/approve`
- `GET /api/v1/workspaces/{workspace_id}/privacy`
- `POST /api/v1/workspaces/{workspace_id}/privacy/exclusions`
- `GET /api/v1/workspaces/{workspace_id}/audit-log`

## Seed data examples

- Founder workspace with Gmail, Google Calendar, Notion, HubSpot, and Zoom connected
- Three high-confidence recommendations awaiting approval
- Two meetings with pre-built briefs and extracted next steps
- One workflow suggestion for investor closeout and one for post-sales-call follow-up
- Memory items covering voice memos, screenshots, links, and meeting notes

## AI system stages

### Stage 1

- Observe only
- Ingest and summarize
- No autonomous action

### Stage 2

- Suggest drafts, reminders, and priorities
- Surface workflow patterns and explain why they are visible

### Stage 3

- Assist with limited approved actions
- Update systems only through policy-aware approval loops

### Stage 4

- Delegate stable workflows with logs, rollback, and workspace policy controls

## Design system guidance

- Typography: editorial heading + restrained sans UI
- Palette: near-white and graphite with a single disciplined accent
- Motion: subtle, low-friction, and reduced-motion aware
- Component posture: high whitespace, soft borders, no noisy ornament
- Trust copy: always include rationale, source visibility, and approval state

