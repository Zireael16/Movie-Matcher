-- Phase 4: Create tables for high-concurrency reservations and seat bookings

CREATE TABLE IF NOT EXISTS reservations (
    id BIGSERIAL PRIMARY KEY,
    booking_reference VARCHAR(36) NOT NULL UNIQUE,
    user_id BIGINT NOT NULL,
    showtime_id BIGINT NOT NULL,
    total_amount NUMERIC(10, 2) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'CONFIRMED',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_reservations_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_reservations_showtime FOREIGN KEY (showtime_id) REFERENCES showtimes(id)
);

CREATE TABLE IF NOT EXISTS reservation_seats (
    id BIGSERIAL PRIMARY KEY,
    reservation_id BIGINT NOT NULL,
    showtime_id BIGINT NOT NULL,
    seat_identifier VARCHAR(5) NOT NULL,
    price NUMERIC(10, 2) NOT NULL,
    CONSTRAINT fk_reservation_seats_reservation FOREIGN KEY (reservation_id) REFERENCES reservations(id) ON DELETE CASCADE,
    CONSTRAINT fk_reservation_seats_showtime FOREIGN KEY (showtime_id) REFERENCES showtimes(id),
    CONSTRAINT uq_showtime_seat UNIQUE (showtime_id, seat_identifier)
);

-- Performance indexes for lookup and joins
CREATE INDEX IF NOT EXISTS idx_reservations_user_id ON reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_showtime_id ON reservations(showtime_id);
CREATE INDEX IF NOT EXISTS idx_reservation_seats_showtime_id ON reservation_seats(showtime_id);
CREATE INDEX IF NOT EXISTS idx_reservation_seats_reservation_id ON reservation_seats(reservation_id);