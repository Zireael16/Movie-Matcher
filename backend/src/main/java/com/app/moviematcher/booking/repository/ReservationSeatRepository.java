package com.app.moviematcher.booking.repository;

import com.app.moviematcher.booking.entity.ReservationSeat;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReservationSeatRepository extends JpaRepository<ReservationSeat, Long> {

    @Query("SELECT rs.seatIdentifier FROM ReservationSeat rs WHERE rs.showtime.id = :showtimeId")
    List<String> findReservedSeatIdentifiers(@Param("showtimeId") Long showtimeId);

    List<ReservationSeat> findByShowtimeId(Long showtimeId);
}