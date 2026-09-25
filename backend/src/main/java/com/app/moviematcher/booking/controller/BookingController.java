package com.app.moviematcher.booking.controller;

import com.app.moviematcher.auth.entity.User;
import com.app.moviematcher.booking.dto.BookingRequest;
import com.app.moviematcher.booking.dto.BookingResponse;
import com.app.moviematcher.booking.dto.SeatLockRequest;
import com.app.moviematcher.booking.dto.SeatLockResponse;
import com.app.moviematcher.booking.service.BookingService;
import com.app.moviematcher.booking.service.SeatLockService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * REST Controller exposing endpoints for seat locking and reservation checkouts.
 * Requires user authentication for all operations.
 */
@RestController
@RequestMapping("/api/v1/bookings")
public class BookingController {

    private final BookingService bookingService;
    private final SeatLockService seatLockService;

    public BookingController(BookingService bookingService, SeatLockService seatLockService) {
        this.bookingService = bookingService;
        this.seatLockService = seatLockService;
    }

    /**
     * Acquires a temporary distributed lock on selected seats for a showtime.
     *
     * @param showtimeId target screening ID
     * @param request list of seat identifiers to lock (max 8)
     * @param currentUser authenticated user principal
     * @return SeatLockResponse containing the hold token and expiration details
     */
    @PostMapping("/locks/{showtimeId}")
    public ResponseEntity<SeatLockResponse> lockSeats(
            @PathVariable Long showtimeId,
            @Valid @RequestBody SeatLockRequest request,
            @AuthenticationPrincipal User currentUser) {
        SeatLockResponse response = seatLockService.lockSeats(showtimeId, currentUser.getId(), request.getSeatIds());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Releases previously held seat locks if the user decides to cancel or change selection.
     *
     * @param showtimeId target screening ID
     * @param holdToken active hold token issued during lock acquisition
     * @param request list of seats to unlock
     * @param currentUser authenticated user principal
     * @return HTTP 204 No Content
     */
    @DeleteMapping("/locks/{showtimeId}")
    public ResponseEntity<Void> releaseSeats(
            @PathVariable Long showtimeId,
            @RequestParam String holdToken,
            @Valid @RequestBody SeatLockRequest request,
            @AuthenticationPrincipal User currentUser) {
        seatLockService.releaseSeats(showtimeId, currentUser.getId(), holdToken, request.getSeatIds());
        return ResponseEntity.noContent().build();
    }

    /**
     * Completes the checkout and permanently reserves seats in PostgreSQL.
     *
     * @param request contains showtimeId, seat list, holdToken, and payment method
     * @param currentUser authenticated user principal
     * @return BookingResponse with confirmed reference, status, and summary
     */
    @PostMapping
    public ResponseEntity<BookingResponse> createBooking(
            @Valid @RequestBody BookingRequest request,
            @AuthenticationPrincipal User currentUser) {
        BookingResponse response = bookingService.createBooking(request, currentUser.getId());
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Fetches details of a confirmed reservation by its UUID reference.
     *
     * @param bookingReference reference code
     * @param currentUser authenticated user principal
     * @return BookingResponse details
     */
    @GetMapping("/{bookingReference}")
    public ResponseEntity<BookingResponse> getBookingByReference(
            @PathVariable String bookingReference,
            @AuthenticationPrincipal User currentUser) {
        BookingResponse response = bookingService.getBookingByReference(bookingReference, currentUser.getId());
        return ResponseEntity.ok(response);
    }

    /**
     * Fetches all bookings belonging to the currently authenticated user.
     *
     * @param currentUser authenticated user principal
     * @return list of BookingResponse DTOs
     */
    @GetMapping("/my-bookings")
    public ResponseEntity<List<BookingResponse>> getMyBookings(@AuthenticationPrincipal User currentUser) {
        List<BookingResponse> responses = bookingService.getUserBookings(currentUser.getId());
        return ResponseEntity.ok(responses);
    }
}