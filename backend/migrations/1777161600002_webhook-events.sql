-- Up Migration

CREATE TABLE IF NOT EXISTS webhook_events (
  id            BIGSERIAL PRIMARY KEY,
  received_at   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  provider      TEXT NOT NULL,
  event_type    TEXT NOT NULL,
  app_user_id   TEXT,
  payload       JSONB NOT NULL
);

CREATE INDEX IF NOT EXISTS webhook_events_provider_received_at_idx
  ON webhook_events (provider, received_at);

CREATE INDEX IF NOT EXISTS webhook_events_app_user_id_idx
  ON webhook_events (app_user_id);

-- Down Migration

DROP INDEX IF EXISTS webhook_events_app_user_id_idx;
DROP INDEX IF EXISTS webhook_events_provider_received_at_idx;
DROP TABLE IF EXISTS webhook_events;
