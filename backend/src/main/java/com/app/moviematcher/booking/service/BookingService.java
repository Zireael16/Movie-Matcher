package com.app.moviematcher.booking.service;

import com.app.moviematcher.booking.dto.BookingRequest;
import com.app.moviematcher.booking.dto.BookingResponse;

import java.util.List;

/**
 * Service interface governing reservation creation, persistence, and audit retrieval.
 * Orchestrates distributed lock verification, external payment settlement,
 * and transactional seat allocation in PostgreSQL.
 */
public interface BookingService {

    /**
     * Executes the booking checkout workflow:
     * 1. Verifies that the caller owns the active Redis seat locks.
     * 2. Confirms that none of the seats are already recorded in the database.
     * 3. Charges the payment instrument via PaymentService.
     * 4. Persists the reservation and individual seat records in PostgreSQL atomically.
     * 5. Releases the temporary Redis locks upon database commit.
     *
     * @param request DTO containing the showtimeId, seat list, holdToken, and payment method
     * @param userId the ID of the authenticated user submitting the booking
     * @return BookingResponse containing the confirmed booking reference, status, and summary
     */
    BookingResponse createBooking(BookingRequest request, Long userId);

    /**
     * Retrieves the details of a confirmed reservation by its unique reference code.
     *
     * @param bookingReference unique UUID-based booking reference
     * @param userId the ID of the user requesting access (enforces authorization)
     * @return BookingResponse populated with reservation metadata and seat identifiers
     */
    BookingResponse getBookingByReference(String bookingReference, Long userId);

    /**
     * Retrieves all reservations belonging to a specific customer account.
     *
     * @param userId target user ID
     * @return List of BookingResponse objects sorted by creation timestamp descending
     */
    List<BookingResponse> getUserBookings(Long userId);
}