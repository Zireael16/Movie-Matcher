package com.app.moviematcher.catalog.service.impl;

import com.app.moviematcher.booking.repository.ReservationRepository;
import com.app.moviematcher.catalog.dto.MovieRequest;
import com.app.moviematcher.catalog.dto.MovieResponse;
import com.app.moviematcher.catalog.entity.Movie;
import com.app.moviematcher.catalog.entity.Showtime;
import com.app.moviematcher.catalog.repository.MovieRepository;
import com.app.moviematcher.catalog.repository.ShowtimeRepository;
import com.app.moviematcher.catalog.service.MovieService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementation of MovieService managing movie catalog lifecycle and persistence.
 */
@Service
public class MovieServiceImpl implements MovieService {

    private final MovieRepository movieRepository;
    private final ShowtimeRepository showtimeRepository;
    private final ReservationRepository reservationRepository;

    /**
     * Constructor injection without Lombok.
     */
    public MovieServiceImpl(MovieRepository movieRepository,
                            ShowtimeRepository showtimeRepository,
                            ReservationRepository reservationRepository) {
        this.movieRepository = movieRepository;
        this.showtimeRepository = showtimeRepository;
        this.reservationRepository = reservationRepository;
    }

    @Override
    @Transactional
    public MovieResponse createMovie(MovieRequest request) {
        // Enforce title uniqueness across the catalog
        if (movieRepository.existsByTitleIgnoreCase(request.getTitle().trim())) {
            throw new IllegalArgumentException("A movie with title '" + request.getTitle() + "' already exists");
        }

        Movie movie = new Movie(
                request.getTitle().trim(),
                request.getDescription(),
                request.getDurationMinutes(),
                request.getPosterUrl(),
                request.getImdbRating()
        );

        Movie savedMovie = movieRepository.save(movie);
        return MovieResponse.fromEntity(savedMovie);
    }

    @Override
    @Transactional(readOnly = true)
    public List<MovieResponse> getAllMovies() {
        return movieRepository.findAll()
                .stream()
                .map(MovieResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public MovieResponse getMovieById(Long id) {
        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Movie not found with ID: " + id));
        return MovieResponse.fromEntity(movie);
    }

    @Override
    @Transactional
    public MovieResponse updateMovie(Long id, MovieRequest request) {
        Movie existingMovie = movieRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Movie not found with ID: " + id));

        // If title changed, verify the new title doesn't conflict with another existing movie
        if (!existingMovie.getTitle().equalsIgnoreCase(request.getTitle().trim())) {
            if (movieRepository.existsByTitleIgnoreCase(request.getTitle().trim())) {
                throw new IllegalArgumentException("A movie with title '" + request.getTitle() + "' already exists");
            }
        }

        existingMovie.setTitle(request.getTitle().trim());
        existingMovie.setDescription(request.getDescription());
        existingMovie.setDurationMinutes(request.getDurationMinutes());
        existingMovie.setPosterUrl(request.getPosterUrl());
        existingMovie.setImdbRating(request.getImdbRating());

        Movie updatedMovie = movieRepository.save(existingMovie);
        return MovieResponse.fromEntity(updatedMovie);
    }

    /**
     * Handles movie removal by soft-cancelling linked showtimes and customer reservations
     * before deleting the movie record, preserving foreign key integrity and audit history.
     */
    @Override
    @Transactional
    public void deleteMovie(Long id) {
        Movie movie = movieRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Cannot delete: Movie not found with ID: " + id));

        List<Showtime> associatedShowtimes = movie.getShowtimes();
        if (associatedShowtimes != null && !associatedShowtimes.isEmpty()) {
            for (Showtime showtime : associatedShowtimes) {
                showtime.setStatus("CANCELLED");
                showtimeRepository.save(showtime);
                reservationRepository.cancelAllByShowtimeId(showtime.getId());
            }
        }

        movieRepository.delete(movie);
    }
}