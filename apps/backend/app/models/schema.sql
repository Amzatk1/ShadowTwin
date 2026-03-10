CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE workspaces (
  id UUID PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  stage TEXT NOT NULL DEFAULT 'observe',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE users (
  id UUID PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  role TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE twins (
  id UUID PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  owner_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  stage TEXT NOT NULL DEFAULT 'observe',
  confidence_score NUMERIC(5, 2) NOT NULL DEFAULT 0,
  style_profile_id UUID,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE integrations (
  id UUID PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  provider TEXT NOT NULL,
  display_name TEXT NOT NULL,
  mode TEXT NOT NULL,
  scopes JSONB NOT NULL DEFAULT '[]'::jsonb,
  retention_policy TEXT NOT NULL,
  is_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE permissions (
  id UUID PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  integration_id UUID REFERENCES integrations(id) ON DELETE CASCADE,
  resource_pattern TEXT NOT NULL,
  access_level TEXT NOT NULL,
  approval_required BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE style_profiles (
  id UUID PRIMARY KEY,
  twin_id UUID NOT NULL REFERENCES twins(id) ON DELETE CASCADE,
  summary TEXT NOT NULL,
  tone_attributes JSONB NOT NULL DEFAULT '[]'::jsonb,
  example_sources JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE email_threads (
  id UUID PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  external_id TEXT NOT NULL,
  subject TEXT NOT NULL,
  participants JSONB NOT NULL DEFAULT '[]'::jsonb,
  status TEXT NOT NULL,
  last_activity_at TIMESTAMPTZ NOT NULL,
  summary TEXT,
  UNIQUE (workspace_id, external_id)
);

CREATE TABLE messages (
  id UUID PRIMARY KEY,
  thread_id UUID NOT NULL REFERENCES email_threads(id) ON DELETE CASCADE,
  sender TEXT NOT NULL,
  direction TEXT NOT NULL,
  body TEXT NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL,
  embedding VECTOR(1536)
);

CREATE TABLE meetings (
  id UUID PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  external_id TEXT NOT NULL,
  title TEXT NOT NULL,
  starts_at TIMESTAMPTZ NOT NULL,
  ends_at TIMESTAMPTZ,
  attendees JSONB NOT NULL DEFAULT '[]'::jsonb,
  transcript TEXT,
  summary TEXT,
  UNIQUE (workspace_id, external_id)
);

CREATE TABLE notes (
  id UUID PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  source TEXT NOT NULL,
  title TEXT,
  body TEXT NOT NULL,
  embedding VECTOR(1536),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE tasks (
  id UUID PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  status TEXT NOT NULL,
  owner_user_id UUID REFERENCES users(id),
  source_object_type TEXT,
  source_object_id UUID,
  due_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE memory_items (
  id UUID PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  twin_id UUID NOT NULL REFERENCES twins(id) ON DELETE CASCADE,
  item_type TEXT NOT NULL,
  source TEXT NOT NULL,
  title TEXT,
  content TEXT NOT NULL,
  embedding VECTOR(1536),
  is_sensitive BOOLEAN NOT NULL DEFAULT FALSE,
  learn_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE relationships (
  id UUID PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  from_item_id UUID NOT NULL REFERENCES memory_items(id) ON DELETE CASCADE,
  to_item_id UUID NOT NULL REFERENCES memory_items(id) ON DELETE CASCADE,
  relationship_type TEXT NOT NULL,
  confidence NUMERIC(5, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE insights (
  id UUID PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  twin_id UUID NOT NULL REFERENCES twins(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  detail TEXT NOT NULL,
  rationale TEXT NOT NULL,
  confidence NUMERIC(5, 2) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE recommendations (
  id UUID PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  twin_id UUID NOT NULL REFERENCES twins(id) ON DELETE CASCADE,
  recommendation_type TEXT NOT NULL,
  title TEXT NOT NULL,
  detail TEXT NOT NULL,
  why_visible TEXT NOT NULL,
  confidence NUMERIC(5, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE workflow_patterns (
  id UUID PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  twin_id UUID NOT NULL REFERENCES twins(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  trigger_description TEXT NOT NULL,
  action_blueprint JSONB NOT NULL,
  confidence NUMERIC(5, 2) NOT NULL,
  discovered_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE automations (
  id UUID PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  workflow_pattern_id UUID REFERENCES workflow_patterns(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'draft',
  trigger_config JSONB NOT NULL,
  action_config JSONB NOT NULL,
  approval_mode TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE approvals (
  id UUID PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  recommendation_id UUID REFERENCES recommendations(id) ON DELETE SET NULL,
  automation_id UUID REFERENCES automations(id) ON DELETE SET NULL,
  requested_by_user_id UUID REFERENCES users(id),
  approved_by_user_id UUID REFERENCES users(id),
  status TEXT NOT NULL DEFAULT 'pending',
  payload JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  decided_at TIMESTAMPTZ
);

CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  actor_user_id UUID REFERENCES users(id),
  event_type TEXT NOT NULL,
  target_type TEXT NOT NULL,
  target_id UUID,
  metadata JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE notification_events (
  id UUID PRIMARY KEY,
  workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  channel TEXT NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'queued',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

