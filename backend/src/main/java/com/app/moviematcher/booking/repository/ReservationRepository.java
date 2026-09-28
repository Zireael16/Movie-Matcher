package com.app.moviematcher.booking.repository;

import com.app.moviematcher.booking.entity.Reservation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {

    Optional<Reservation> findByBookingReference(String bookingReference);

    @Query("SELECT r FROM Reservation r LEFT JOIN FETCH r.seats WHERE r.bookingReference = :reference")
    Optional<Reservation> findByBookingReferenceWithSeats(@Param("reference") String reference);

    @Query("SELECT DISTINCT r FROM Reservation r LEFT JOIN FETCH r.seats WHERE r.user.id = :userId ORDER BY r.createdAt DESC")
    List<Reservation> findByUserIdWithSeatsOrderByCreatedAtDesc(@Param("userId") Long userId);

    @Query("SELECT r FROM Reservation r WHERE r.showtime.id = :showtimeId")
    List<Reservation> findByShowtimeId(@Param("showtimeId") Long showtimeId);

    @Modifying
    @Query("UPDATE Reservation r SET r.status = 'CANCELLED' WHERE r.showtime.id = :showtimeId AND r.status <> 'CANCELLED'")
    int cancelAllByShowtimeId(@Param("showtimeId") Long showtimeId);
}