import pool from './db'

export async function migrate() {
  await pool.query(`
    -- Niche configuration per user
    CREATE TABLE IF NOT EXISTS niche_configs (
      user_id       TEXT PRIMARY KEY,
      active_niche_id TEXT NOT NULL,
      niches        JSONB NOT NULL DEFAULT '[]',
      updated_at    TIMESTAMPTZ DEFAULT NOW()
    );

    -- Research briefs
    CREATE TABLE IF NOT EXISTS briefs (
      id            TEXT PRIMARY KEY,
      user_id       TEXT NOT NULL,
      niche_id      TEXT NOT NULL,
      niche_name    TEXT NOT NULL,
      signals       JSONB NOT NULL DEFAULT '[]',
      generated_at  TIMESTAMPTZ NOT NULL,
      refreshed_at  TIMESTAMPTZ NOT NULL
    );
    CREATE INDEX IF NOT EXISTS briefs_user_niche
      ON briefs (user_id, niche_id, refreshed_at DESC);

    -- Generated posts
    CREATE TABLE IF NOT EXISTS posts (
      id            TEXT PRIMARY KEY,
      user_id       TEXT NOT NULL,
      niche_id      TEXT NOT NULL,
      signal_id     TEXT NOT NULL,
      signal_title  TEXT NOT NULL,
      platform      TEXT NOT NULL,
      tone          TEXT NOT NULL,
      content       TEXT NOT NULL,
      char_count    INTEGER NOT NULL,
      algo_checks   JSONB NOT NULL DEFAULT '[]',
      best_posting_time TEXT,
      direction     TEXT,
      created_at    TIMESTAMPTZ DEFAULT NOW()
    );
    CREATE INDEX IF NOT EXISTS posts_user_id
      ON posts (user_id, created_at DESC);

    -- Usage tracking
    CREATE TABLE IF NOT EXISTS usage (
      user_id             TEXT PRIMARY KEY,
      plan                TEXT NOT NULL DEFAULT 'free',
      month               TEXT NOT NULL,
      posts_generated     INTEGER NOT NULL DEFAULT 0,
      today               TEXT NOT NULL,
      briefs_today        INTEGER NOT NULL DEFAULT 0,
      has_seen_plan_intro BOOLEAN NOT NULL DEFAULT false,
      updated_at          TIMESTAMPTZ DEFAULT NOW()
    );

    -- Account intelligence
    CREATE TABLE IF NOT EXISTS account_intelligence (
      user_id     TEXT PRIMARY KEY,
      niche_id    TEXT NOT NULL,
      data        JSONB NOT NULL,
      scraped_at  TIMESTAMPTZ DEFAULT NOW()
    );
  `)
  console.log('Migration complete')
}
