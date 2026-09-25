package com.app.moviematcher.booking.service;

import com.app.moviematcher.auth.entity.User;
import com.app.moviematcher.auth.repository.UserRepository;
import com.app.moviematcher.booking.dto.BookingRequest;
import com.app.moviematcher.booking.dto.BookingResponse;
import com.app.moviematcher.booking.dto.PaymentResult;
import com.app.moviematcher.booking.entity.Reservation;
import com.app.moviematcher.booking.entity.ReservationSeat;
import com.app.moviematcher.booking.repository.ReservationRepository;
import com.app.moviematcher.booking.repository.ReservationSeatRepository;
import com.app.moviematcher.booking.service.impl.BookingServiceImpl;
import com.app.moviematcher.catalog.entity.Showtime;
import com.app.moviematcher.catalog.repository.ShowtimeRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.junit.jupiter.MockitoSettings;
import org.mockito.quality.Strictness;
import org.springframework.security.access.AccessDeniedException;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.Collections;
import java.util.List;
import java.util.NoSuchElementException;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyList;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
@MockitoSettings(strictness = Strictness.LENIENT)
@DisplayName("BookingServiceImpl Unit Tests")
class BookingServiceImplTest {

    @Mock
    private ReservationRepository reservationRepository;

    @Mock
    private ReservationSeatRepository reservationSeatRepository;

    @Mock
    private ShowtimeRepository showtimeRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private SeatLockService seatLockService;

    @Mock
    private PaymentService paymentService;

    @InjectMocks
    private BookingServiceImpl bookingService;

    private User testUser;
    private Showtime testShowtime;
    private BookingRequest validRequest;

    @BeforeEach
    void setUp() {
        testUser = mock(User.class);
        when(testUser.getId()).thenReturn(100L);

        testShowtime = mock(Showtime.class);
        when(testShowtime.getId()).thenReturn(10L);

        validRequest = new BookingRequest();
        validRequest.setShowtimeId(10L);
        validRequest.setHoldToken("valid-hold-token-xyz");
        validRequest.setSeatIds(List.of("A1", "A2"));
        validRequest.setPaymentMethod("UPI");
    }

    @Nested
    @DisplayName("Create Booking Tests")
    class CreateBookingTests {

        @Test
        @DisplayName("Should successfully create booking when locks are valid and payment succeeds")
        void createBooking_Success() {
            when(testShowtime.getTicketPrice()).thenReturn(new BigDecimal("250.00"));
            when(showtimeRepository.findById(10L)).thenReturn(Optional.of(testShowtime));
            when(userRepository.findById(100L)).thenReturn(Optional.of(testUser));
            when(seatLockService.verifyLockOwnership(eq(10L), eq(100L), eq("valid-hold-token-xyz"), anyList()))
                    .thenReturn(true);
            when(reservationSeatRepository.findReservedSeatIdentifiers(10L))
                    .thenReturn(Collections.emptyList());

            BigDecimal expectedTotal = new BigDecimal("500.00");
            when(paymentService.processPayment(eq(expectedTotal), eq("UPI"), eq("valid-hold-token-xyz")))
                    .thenReturn(PaymentResult.success("TXN-12345", expectedTotal, "UPI", OffsetDateTime.now(ZoneOffset.UTC)));

            when(reservationRepository.save(any(Reservation.class))).thenAnswer(invocation -> {
                Reservation res = invocation.getArgument(0);
                res.setId(1L);
                return res;
            });

            BookingResponse response = bookingService.createBooking(validRequest, 100L);

            assertNotNull(response);
            assertNotNull(response.getBookingReference());
            assertEquals("CONFIRMED", response.getStatus());
            assertEquals(10L, response.getShowtimeId());
            assertEquals(expectedTotal, response.getTotalAmount());

            verify(reservationRepository).save(any(Reservation.class));
            verify(seatLockService).releaseSeats(10L, 100L, "valid-hold-token-xyz", List.of("A1", "A2"));
        }

        @Test
        @DisplayName("Should abort and throw IllegalStateException when Redis lock verification fails")
        void createBooking_Fails_WhenLockVerificationFails() {
            when(showtimeRepository.findById(10L)).thenReturn(Optional.of(testShowtime));
            when(userRepository.findById(100L)).thenReturn(Optional.of(testUser));
            when(seatLockService.verifyLockOwnership(eq(10L), eq(100L), eq("valid-hold-token-xyz"), anyList()))
                    .thenReturn(false);

            IllegalStateException exception = assertThrows(
                    IllegalStateException.class,
                    () -> bookingService.createBooking(validRequest, 100L)
            );

            assertTrue(exception.getMessage().contains("hold has expired or is invalid"));
            verify(paymentService, never()).processPayment(any(), any(), any());
            verify(reservationRepository, never()).save(any());
            verify(seatLockService, never()).releaseSeats(anyLong(), anyLong(), anyString(), anyList());
        }

        @Test
        @DisplayName("Should abort and throw IllegalStateException when seat already exists in database")
        void createBooking_Fails_WhenSeatAlreadyReservedInDb() {
            when(showtimeRepository.findById(10L)).thenReturn(Optional.of(testShowtime));
            when(userRepository.findById(100L)).thenReturn(Optional.of(testUser));
            when(seatLockService.verifyLockOwnership(eq(10L), eq(100L), eq("valid-hold-token-xyz"), anyList()))
                    .thenReturn(true);
            when(reservationSeatRepository.findReservedSeatIdentifiers(10L))
                    .thenReturn(List.of("A1"));

            IllegalStateException exception = assertThrows(
                    IllegalStateException.class,
                    () -> bookingService.createBooking(validRequest, 100L)
            );

            assertTrue(exception.getMessage().contains("already booked"));
            verify(paymentService, never()).processPayment(any(), any(), any());
            verify(reservationRepository, never()).save(any());
        }

        @Test
        @DisplayName("Should abort and throw IllegalStateException when payment gateway declines")
        void createBooking_Fails_WhenPaymentDeclined() {
            when(testShowtime.getTicketPrice()).thenReturn(new BigDecimal("250.00"));
            when(showtimeRepository.findById(10L)).thenReturn(Optional.of(testShowtime));
            when(userRepository.findById(100L)).thenReturn(Optional.of(testUser));
            when(seatLockService.verifyLockOwnership(eq(10L), eq(100L), eq("valid-hold-token-xyz"), anyList()))
                    .thenReturn(true);
            when(reservationSeatRepository.findReservedSeatIdentifiers(10L))
                    .thenReturn(Collections.emptyList());

            BigDecimal expectedTotal = new BigDecimal("500.00");
            when(paymentService.processPayment(eq(expectedTotal), eq("UPI"), eq("valid-hold-token-xyz")))
                    .thenReturn(PaymentResult.failure(expectedTotal, "UPI", "Insufficient funds", OffsetDateTime.now(ZoneOffset.UTC)));

            IllegalStateException exception = assertThrows(
                    IllegalStateException.class,
                    () -> bookingService.createBooking(validRequest, 100L)
            );

            assertTrue(exception.getMessage().contains("Payment failed"));
            verify(reservationRepository, never()).save(any());
            verify(seatLockService, never()).releaseSeats(anyLong(), anyLong(), anyString(), anyList());
        }

        @Test
        @DisplayName("Should throw NoSuchElementException when Showtime ID is not found")
        void createBooking_Fails_WhenShowtimeNotFound() {
            when(showtimeRepository.findById(999L)).thenReturn(Optional.empty());

            validRequest.setShowtimeId(999L);

            assertThrows(
                    NoSuchElementException.class,
                    () -> bookingService.createBooking(validRequest, 100L)
            );
            verify(seatLockService, never()).verifyLockOwnership(anyLong(), anyLong(), anyString(), anyList());
        }
    }

    @Nested
    @DisplayName("Get Booking Tests")
    class GetBookingTests {

        @Test
        @DisplayName("Should return booking details when requester is the owner")
        void getBookingByReference_Success() {
            Reservation reservation = new Reservation();
            reservation.setBookingReference("test-ref-001");
            reservation.setUser(testUser);
            reservation.setShowtime(testShowtime);
            reservation.setStatus("CONFIRMED");
            reservation.setTotalAmount(new BigDecimal("250.00"));
            reservation.setCreatedAt(OffsetDateTime.now(ZoneOffset.UTC));

            ReservationSeat dummySeat = new ReservationSeat();
            dummySeat.setSeatIdentifier("A1");
            dummySeat.setPrice(new BigDecimal("250.00"));
            reservation.addSeat(dummySeat);

            when(reservationRepository.findByBookingReferenceWithSeats("test-ref-001"))
                    .thenReturn(Optional.of(reservation));

            BookingResponse response = bookingService.getBookingByReference("test-ref-001", 100L);

            assertNotNull(response);
            assertEquals("test-ref-001", response.getBookingReference());
            assertEquals("CONFIRMED", response.getStatus());
        }

        @Test
        @DisplayName("Should throw AccessDeniedException when another user attempts access")
        void getBookingByReference_ThrowsAccessDenied_WhenUserMismatch() {
            User differentUser = mock(User.class);
            when(differentUser.getId()).thenReturn(100L);

            Reservation reservation = new Reservation();
            reservation.setBookingReference("test-ref-001");
            reservation.setUser(differentUser);

            when(reservationRepository.findByBookingReferenceWithSeats("test-ref-001"))
                    .thenReturn(Optional.of(reservation));

            assertThrows(
                    AccessDeniedException.class,
                    () -> bookingService.getBookingByReference("test-ref-001", 200L)
            );
        }
    }
}