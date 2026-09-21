package com.app.moviematcher.catalog.repository;

import com.app.moviematcher.catalog.entity.Movie;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Spring Data JPA repository for Movie entities.
 * Provides standard CRUD operations and custom query methods.
 */
@Repository
public interface MovieRepository extends JpaRepository<Movie, Long> {

    /**
     * Checks if a movie with the exact given title already exists.
     * Useful for preventing duplicate title additions.
     *
     * @param title the movie title to check
     * @return true if a movie exists with the given title
     */
    boolean existsByTitleIgnoreCase(String title);

    /**
     * Finds a movie by title ignoring case.
     *
     * @param title the movie title
     * @return an Optional containing the movie if found
     */
    Optional<Movie> findByTitleIgnoreCase(String title);
}