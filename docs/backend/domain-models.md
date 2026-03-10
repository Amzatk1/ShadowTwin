# Domain Model Outline

## Accounts and workspace

- `User`: authenticated identity, default workspace, MFA posture
- `Workspace`: tenancy boundary, twin stage, approval posture
- `Membership`: user-role mapping per workspace

## Twin and intelligence

- `TwinProfile`: per-user operational twin state and maturity
- `StyleProfile`: editable communication and prioritization preferences
- `Insight`: durable learned patterns
- `Recommendation`: explainable suggestion with confidence and approval posture
- `WorkflowPattern`: repeatable sequence candidate detected from behavior

## Integrations and ingestion

- `IntegrationConnection`: provider, mode, enablement
- `ExternalAccount`: connected account metadata
- `OAuthTokenRef`: encrypted token reference, not raw token in app code
- `IngestionEvent`: normalized event for sync and processing

## Operational content

- `EmailThread` and `EmailMessage`: communication history
- `Meeting` and `MeetingTranscript`: prep and post-meeting intelligence
- `Task`: extracted or approved next action
- `MemoryItem`: raw or summarized item in memory
- `KnowledgeNode` and `RelationshipEdge`: graph layer for linked entities

## Control systems

- `ApprovalRequest`: first-class editable approval object
- `AutomationRule`: approved automation definition with explicit trigger and actions
- `AuditEvent`: immutable sensitive activity log
- `ActivityEvent`: lighter-weight product activity stream
- `PrivacyPolicySetting`: workspace privacy rules
- `DataSourceScope`: per-source inclusion, exclusion, and learn modes
- `Notification`: push, email, or in-app notification object
- `BillingPlan` and `Subscription`: SaaS plan and workspace subscription state

