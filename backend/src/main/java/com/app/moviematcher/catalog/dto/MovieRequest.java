package com.app.moviematcher.catalog.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.Objects;

/**
 * Data Transfer Object for creating or updating a Movie.
 * Applied across POST/PUT /api/v1/movies endpoints.
 */
public class MovieRequest {

    @NotBlank(message = "Movie title is required")
    @Size(max = 255, message = "Movie title must not exceed 255 characters")
    private String title;

    private String description;

    @NotNull(message = "Duration in minutes is required")
    @Min(value = 1, message = "Duration must be at least 1 minute")
    private Integer durationMinutes;

    @Size(max = 1024, message = "Poster URL must not exceed 1024 characters")
    private String posterUrl;

    @Size(max = 10, message = "IMDb rating must not exceed 10 characters")
    private String imdbRating;

    public MovieRequest() {
    }

    public MovieRequest(String title, String description, Integer durationMinutes) {
        this.title = title;
        this.description = description;
        this.durationMinutes = durationMinutes;
    }

    public MovieRequest(String title, String description, Integer durationMinutes, String posterUrl, String imdbRating) {
        this.title = title;
        this.description = description;
        this.durationMinutes = durationMinutes;
        this.posterUrl = posterUrl;
        this.imdbRating = imdbRating;
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

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        MovieRequest that = (MovieRequest) o;
        return Objects.equals(title, that.title) &&
                Objects.equals(description, that.description) &&
                Objects.equals(durationMinutes, that.durationMinutes) &&
                Objects.equals(posterUrl, that.posterUrl) &&
                Objects.equals(imdbRating, that.imdbRating);
    }

    @Override
    public int hashCode() {
        return Objects.hash(title, description, durationMinutes, posterUrl, imdbRating);
    }

    @Override
    public String toString() {
        return "MovieRequest{" +
                "title='" + title + '\'' +
                ", description='" + description + '\'' +
                ", durationMinutes=" + durationMinutes +
                ", posterUrl='" + posterUrl + '\'' +
                ", imdbRating='" + imdbRating + '\'' +
                '}';
    }
}