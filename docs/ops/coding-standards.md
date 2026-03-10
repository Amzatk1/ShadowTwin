# Coding Standards

- TypeScript stays `strict`; do not introduce `any` for convenience.
- Python domain code should prefer explicit model and serializer boundaries over loose dictionaries.
- Feature folders own their API hooks, view logic, and tests.
- Shared packages should expose stable contracts only; avoid leaking app-local details.
- API responses should use predictable envelope shapes and stable field names.
- Every screen needs loading, empty, and error states.
- Accessibility is mandatory: keyboard access on web, readable labels on mobile, reduced motion support everywhere.
- Commits should use short imperative messages with a scope when useful, for example `web: add privacy settings shell`.

