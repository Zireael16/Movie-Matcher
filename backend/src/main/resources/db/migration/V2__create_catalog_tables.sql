-- =============================================================================
-- Migration V2: Create Catalog Tables (Movies, Screens, Showtimes)
-- =============================================================================

-- 1. Movies Table: Stores movie metadata and runtime duration in minutes
CREATE TABLE IF NOT EXISTS movies (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 2. Screens Table: Physical or virtual theater screens and seating capacity
CREATE TABLE IF NOT EXISTS screens (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    total_capacity INTEGER NOT NULL CHECK (total_capacity > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 3. Showtimes Table: Scheduled screenings linking a movie to a screen at a specific start time
CREATE TABLE IF NOT EXISTS showtimes (
    id BIGSERIAL PRIMARY KEY,
    movie_id BIGINT NOT NULL,
    screen_id BIGINT NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE NOT NULL,
    ticket_price NUMERIC(10, 2) NOT NULL CHECK (ticket_price >= 0.00),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,

    CONSTRAINT fk_showtimes_movie
        FOREIGN KEY (movie_id)
        REFERENCES movies (id)
        ON DELETE CASCADE,

    CONSTRAINT fk_showtimes_screen
        FOREIGN KEY (screen_id)
        REFERENCES screens (id)
        ON DELETE RESTRICT,

    CONSTRAINT chk_showtime_chronology
        CHECK (end_time > start_time)
);

-- Indexing for high-concurrency schedule lookups and overlap checks
CREATE INDEX IF NOT EXISTS idx_showtimes_screen_time
    ON showtimes (screen_id, start_time, end_time);

CREATE INDEX IF NOT EXISTS idx_showtimes_movie
    ON showtimes (movie_id);

-- Optional seed data: Pre-populate screens if none exist
INSERT INTO screens (name, total_capacity)
VALUES
    ('Screen 1 - IMAX', 250),
    ('Screen 2 - Dolby Atmos', 180),
    ('Screen 3 - Standard', 120)
ON CONFLICT (name) DO NOTHING;