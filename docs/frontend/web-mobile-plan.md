# Web and Mobile Implementation Plan

## Web

- App Router for marketing, auth, onboarding, and app shell routes
- TanStack Query for server state
- Zustand for UI shell state, command palette state, and ephemeral workflow state
- React Hook Form plus Zod for forms such as onboarding, auth, privacy, and approvals

### Suggested web folders

```text
apps/web/
  app/
  components/
  features/
  hooks/
  lib/
  providers/
  stores/
  styles/
  types/
```

## Mobile

- React Navigation for tabs and stack flows
- Secure token persistence via Expo Secure Store
- Offline-aware quick capture queue for note, voice, image, and link capture
- Reduced-scope product surface compared with web: Today, Feed, Memory, Actions, Settings

### Suggested mobile folders

```text
apps/mobile/src/
  navigation/
  screens/
  features/
  components/
  hooks/
  store/
  services/
  lib/
  theme/
  types/
```

## Shared boundaries

- Share tokens, route contracts, validation, and API client
- Keep layout shells and most interaction components platform-native

