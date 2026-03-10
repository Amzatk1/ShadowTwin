# API Route Map

## Auth

- `POST /api/v1/auth/login/`
- `POST /api/v1/auth/logout/`
- `POST /api/v1/auth/magic-link/request/`
- `POST /api/v1/auth/oauth/google/start/`
- `POST /api/v1/auth/oauth/microsoft/start/`

## Onboarding and user

- `GET /api/v1/users/me/`
- `PATCH /api/v1/users/me/`
- `POST /api/v1/onboarding/complete/`

## Today and feed

- `GET /api/v1/today/{workspace_slug}/`
- `GET /api/v1/feed/{workspace_slug}/`

## Meetings

- `GET /api/v1/meetings/{workspace_slug}/`
- `GET /api/v1/meetings/{workspace_slug}/{meeting_id}/`
- `POST /api/v1/meetings/{workspace_slug}/{meeting_id}/follow-up/approve/`

## Email intelligence

- `GET /api/v1/email/{workspace_slug}/threads/`
- `GET /api/v1/email/{workspace_slug}/threads/{thread_id}/`
- `POST /api/v1/email/{workspace_slug}/threads/{thread_id}/draft/`

## Memory

- `GET /api/v1/memory/{workspace_slug}/search/`
- `POST /api/v1/memory/{workspace_slug}/capture/`
- `POST /api/v1/memory/{workspace_slug}/{memory_id}/hide/`
- `POST /api/v1/memory/{workspace_slug}/{memory_id}/delete/`
- `POST /api/v1/memory/{workspace_slug}/{memory_id}/learn-toggle/`

## Recommendations and approvals

- `GET /api/v1/recommendations/{workspace_slug}/`
- `GET /api/v1/approvals/{approval_id}/`
- `POST /api/v1/approvals/{approval_id}/decision/`

## Automations

- `GET /api/v1/automations/{workspace_slug}/`
- `POST /api/v1/automations/{workspace_slug}/{automation_id}/enable/`
- `POST /api/v1/automations/{workspace_slug}/{automation_id}/disable/`

## Privacy and audit

- `GET /api/v1/privacy/{workspace_slug}/`
- `PATCH /api/v1/privacy/{workspace_slug}/`
- `GET /api/v1/audit/{workspace_slug}/`
- `POST /api/v1/audit/{workspace_slug}/export/`

## Billing and notifications

- `GET /api/v1/billing/{workspace_slug}/`
- `GET /api/v1/notifications/{workspace_slug}/`
- `PATCH /api/v1/notifications/{workspace_slug}/preferences/`

