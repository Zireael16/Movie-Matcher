package com.app.moviematcher.catalog.service;

import com.app.moviematcher.catalog.dto.ShowtimeRequest;
import com.app.moviematcher.catalog.dto.ShowtimeResponse;

import java.time.LocalDate;
import java.util.List;

/**
 * Service contract defining operations for scheduling and managing movie showtimes.
 */
public interface ShowtimeService {

    /**
     * Schedules a new showtime after verifying screen availability and calculating runtime end time.
     *
     * @param request payload containing movieId, screenId, startTime, and ticketPrice
     * @return persisted showtime data as ShowtimeResponse
     */
    ShowtimeResponse createShowtime(ShowtimeRequest request);

    /**
     * Retrieves all scheduled showtimes with eager details (Movie and Screen).
     *
     * @return list of ShowtimeResponse DTOs
     */
    List<ShowtimeResponse> getAllShowtimes();

    /**
     * Retrieves all showtimes scheduled for a specific movie.
     *
     * @param movieId unique identifier of the movie
     * @return list of ShowtimeResponse DTOs
     */
    List<ShowtimeResponse> getShowtimesByMovieId(Long movieId);

    /**
     * Retrieves all showtimes scheduled for a specific movie on a specific calendar date.
     *
     * @param movieId unique identifier of the movie
     * @param date target calendar date
     * @return list of ShowtimeResponse DTOs scheduled on that date
     */
    List<ShowtimeResponse> getShowtimesByMovieIdAndDate(Long movieId, LocalDate date);

    /**
     * Retrieves a single showtime by its ID.
     *
     * @param id showtime unique identifier
     * @return ShowtimeResponse DTO
     */
    ShowtimeResponse getShowtimeById(Long id);

    /**
     * Cancels / deletes a scheduled showtime.
     *
     * @param id showtime unique identifier
     */
    void deleteShowtime(Long id);
}