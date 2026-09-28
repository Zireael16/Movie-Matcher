package com.app.moviematcher.catalog.service;

import com.app.moviematcher.catalog.dto.OmdbMovieResponseDTO;

/**
 * Service interface governing external integration with the OMDb API
 * to assist catalog administrators with automated movie detail lookups.
 */
public interface OmdbIntegrationService {

    /**
     * Queries OMDb for movie metadata by either IMDb identifier (e.g., "tt1375666")
     * or movie title string.
     *
     * @param query search query representing an IMDb ID or a title string
     * @return OmdbMovieResponseDTO populated with external metadata
     */
    OmdbMovieResponseDTO fetchMovieByImdbIdOrTitle(String query);
}