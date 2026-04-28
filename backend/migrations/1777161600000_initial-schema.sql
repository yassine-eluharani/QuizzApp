-- Up Migration

CREATE TABLE IF NOT EXISTS questions (
  id                     TEXT PRIMARY KEY,
  quiz_id                TEXT NOT NULL,
  cert_id                TEXT NOT NULL,
  platform_id            TEXT NOT NULL,
  question_number        TEXT NOT NULL,
  question               TEXT NOT NULL,
  choices                JSONB NOT NULL,
  correct_answer_indices JSONB NOT NULL,
  explanation_html       TEXT NOT NULL,
  is_free                BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS questions_quiz_id_idx ON questions (quiz_id);

CREATE TABLE IF NOT EXISTS push_tokens (
  token       TEXT PRIMARY KEY,
  platform    TEXT NOT NULL CHECK (platform IN ('ios', 'android')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Down Migration

DROP TABLE IF EXISTS push_tokens;
DROP INDEX IF EXISTS questions_quiz_id_idx;
DROP TABLE IF EXISTS questions;
