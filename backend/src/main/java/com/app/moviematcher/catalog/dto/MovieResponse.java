package com.app.moviematcher.catalog.dto;

import com.app.moviematcher.catalog.entity.Movie;

import java.time.OffsetDateTime;
import java.util.Objects;

/**
 * Data Transfer Object representing movie details returned to clients.
 */
public class MovieResponse {

    private Long id;
    private String title;
    private String description;
    private Integer durationMinutes;
    private String posterUrl;
    private String imdbRating;
    private OffsetDateTime createdAt;

    public MovieResponse() {
    }

    public MovieResponse(Long id,
                         String title,
                         String description,
                         Integer durationMinutes,
                         String posterUrl,
                         String imdbRating,
                         OffsetDateTime createdAt) {
        this.id = id;
        this.title = title;
        this.description = description;
        this.durationMinutes = durationMinutes;
        this.posterUrl = posterUrl;
        this.imdbRating = imdbRating;
        this.createdAt = createdAt;
    }

    /**
     * Factory mapper converting a Movie JPA entity into a clean response DTO.
     */
    public static MovieResponse fromEntity(Movie movie) {
        if (movie == null) {
            return null;
        }
        return new MovieResponse(
                movie.getId(),
                movie.getTitle(),
                movie.getDescription(),
                movie.getDurationMinutes(),
                movie.getPosterUrl(),
                movie.getImdbRating(),
                movie.getCreatedAt()
        );
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Integer getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(Integer durationMinutes) {
        this.durationMinutes = durationMinutes;
    }

    public String getPosterUrl() {
        return posterUrl;
    }

    public void setPosterUrl(String posterUrl) {
        this.posterUrl = posterUrl;
    }

    public String getImdbRating() {
        return imdbRating;
    }

    public void setImdbRating(String imdbRating) {
        this.imdbRating = imdbRating;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        MovieResponse that = (MovieResponse) o;
        return Objects.equals(id, that.id) &&
                Objects.equals(title, that.title) &&
                Objects.equals(description, that.description) &&
                Objects.equals(durationMinutes, that.durationMinutes) &&
                Objects.equals(posterUrl, that.posterUrl) &&
                Objects.equals(imdbRating, that.imdbRating) &&
                Objects.equals(createdAt, that.createdAt);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, title, description, durationMinutes, posterUrl, imdbRating, createdAt);
    }

    @Override
    public String toString() {
        return "MovieResponse{" +
                "id=" + id +
                ", title='" + title + '\'' +
                ", description='" + description + '\'' +
                ", durationMinutes=" + durationMinutes +
                ", posterUrl='" + posterUrl + '\'' +
                ", imdbRating='" + imdbRating + '\'' +
                ", createdAt=" + createdAt +
                '}';
    }
}