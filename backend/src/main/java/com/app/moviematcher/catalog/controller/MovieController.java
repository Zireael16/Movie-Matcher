package com.app.moviematcher.catalog.controller;

import com.app.moviematcher.catalog.dto.MovieRequest;
import com.app.moviematcher.catalog.dto.MovieResponse;
import com.app.moviematcher.catalog.dto.ShowtimeResponse;
import com.app.moviematcher.catalog.service.MovieService;
import com.app.moviematcher.catalog.service.ShowtimeService;
import jakarta.validation.Valid;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDate;
import java.util.List;

/**
 * REST controller managing Movie catalog resources.
 * Public reads, Admin-only writes.
 */
@RestController
@RequestMapping("/api/v1/movies")
public class MovieController {

    private final MovieService movieService;
    private final ShowtimeService showtimeService;

    public MovieController(MovieService movieService, ShowtimeService showtimeService) {
        this.movieService = movieService;
        this.showtimeService = showtimeService;
    }

    /**
     * Creates a new movie entry. Admin-only operation.
     */
    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MovieResponse> createMovie(@Valid @RequestBody MovieRequest request) {
        MovieResponse response = movieService.createMovie(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    /**
     * Lists all movies in the catalog. Open to public.
     */
    @GetMapping
    public ResponseEntity<List<MovieResponse>> getAllMovies() {
        return ResponseEntity.ok(movieService.getAllMovies());
    }

    /**
     * Retrieves a single movie by its ID. Open to public.
     */
    @GetMapping("/{id}")
    public ResponseEntity<MovieResponse> getMovieById(@PathVariable Long id) {
        return ResponseEntity.ok(movieService.getMovieById(id));
    }

    /**
     * Retrieves showtimes for a specific movie.
     * If a date parameter (?date=YYYY-MM-DD) is provided, filters by that day.
     * Otherwise, returns all scheduled showtimes for the movie. Open to public.
     *
     * @param id unique identifier of the movie
     * @param date optional calendar date in ISO format (YYYY-MM-DD)
     * @return list of matching showtimes
     */
    @GetMapping("/{id}/showtimes")
    public ResponseEntity<List<ShowtimeResponse>> getShowtimesByMovie(
            @PathVariable Long id,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        if (date != null) {
            return ResponseEntity.ok(showtimeService.getShowtimesByMovieIdAndDate(id, date));
        }
        return ResponseEntity.ok(showtimeService.getShowtimesByMovieId(id));
    }

    /**
     * Updates an existing movie's details. Admin-only operation.
     */
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<MovieResponse> updateMovie(@PathVariable Long id,
                                                     @Valid @RequestBody MovieRequest request) {
        return ResponseEntity.ok(movieService.updateMovie(id, request));
    }

    /**
     * Deletes a movie and cascades to scheduled showtimes. Admin-only operation.
     */
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Void> deleteMovie(@PathVariable Long id) {
        movieService.deleteMovie(id);
        return ResponseEntity.noContent().build();
    }
}