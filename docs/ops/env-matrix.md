# Environment Variable Matrix

| Variable | Scope | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_API_BASE_URL` | web | Browser-safe API root |
| `EXPO_PUBLIC_API_BASE_URL` | mobile | Expo public API root |
| `DJANGO_SECRET_KEY` | api | Django signing secret |
| `DJANGO_DEBUG` | api | Development toggle |
| `DJANGO_ALLOWED_HOSTS` | api | Allowed hosts |
| `DATABASE_URL` | api | PostgreSQL connection |
| `REDIS_URL` | api, worker | Celery and cache broker |
| `OPENAI_API_KEY` | api, worker | AI provider access |
| `GOOGLE_CLIENT_ID` | api | Google auth and integrations |
| `GOOGLE_CLIENT_SECRET` | api | Google auth and integrations |
| `MICROSOFT_CLIENT_ID` | api | Microsoft auth and integrations |
| `MICROSOFT_CLIENT_SECRET` | api | Microsoft auth and integrations |
| `ENCRYPTION_KEY` | api | Secret and token encryption |
| `SENTRY_DSN` | web, mobile, api, worker | Error reporting |
| `FEATURE_APPROVAL_AUTOMATIONS` | web, mobile | UI feature flag |
| `FEATURE_DELEGATE_MODE` | web, mobile | Advanced automation gate |

