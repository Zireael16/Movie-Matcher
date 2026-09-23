package com.app.moviematcher.catalog.dto;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

/**
 * Data Transfer Object representing the full theater seat matrix and screening metadata.
 * Sent to the client to render the interactive seat map and price summaries.
 */
public class SeatLayoutResponseDTO {
    private Long showtimeId;
    private Long movieId;
    private String movieTitle;
    private Long screenId;
    private String screenName;
    private Instant startTime;
    private Instant endTime;
    private BigDecimal basePrice;
    private Integer totalRows;
    private Integer totalColumns;
    private List<SeatDTO> seats;

    public SeatLayoutResponseDTO() {
    }

    public SeatLayoutResponseDTO(Long showtimeId, Long movieId, String movieTitle, Long screenId,
                                 String screenName, Instant startTime, Instant endTime,
                                 BigDecimal basePrice, Integer totalRows, Integer totalColumns,
                                 List<SeatDTO> seats) {
        this.showtimeId = showtimeId;
        this.movieId = movieId;
        this.movieTitle = movieTitle;
        this.screenId = screenId;
        this.screenName = screenName;
        this.startTime = startTime;
        this.endTime = endTime;
        this.basePrice = basePrice;
        this.totalRows = totalRows;
        this.totalColumns = totalColumns;
        this.seats = seats;
    }

    public Long getShowtimeId() {
        return showtimeId;
    }

    public void setShowtimeId(Long showtimeId) {
        this.showtimeId = showtimeId;
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

    public Instant getStartTime() {
        return startTime;
    }

    public void setStartTime(Instant startTime) {
        this.startTime = startTime;
    }

    public Instant getEndTime() {
        return endTime;
    }

    public void setEndTime(Instant endTime) {
        this.endTime = endTime;
    }

    public BigDecimal getBasePrice() {
        return basePrice;
    }

    public void setBasePrice(BigDecimal basePrice) {
        this.basePrice = basePrice;
    }

    public Integer getTotalRows() {
        return totalRows;
    }

    public void setTotalRows(Integer totalRows) {
        this.totalRows = totalRows;
    }

    public Integer getTotalColumns() {
        return totalColumns;
    }

    public void setTotalColumns(Integer totalColumns) {
        this.totalColumns = totalColumns;
    }

    public List<SeatDTO> getSeats() {
        return seats;
    }

    public void setSeats(List<SeatDTO> seats) {
        this.seats = seats;
    }
}