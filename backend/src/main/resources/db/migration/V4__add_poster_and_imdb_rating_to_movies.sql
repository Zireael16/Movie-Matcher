-- =============================================================================
-- Migration V4: Add poster_url and imdb_rating columns to movies table
-- =============================================================================

ALTER TABLE movies
    ADD COLUMN IF NOT EXISTS poster_url VARCHAR(1024),
    ADD COLUMN IF NOT EXISTS imdb_rating VARCHAR(10);