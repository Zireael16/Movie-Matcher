package com.app.moviematcher.catalog.controller;

import com.app.moviematcher.catalog.dto.SeatLayoutResponseDTO;
import com.app.moviematcher.catalog.dto.ShowtimeRequest;
import com.app.moviematcher.catalog.dto.ShowtimeResponse;
import com.app.moviematcher.catalog.service.ShowtimeSeatService;
import com.app.moviematcher.catalog.service.ShowtimeService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

/**
 * REST controller managing theater Showtimes and seat inventory layouts.
 * Enforces admin authority for scheduling and cancellation.
 * Seat maps and schedule queries are open to the public.
 */
@RestController
@RequestMapping("/api/v1/showtimes")
public class ShowtimeController {

    private final ShowtimeService showtimeService;
    private final ShowtimeSeatService showtimeSeatService;

    public ShowtimeController(ShowtimeService showtimeService, ShowtimeSeatService showtimeSeatService) {
        this.showtimeService = showtimeService;
        this.showtimeSeatService = showtimeSeatService;
    }

    /**
     * Schedules a new showtime. Admin-only operation.
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<ShowtimeResponse> createShowtime(@Valid @RequestBody ShowtimeRequest request) {
        ShowtimeResponse response = showtimeService.createShowtime(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Lists all scheduled showtimes. Open to public.
     */
    @GetMapping
    public ResponseEntity<List<ShowtimeResponse>> getAllShowtimes() {
        return ResponseEntity.ok(showtimeService.getAllShowtimes());
    }

    /**
     * Retrieves all showtimes scheduled for a specific movie. Open to public.
     */
    @GetMapping("/movie/{movieId}")
    public ResponseEntity<List<ShowtimeResponse>> getShowtimesByMovieId(@PathVariable Long movieId) {
        return ResponseEntity.ok(showtimeService.getShowtimesByMovieId(movieId));
    }

    /**
     * Retrieves details for a specific showtime. Open to public.
     */
    @GetMapping("/{id}")
    public ResponseEntity<ShowtimeResponse> getShowtimeById(@PathVariable Long id) {
        return ResponseEntity.ok(showtimeService.getShowtimeById(id));
    }

    /**
     * Retrieves the complete interactive seat layout matrix and pricing tiers for a showtime.
     * Open to public.
     *
     * @param id showtime unique identifier
     * @return SeatLayoutResponseDTO containing screen dimensions, metadata, and all seats
     */
    @GetMapping("/{id}/seats")
    public ResponseEntity<SeatLayoutResponseDTO> getSeatLayout(@PathVariable Long id) {
        return ResponseEntity.ok(showtimeSeatService.getSeatLayout(id));
    }

    /**
     * Cancels a scheduled showtime. Admin-only operation.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteShowtime(@PathVariable Long id) {
        showtimeService.deleteShowtime(id);
        return ResponseEntity.noContent().build();
    }
}