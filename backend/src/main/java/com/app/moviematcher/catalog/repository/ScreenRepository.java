package com.app.moviematcher.catalog.repository;

import com.app.moviematcher.catalog.entity.Screen;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Spring Data JPA repository for Screen entities.
 * Handles database access for auditorium and screen configurations.
 */
@Repository
public interface ScreenRepository extends JpaRepository<Screen, Long> {

    /**
     * Checks if a screen with the given name already exists.
     * Prevents duplicate screen naming during administrative creation.
     *
     * @param name the screen name to check
     * @return true if a screen exists with that name
     */
    boolean existsByNameIgnoreCase(String name);

    /**
     * Finds a screen by name ignoring case.
     *
     * @param name the screen name
     * @return an Optional containing the screen if found
     */
    Optional<Screen> findByNameIgnoreCase(String name);
}