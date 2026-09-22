package com.app.moviematcher.catalog.service;

import com.app.moviematcher.catalog.dto.MovieRequest;
import com.app.moviematcher.catalog.dto.MovieResponse;

import java.util.List;

/**
 * Service contract defining operations for movie catalog management.
 */
public interface MovieService {

    /**
     * Creates and persists a new movie entry.
     *
     * @param request movie payload with title, description, and runtime duration
     * @return persisted movie data as MovieResponse
     */
    MovieResponse createMovie(MovieRequest request);

    /**
     * Retrieves all movies currently registered in the catalog.
     *
     * @return list of MovieResponse DTOs
     */
    List<MovieResponse> getAllMovies();

    /**
     * Retrieves a single movie by its primary ID.
     *
     * @param id movie unique identifier
     * @return MovieResponse DTO
     */
    MovieResponse getMovieById(Long id);

    /**
     * Updates an existing movie's title, description, or runtime duration.
     *
     * @param id movie unique identifier
     * @param request updated movie details
     * @return updated MovieResponse DTO
     */
    MovieResponse updateMovie(Long id, MovieRequest request);

    /**
     * Deletes a movie and cascades to scheduled showtimes.
     *
     * @param id movie unique identifier
     */
    void deleteMovie(Long id);
}