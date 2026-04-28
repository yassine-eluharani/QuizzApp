-- Up Migration

CREATE TABLE IF NOT EXISTS admin_audit_log (
  id          BIGSERIAL PRIMARY KEY,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  action      TEXT NOT NULL,
  actor_ip    TEXT,
  request_id  TEXT,
  payload     JSONB NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS admin_audit_log_created_at_idx ON admin_audit_log (created_at);
CREATE INDEX IF NOT EXISTS admin_audit_log_action_idx ON admin_audit_log (action);

-- Down Migration

DROP INDEX IF EXISTS admin_audit_log_action_idx;
DROP INDEX IF EXISTS admin_audit_log_created_at_idx;
DROP TABLE IF EXISTS admin_audit_log;
