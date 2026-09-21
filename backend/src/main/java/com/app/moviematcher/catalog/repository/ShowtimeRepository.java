package com.app.moviematcher.catalog.repository;

import com.app.moviematcher.catalog.entity.Showtime;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;

/**
 * Spring Data JPA repository for Showtime entities.
 * Includes optimized query methods with fetch joins and interval overlap detection.
 */
@Repository
public interface ShowtimeRepository extends JpaRepository<Showtime, Long> {

    /**
     * Eagerly loads all Showtimes with their associated Movie and Screen
     * in a single query to eliminate the N+1 select problem when listing schedules.
     */
    @Query("SELECT s FROM Showtime s " +
            "JOIN FETCH s.movie " +
            "JOIN FETCH s.screen " +
            "ORDER BY s.startTime ASC")
    List<Showtime> findAllWithDetails();

    /**
     * Retrieves all showtimes for a specific movie, ordered chronologically.
     * Uses JOIN FETCH so downstream consumers have movie and screen metadata immediately.
     */
    @Query("SELECT s FROM Showtime s " +
            "JOIN FETCH s.movie " +
            "JOIN FETCH s.screen " +
            "WHERE s.movie.id = :movieId " +
            "ORDER BY s.startTime ASC")
    List<Showtime> findByMovieIdWithDetails(@Param("movieId") Long movieId);

    /**
     * Checks if any existing showtime on the target screen overlaps with the requested interval.
     *
     * Overlap rule: (existing.startTime < new.endTime) AND (existing.endTime > new.startTime).
     * Back-to-back showtimes (e.g. existing ends at 14:00 and new starts at 14:00) are permitted.
     *
     * @param screenId ID of the screen being scheduled
     * @param startTime requested screening start time
     * @param endTime computed screening end time (startTime + movie.duration)
     * @return true if an overlapping showtime exists, false otherwise
     */
    @Query("SELECT COUNT(s) > 0 FROM Showtime s " +
            "WHERE s.screen.id = :screenId " +
            "AND s.startTime < :endTime " +
            "AND s.endTime > :startTime")
    boolean existsOverlappingShowtime(@Param("screenId") Long screenId,
                                      @Param("startTime") OffsetDateTime startTime,
                                      @Param("endTime") OffsetDateTime endTime);

    /**
     * Overlap check for UPDATING an existing showtime, excluding itself from the collision check.
     */
    @Query("SELECT COUNT(s) > 0 FROM Showtime s " +
            "WHERE s.screen.id = :screenId " +
            "AND s.id <> :showtimeId " +
            "AND s.startTime < :endTime " +
            "AND s.endTime > :startTime")
    boolean existsOverlappingShowtimeExcludingSelf(@Param("screenId") Long screenId,
                                                   @Param("showtimeId") Long showtimeId,
                                                   @Param("startTime") OffsetDateTime startTime,
                                                   @Param("endTime") OffsetDateTime endTime);
}