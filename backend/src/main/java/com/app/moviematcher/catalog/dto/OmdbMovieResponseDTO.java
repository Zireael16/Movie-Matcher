package com.app.moviematcher.catalog.dto;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;

import java.util.Objects;

@JsonIgnoreProperties(ignoreUnknown = true)
public class OmdbMovieResponseDTO {

    @JsonProperty("Title")
    private String title;

    @JsonProperty("Plot")
    private String description;

    @JsonProperty("Poster")
    private String posterUrl;

    @JsonProperty("Genre")
    private String genre;

    @JsonProperty("Runtime")
    private String runtime;

    private Integer runtimeMinutes;

    @JsonProperty("imdbRating")
    private String imdbRating;

    @JsonProperty("Response")
    private String response;

    @JsonProperty("Error")
    private String error;

    public OmdbMovieResponseDTO() {
    }

    public OmdbMovieResponseDTO(String title,
                                String description,
                                String posterUrl,
                                String genre,
                                String runtime,
                                String imdbRating,
                                String response,
                                String error) {
        this.title = title;
        this.description = description;
        this.posterUrl = posterUrl;
        this.genre = genre;
        this.runtime = runtime;
        this.runtimeMinutes = parseRuntimeMinutes(runtime);
        this.imdbRating = imdbRating;
        this.response = response;
        this.error = error;
    }

    private Integer parseRuntimeMinutes(String runtimeStr) {
        if (runtimeStr == null || runtimeStr.trim().isEmpty() || "N/A".equalsIgnoreCase(runtimeStr)) {
            return null;
        }
        try {
            String digits = runtimeStr.replaceAll("[^0-9]", "");
            return digits.isEmpty() ? null : Integer.parseInt(digits);
        } catch (NumberFormatException e) {
            return null;
        }
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

    public String getPosterUrl() {
        return posterUrl;
    }

    public void setPosterUrl(String posterUrl) {
        this.posterUrl = posterUrl;
    }

    public String getGenre() {
        return genre;
    }

    public void setGenre(String genre) {
        this.genre = genre;
    }

    public String getRuntime() {
        return runtime;
    }

    public void setRuntime(String runtime) {
        this.runtime = runtime;
        this.runtimeMinutes = parseRuntimeMinutes(runtime);
    }

    public Integer getRuntimeMinutes() {
        return runtimeMinutes != null ? runtimeMinutes : parseRuntimeMinutes(this.runtime);
    }

    public void setRuntimeMinutes(Integer runtimeMinutes) {
        this.runtimeMinutes = runtimeMinutes;
    }

    public String getImdbRating() {
        return imdbRating;
    }

    public void setImdbRating(String imdbRating) {
        this.imdbRating = imdbRating;
    }

    public String getResponse() {
        return response;
    }

    public void setResponse(String response) {
        this.response = response;
    }

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        OmdbMovieResponseDTO that = (OmdbMovieResponseDTO) o;
        return Objects.equals(title, that.title) &&
                Objects.equals(description, that.description) &&
                Objects.equals(posterUrl, that.posterUrl) &&
                Objects.equals(genre, that.genre) &&
                Objects.equals(runtime, that.runtime) &&
                Objects.equals(runtimeMinutes, that.runtimeMinutes) &&
                Objects.equals(imdbRating, that.imdbRating) &&
                Objects.equals(response, that.response) &&
                Objects.equals(error, that.error);
    }

    @Override
    public int hashCode() {
        return Objects.hash(title, description, posterUrl, genre, runtime, runtimeMinutes, imdbRating, response, error);
    }

    @Override
    public String toString() {
        return "OmdbMovieResponseDTO{" +
                "title='" + title + '\'' +
                ", description='" + description + '\'' +
                ", posterUrl='" + posterUrl + '\'' +
                ", genre='" + genre + '\'' +
                ", runtime='" + runtime + '\'' +
                ", runtimeMinutes=" + runtimeMinutes +
                ", imdbRating='" + imdbRating + '\'' +
                ", response='" + response + '\'' +
                ", error='" + error + '\'' +
                '}';
    }
}