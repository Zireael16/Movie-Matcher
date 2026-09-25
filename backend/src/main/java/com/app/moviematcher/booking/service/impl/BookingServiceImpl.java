package com.app.moviematcher.booking.service.impl;

import com.app.moviematcher.auth.entity.User;
import com.app.moviematcher.auth.repository.UserRepository;
import com.app.moviematcher.booking.dto.BookingRequest;
import com.app.moviematcher.booking.dto.BookingResponse;
import com.app.moviematcher.booking.dto.PaymentResult;
import com.app.moviematcher.booking.entity.Reservation;
import com.app.moviematcher.booking.entity.ReservationSeat;
import com.app.moviematcher.booking.repository.ReservationRepository;
import com.app.moviematcher.booking.repository.ReservationSeatRepository;
import com.app.moviematcher.booking.service.BookingService;
import com.app.moviematcher.booking.service.PaymentService;
import com.app.moviematcher.booking.service.SeatLockService;
import com.app.moviematcher.catalog.entity.Showtime;
import com.app.moviematcher.catalog.repository.ShowtimeRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Core implementation of BookingService managing high-concurrency seat checkout.
 * Enforces two-tier concurrency safety: Redis distributed locks for active customer holds
 * and unique database constraints for permanent persistence.
 */
@Service
public class BookingServiceImpl implements BookingService {

    private static final Logger log = LoggerFactory.getLogger(BookingServiceImpl.class);

    private final ReservationRepository reservationRepository;
    private final ReservationSeatRepository reservationSeatRepository;
    private final ShowtimeRepository showtimeRepository;
    private final UserRepository userRepository;
    private final SeatLockService seatLockService;
    private final PaymentService paymentService;

    public BookingServiceImpl(
            ReservationRepository reservationRepository,
            ReservationSeatRepository reservationSeatRepository,
            ShowtimeRepository showtimeRepository,
            UserRepository userRepository,
            SeatLockService seatLockService,
            PaymentService paymentService) {
        this.reservationRepository = reservationRepository;
        this.reservationSeatRepository = reservationSeatRepository;
        this.showtimeRepository = showtimeRepository;
        this.userRepository = userRepository;
        this.seatLockService = seatLockService;
        this.paymentService = paymentService;
    }

    /**
     * Executes end-to-end checkout with atomic PostgreSQL persistence and Redis lock cleanup.
     *
     * @param request the booking details containing showtime, seats, holdToken, and payment method
     * @param userId the ID of the authenticated user
     * @return BookingResponse with confirmed reference and allocated seats
     */
    @Override
    @Transactional
    public BookingResponse createBooking(BookingRequest request, Long userId) {
        log.info("Processing booking request for user {}, showtime {}, seats: {}",
                userId, request.getShowtimeId(), request.getSeatIds());

        // Step 1: Validate entity existence (Showtime and User)
        Showtime showtime = showtimeRepository.findById(request.getShowtimeId())
                .orElseThrow(() -> new NoSuchElementException("Showtime not found with ID: " + request.getShowtimeId()));

        User user = userRepository.findById(userId)
                .orElseThrow(() -> new NoSuchElementException("User not found with ID: " + userId));

        // Step 2: Validate distributed Redis lock ownership before charging
        boolean holdsLock = seatLockService.verifyLockOwnership(
                request.getShowtimeId(),
                userId,
                request.getHoldToken(),
                request.getSeatIds()
        );

        if (!holdsLock) {
            log.warn("User {} failed lock verification for showtime {} with token {}",
                    userId, request.getShowtimeId(), request.getHoldToken());
            throw new IllegalStateException("Your seat reservation hold has expired or is invalid. Please re-select your seats.");
        }

        // Step 3: Secondary defense check against PostgreSQL to prevent double-booking edge cases
        List<String> alreadyBookedSeats = reservationSeatRepository.findReservedSeatIdentifiers(request.getShowtimeId());
        for (String seatId : request.getSeatIds()) {
            if (alreadyBookedSeats.contains(seatId.toUpperCase())) {
                log.error("Seat {} is already permanently booked in showtime {}", seatId, request.getShowtimeId());
                throw new IllegalStateException("Seat " + seatId + " is already booked by another reservation.");
            }
        }

        // Step 4: Calculate total price using BigDecimal and getTicketPrice()
        BigDecimal ticketPrice = showtime.getTicketPrice();
        BigDecimal totalAmount = ticketPrice.multiply(BigDecimal.valueOf(request.getSeatIds().size()));

        // Step 5: Charge payment gateway
        PaymentResult paymentResult = paymentService.processPayment(
                totalAmount,
                request.getPaymentMethod(),
                request.getHoldToken()
        );

        if (!paymentResult.isSuccessful()) {
            log.warn("Payment failed for user {} during booking: {}", userId, paymentResult.getFailureReason());
            throw new IllegalStateException("Payment failed: " + paymentResult.getFailureReason());
        }

        // Step 6: Construct and persist the confirmed reservation entity
        String bookingReference = UUID.randomUUID().toString();
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);

        Reservation reservation = new Reservation();
        reservation.setBookingReference(bookingReference);
        reservation.setUser(user);
        reservation.setShowtime(showtime);
        reservation.setTotalAmount(totalAmount);
        reservation.setStatus("CONFIRMED");
        reservation.setCreatedAt(now);

        // Associate seats with reservation and showtime
        for (String seatId : request.getSeatIds()) {
            ReservationSeat seat = new ReservationSeat();
            seat.setShowtime(showtime);
            seat.setSeatIdentifier(seatId.toUpperCase());
            seat.setPrice(ticketPrice);
            reservation.addSeat(seat);
        }

        Reservation savedReservation = reservationRepository.save(reservation);
        log.info("Successfully persisted reservation ID {} with reference {}",
                savedReservation.getId(), savedReservation.getBookingReference());

        // Step 7: Release Redis lock keys since the seats are now permanently reserved in PostgreSQL
        seatLockService.releaseSeats(
                request.getShowtimeId(),
                userId,
                request.getHoldToken(),
                request.getSeatIds()
        );

        return mapToBookingResponse(savedReservation);
    }

    /**
     * Looks up reservation details by unique booking reference and validates user access.
     */
    @Override
    @Transactional(readOnly = true)
    public BookingResponse getBookingByReference(String bookingReference, Long userId) {
        Reservation reservation = reservationRepository.findByBookingReferenceWithSeats(bookingReference)
                .orElseThrow(() -> new NoSuchElementException("Reservation not found for reference: " + bookingReference));

        if (!reservation.getUser().getId().equals(userId)) {
            log.warn("User {} attempted unauthorized access to reservation reference {}", userId, bookingReference);
            throw new AccessDeniedException("You are not authorized to view this reservation.");
        }

        return mapToBookingResponse(reservation);
    }

    /**
     * Retrieves all reservations belonging to the authenticated user.
     */
    @Override
    @Transactional(readOnly = true)
    public List<BookingResponse> getUserBookings(Long userId) {
        return reservationRepository.findAll().stream()
                .filter(res -> res.getUser().getId().equals(userId))
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .map(this::mapToBookingResponse)
                .collect(Collectors.toList());
    }

    /**
     * Maps a Reservation entity into a clean BookingResponse DTO.
     */
    private BookingResponse mapToBookingResponse(Reservation reservation) {
        List<String> seatIds = reservation.getSeats().stream()
                .map(ReservationSeat::getSeatIdentifier)
                .collect(Collectors.toList());

        return new BookingResponse(
                reservation.getBookingReference(),
                reservation.getStatus(),
                reservation.getShowtime().getId(),
                reservation.getTotalAmount(),
                reservation.getCreatedAt(),
                seatIds
        );
    }
}