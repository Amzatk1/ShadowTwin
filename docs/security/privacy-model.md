# Privacy and Security Model

## Product rules that must map to backend logic

- `read-only integration`: enforced by `IntegrationConnection.mode`
- `do not learn from this`: enforced by `MemoryItem.learn_enabled`
- `delete from memory`: enforced by delete or hide flows in `apps.memory`
- `sensitive workspace boundary`: enforced by `PrivacyPolicySetting.sensitive_boundaries`
- `approval before outbound action`: enforced by `ApprovalRequest` state transitions
- `selective sync`: enforced by `DataSourceScope`

## Security posture

- Least-privilege OAuth scopes
- Encrypted storage for token references and secrets
- Session management and account activity visibility
- Rate limiting and webhook verification at the edge
- Audit events for all sensitive reads, writes, approvals, exports, and privacy changes

