package com.app.moviematcher.catalog.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

/**
 * Data Transfer Object for creating or updating a Showtime.
 * Applied across POST/PUT /api/v1/showtimes endpoints.
 */
public class ShowtimeRequest {

    @NotNull(message = "Movie ID is required")
    private Long movieId;

    @NotNull(message = "Screen ID is required")
    private Long screenId;

    @NotNull(message = "Start time is required")
    private OffsetDateTime startTime;

    @NotNull(message = "Ticket price is required")
    @DecimalMin(value = "0.00", inclusive = true, message = "Ticket price cannot be negative")
    private BigDecimal ticketPrice;

    public ShowtimeRequest() {
    }

    public ShowtimeRequest(Long movieId, Long screenId, OffsetDateTime startTime, BigDecimal ticketPrice) {
        this.movieId = movieId;
        this.screenId = screenId;
        this.startTime = startTime;
        this.ticketPrice = ticketPrice;
    }

    public Long getMovieId() {
        return movieId;
    }

    public void setMovieId(Long movieId) {
        this.movieId = movieId;
    }

    public Long getScreenId() {
        return screenId;
    }

    public void setScreenId(Long screenId) {
        this.screenId = screenId;
    }

    public OffsetDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(OffsetDateTime startTime) {
        this.startTime = startTime;
    }

    public BigDecimal getTicketPrice() {
        return ticketPrice;
    }

    public void setTicketPrice(BigDecimal ticketPrice) {
        this.ticketPrice = ticketPrice;
    }
}