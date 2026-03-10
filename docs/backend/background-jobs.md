# Background Jobs

## Sync jobs

- Sync Gmail threads
- Sync Calendar events
- Refresh CRM or notes sources
- Verify webhook signatures and enqueue normalized ingestion

## Intelligence jobs

- Generate summaries
- Extract action items
- Update style profiles
- Build memory links
- Detect workflow patterns
- Compute confidence scores
- Refresh recommendations

## Control-plane jobs

- Process approval actions
- Send notifications
- Cleanup expired data
- Export audit logs

## Proposed task modules

- `worker.jobs.ingestion`
- `worker.jobs.recommendations`
- `worker.jobs.notifications`

