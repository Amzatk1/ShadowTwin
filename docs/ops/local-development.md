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
2. Start infra: `docker compose up postgres redis`
3. Install Node dependencies: `npm install`
4. Install Python dependencies in your virtual environment for `apps/api`
5. Run migrations: `make migrate`
6. Seed demo data: `make seed`
7. Start API: `make run-api`
8. Start worker: `make run-worker`
9. Start web: `make run-web`
10. Start mobile: `make run-mobile`

## Environment separation

- Root `.env.example` describes shared defaults.
- `apps/web/.env.example` is for browser-safe values only.
- `apps/mobile/.env.example` is for Expo public values only.
- `apps/api/.env.example` holds backend secrets and service URLs.
- `apps/worker/.env.example` mirrors backend queue config.

