package com.app.moviematcher.catalog.service.impl;

import com.app.moviematcher.catalog.dto.OmdbMovieResponseDTO;
import com.app.moviematcher.catalog.service.OmdbIntegrationService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.util.NoSuchElementException;

@Service
public class OmdbIntegrationServiceImpl implements OmdbIntegrationService {

    private static final Logger log = LoggerFactory.getLogger(OmdbIntegrationServiceImpl.class);

    private final RestClient restClient;
    private final String omdbApiUrl;
    private final String omdbApiKey;

    public OmdbIntegrationServiceImpl(
            RestClient.Builder restClientBuilder,
            @Value("${omdb.api.url:https://www.omdbapi.com}") String omdbApiUrl,
            @Value("${omdb.api.key:}") String omdbApiKey) {
        this.restClient = restClientBuilder.build();
        this.omdbApiUrl = omdbApiUrl;
        this.omdbApiKey = omdbApiKey;
    }

    @Override
    public OmdbMovieResponseDTO fetchMovieByImdbIdOrTitle(String query) {
        if (query == null || query.trim().isEmpty()) {
            throw new IllegalArgumentException("Search query must not be empty.");
        }

        String sanitizedQuery = query.trim();
        boolean isImdbId = sanitizedQuery.toLowerCase().startsWith("tt");

        log.info("Executing OMDb movie lookup for query: '{}' (Mode: {})",
                sanitizedQuery, isImdbId ? "IMDb ID" : "Title");

        OmdbMovieResponseDTO responseDTO = restClient.get()
                .uri(omdbApiUrl, uriBuilder -> {
                    uriBuilder.queryParam("apikey", omdbApiKey);
                    if (isImdbId) {
                        uriBuilder.queryParam("i", sanitizedQuery);
                    } else {
                        uriBuilder.queryParam("t", sanitizedQuery);
                    }
                    return uriBuilder.build();
                })
                .retrieve()
                .body(OmdbMovieResponseDTO.class);

        if (responseDTO == null || "False".equalsIgnoreCase(responseDTO.getResponse())) {
            String errorMsg = (responseDTO != null && responseDTO.getError() != null)
                    ? responseDTO.getError()
                    : "Movie not found on OMDb with query: " + sanitizedQuery;
            log.warn("OMDb lookup failed: {}", errorMsg);
            throw new NoSuchElementException(errorMsg);
        }

        log.info("Successfully retrieved movie '{}' from OMDb", responseDTO.getTitle());
        return responseDTO;
    }
}