package com.app.moviematcher.catalog.dto;

import com.app.moviematcher.catalog.entity.Showtime;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

/**
 * Data Transfer Object representing scheduled showtime details returned to clients.
 */
public class ShowtimeResponse {

    private Long id;
    private Long movieId;
    private String movieTitle;
    private Integer durationMinutes;
    private Long screenId;
    private String screenName;
    private Integer totalCapacity;
    private OffsetDateTime startTime;
    private OffsetDateTime endTime;
    private BigDecimal ticketPrice;

    public ShowtimeResponse() {
    }

    public ShowtimeResponse(Long id, Long movieId, String movieTitle, Integer durationMinutes,
                            Long screenId, String screenName, Integer totalCapacity,
                            OffsetDateTime startTime, OffsetDateTime endTime, BigDecimal ticketPrice) {
        this.id = id;
        this.movieId = movieId;
        this.movieTitle = movieTitle;
        this.durationMinutes = durationMinutes;
        this.screenId = screenId;
        this.screenName = screenName;
        this.totalCapacity = totalCapacity;
        this.startTime = startTime;
        this.endTime = endTime;
        this.ticketPrice = ticketPrice;
    }

    /**
     * Factory mapper converting a Showtime JPA entity into a ShowtimeResponse DTO.
     */
    public static ShowtimeResponse fromEntity(Showtime showtime) {
        return new ShowtimeResponse(
                showtime.getId(),
                showtime.getMovie().getId(),
                showtime.getMovie().getTitle(),
                showtime.getMovie().getDurationMinutes(),
                showtime.getScreen().getId(),
                showtime.getScreen().getName(),
                showtime.getScreen().getTotalCapacity(),
                showtime.getStartTime(),
                showtime.getEndTime(),
                showtime.getTicketPrice()
        );
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getMovieId() {
        return movieId;
    }

    public void setMovieId(Long movieId) {
        this.movieId = movieId;
    }

    public String getMovieTitle() {
        return movieTitle;
    }

    public void setMovieTitle(String movieTitle) {
        this.movieTitle = movieTitle;
    }

    public Integer getDurationMinutes() {
        return durationMinutes;
    }

    public void setDurationMinutes(Integer durationMinutes) {
        this.durationMinutes = durationMinutes;
    }

    public Long getScreenId() {
        return screenId;
    }

    public void setScreenId(Long screenId) {
        this.screenId = screenId;
    }

    public String getScreenName() {
        return screenName;
    }

    public void setScreenName(String screenName) {
        this.screenName = screenName;
    }

    public Integer getTotalCapacity() {
        return totalCapacity;
    }

    public void setTotalCapacity(Integer totalCapacity) {
        this.totalCapacity = totalCapacity;
    }

    public OffsetDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(OffsetDateTime startTime) {
        this.startTime = startTime;
    }

    public OffsetDateTime getEndTime() {
        return endTime;
    }

    public void setEndTime(OffsetDateTime endTime) {
        this.endTime = endTime;
    }

    public BigDecimal getTicketPrice() {
        return ticketPrice;
    }

    public void setTicketPrice(BigDecimal ticketPrice) {
        this.ticketPrice = ticketPrice;
    }
}