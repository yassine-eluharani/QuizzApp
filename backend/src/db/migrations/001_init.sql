-- Questions table
-- Each row is one question belonging to a specific quiz
CREATE TABLE IF NOT EXISTS questions (
  id                    TEXT PRIMARY KEY,
  quiz_id               TEXT NOT NULL,
  cert_id               TEXT NOT NULL,
  platform_id           TEXT NOT NULL,
  question_number       TEXT NOT NULL,
  question              TEXT NOT NULL,
  choices               JSONB NOT NULL,          -- string[]
  correct_answer_indices JSONB NOT NULL,          -- number[]
  explanation_html      TEXT NOT NULL,
  is_free               BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX IF NOT EXISTS questions_quiz_id_idx ON questions (quiz_id);

-- Push tokens table
-- One row per device. Token is the Expo push token.
CREATE TABLE IF NOT EXISTS push_tokens (
  token       TEXT PRIMARY KEY,
  platform    TEXT NOT NULL CHECK (platform IN ('ios', 'android')),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
