# Local Development

## Services

- PostgreSQL
- Redis
- Django API
- Celery worker
- Next.js web app
- Expo mobile app outside Docker

## Start sequence

1. Copy `.env.example` values as needed.
2. If you want to validate live Google OAuth, set `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, and `GOOGLE_REDIRECT_URI` in `apps/api/.env`.
3. Ensure the Google OAuth app allows `http://localhost:3000/workspace/integrations/google/callback` as an authorized redirect URI.
4. Start infra: `docker compose up postgres redis`
5. Install Node dependencies: `npm install`
6. Install Python dependencies in your virtual environment for `apps/api`
7. Run migrations: `make migrate`
8. Seed demo data: `make seed`
9. Start API: `make run-api`
10. Start worker: `make run-worker`
11. Start web: `make run-web`
12. Start mobile: `make run-mobile`

## Live Google validation

1. Sign in with the seeded owner account.
2. Open `/workspace/integrations`.
3. Connect Google in read-only mode and complete consent.
4. Confirm the integration shows granted scopes, `bootstrap` sync mode, and a truthful sync health state.
5. Use the `Run sync` action to force a second pass and confirm the connection moves into incremental behavior.
6. Validate that Today, Feed, Email, and Meetings reflect provider-backed data instead of demo-only content.
7. If the provider invalidates a cursor or token, confirm the UI surfaces `needs_reconnect`, `degraded`, or `failed` instead of silently pretending the connection is healthy.

## Environment separation

- Root `.env.example` describes shared defaults.
- `apps/web/.env.example` is for browser-safe values only.
- `apps/mobile/.env.example` is for Expo public values only.
- `apps/api/.env.example` holds backend secrets and service URLs.
- `apps/worker/.env.example` mirrors backend queue config.
