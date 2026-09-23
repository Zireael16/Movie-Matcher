package com.app.moviematcher.catalog.service;

import com.app.moviematcher.catalog.dto.SeatLayoutResponseDTO;

/**
 * Service contract for querying and generating theater seat layouts for a specific showtime.
 * Serves as the single source of truth for seat coordinates, seat tiers, pricing,
 * and availability status (AVAILABLE, LOCKED, RESERVED).
 */
public interface ShowtimeSeatService {

    /**
     * Constructs and returns the complete seat matrix and showtime metadata for a given showtime.
     * Computes the rows, columns, tier classifications (Silver, Gold, VIP),
     * and dynamic price multipliers relative to the showtime base price.
     *
     * @param showtimeId the primary key ID of the scheduled showtime
     * @return SeatLayoutResponseDTO containing theater layout dimensions, metadata, and all seats
     */
    SeatLayoutResponseDTO getSeatLayout(Long showtimeId);
}