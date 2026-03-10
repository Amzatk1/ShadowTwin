# ShadowTwin

ShadowTwin is a production-oriented monorepo starter for a private, trust-first operational twin product. The architecture follows a Django-first backend, Expo mobile app, Next.js web app, shared TypeScript packages, and a background worker layer for ingestion and AI workflows.

## Monorepo

- `apps/web`: Next.js App Router marketing site and logged-in workspace shell
- `apps/mobile`: Expo mobile shell focused on Today, approvals, capture, and memory lookup
- `apps/api`: Django + Django REST Framework API scaffold with modular domain apps
- `apps/worker`: Celery worker scaffold for sync, ingestion, memory, and recommendation jobs
- `packages/ui`: shared component contracts and cross-surface UI primitives
- `packages/design-tokens`: colors, spacing, radii, typography, shadows, and motion tokens
- `packages/shared-types`: shared TypeScript domain types
- `packages/api-client`: typed REST client for web and mobile
- `packages/validation`: shared Zod schemas for forms and API payloads
- `packages/config`: shared TypeScript config helpers
- `packages/utils`: shared formatting and ergonomic helpers
- `packages/sample-data`: realistic seed-like content for UI development
- `docs`: architecture, backend, frontend, security, and local operations docs
- `infrastructure`: Docker and deployment-adjacent local infrastructure config

## Current scaffold coverage

Implemented now:

- Premium landing site structure with product, privacy, pricing, and demo pathways
- Web app command center with Today, Feed, Email, Meetings, Memory, Automations, Privacy, and Settings routes
- Mobile app onboarding plus Today, Feed, Memory, Actions, and Settings tabs
- Shared tokens, types, validation, API client, and sample data packages
- Django project scaffold with domain apps for auth, workspaces, twins, integrations, memory, meetings, approvals, audit, privacy, billing, and more
- Celery worker scaffold for ingestion, recommendation refresh, notifications, and cleanup jobs
- Docker Compose, env examples, CI stub, seed command scaffold, and detailed architecture docs

## Suggested local setup

### Web

```bash
npm install
npm run dev:web
```

### Mobile

```bash
npm install
npm run dev:mobile
```

### API

Create a Python 3.12 environment, install `apps/api` dependencies, then run:

```bash
python apps/api/manage.py runserver 0.0.0.0:8000
```

### Worker

Run the Celery worker from the Django app context:

```bash
python -m celery -A shadowtwin_api.celery_app worker -l info --workdir apps/api
```

## Notes

- This repository started empty, so the current state is a fresh architecture scaffold rather than an incremental edit to an existing product.
- Dependencies were not installed in this session. Verification is therefore limited to structural checks and Python syntax compilation for the Django-side files.
- Read [docs/architecture.md](/Users/ayooluwakarim/ShadowTwin/docs/architecture.md) first, then [docs/ops/local-development.md](/Users/ayooluwakarim/ShadowTwin/docs/ops/local-development.md) for the concrete setup path.

