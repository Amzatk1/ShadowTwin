# ShadowTwin

ShadowTwin is a monorepo starter for a private, trust-first operational twin product. It includes:

- `apps/web`: Next.js marketing site and logged-in web dashboard shell
- `apps/mobile`: Expo mobile app shell for review, capture, and approvals
- `apps/backend`: FastAPI architecture starter, initial schema, and service contracts
- `packages/design-tokens`: shared visual tokens and motion guidance
- `packages/shared-types`: shared domain models for core product objects
- `packages/sample-data`: realistic sample content for UI development

## Product scope

The current scaffold implements:

- Premium landing site structure with product, privacy, pricing, and demo pathways
- Web app command center with Today, Feed, Email, Meetings, Memory, Automations, Privacy, and Settings routes
- Mobile app onboarding plus Today, Feed, Memory, Actions, and Settings tabs
- Shared design tokens, sample data, and architecture documentation
- Backend starter endpoints, domain schemas, and an initial PostgreSQL schema

## Suggested setup

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

### Backend

Create a Python environment, install FastAPI dependencies, then run:

```bash
python -m uvicorn app.main:app --app-dir apps/backend --reload
```

## Notes

- The repository was empty, so this is a fresh starter rather than an edit to an existing app.
- Dependencies were not installed in this session, so runtime verification is limited to file-level sanity checks.

