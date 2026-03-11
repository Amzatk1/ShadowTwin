# Google Live Bring-up

## Goal

Validate the real Google callback -> sync -> Today loop against a live account before adding more provider abstractions.

## Required environment

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `GOOGLE_REDIRECT_URI=http://localhost:3000/workspace/integrations/google/callback`
- `DATABASE_URL`
- `REDIS_URL`
- `ENCRYPTION_KEY`

## Local checklist

1. Start PostgreSQL and Redis.
2. Run Django migrations.
3. Start the API, worker, and web app together.
4. Sign in with a seeded owner account.
5. Open the integrations workspace.
6. Connect a real Google account in read-only mode.
7. Complete consent and land back on the callback page.

## What to verify

- The callback stores encrypted tokens and does not expose them to the frontend.
- The integration shows granted scopes and the connected provider email.
- The first sync runs with `syncMode=bootstrap`.
- `lastSyncStartedAt`, `lastSyncCompletedAt`, and `lastSyncStatus` update truthfully.
- Gmail history and Calendar sync tokens are persisted into `syncCursor`.
- A second manual sync moves the connection into incremental behavior.
- Today, Feed, Email, and Meetings are rendering provider-backed records.
- A revoked or stale provider state surfaces as `needs_reconnect`, `degraded`, or `failed`.

## Failure checks

- Missing callback code or signed-state mismatch returns a clear callback failure.
- Missing refresh token or invalid grant sets reconnect-required state.
- Stale Gmail history or Calendar sync token triggers bounded recovery instead of full re-import.
- Partial provider failures still preserve successful records and surface `partial-sync` / `degraded` behavior.
