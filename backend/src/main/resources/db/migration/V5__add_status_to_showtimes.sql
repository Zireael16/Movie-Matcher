-- =============================================================================
-- Migration V5: Add status column to showtimes for soft-cancellation
-- =============================================================================

ALTER TABLE showtimes
    ADD COLUMN IF NOT EXISTS status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE';

CREATE INDEX IF NOT EXISTS idx_showtimes_status
    ON showtimes (status);