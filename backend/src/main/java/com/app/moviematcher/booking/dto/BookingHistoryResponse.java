package com.app.moviematcher.booking.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.UUID;

public class BookingHistoryResponse {

    private UUID bookingReference;
    private Long showtimeId;
    private String movieTitle;
    private String screenName;
    private OffsetDateTime startTime;
    private OffsetDateTime endTime;
    private BigDecimal totalAmount;
    private String status;
    private OffsetDateTime createdAt;
    private List<String> seatIdentifiers;

    public BookingHistoryResponse() {
        this.seatIdentifiers = new ArrayList<>();
    }

    public BookingHistoryResponse(UUID bookingReference,
                                  Long showtimeId,
                                  String movieTitle,
                                  String screenName,
                                  OffsetDateTime startTime,
                                  OffsetDateTime endTime,
                                  BigDecimal totalAmount,
                                  String status,
                                  OffsetDateTime createdAt,
                                  List<String> seatIdentifiers) {
        this.bookingReference = bookingReference;
        this.showtimeId = showtimeId;
        this.movieTitle = movieTitle;
        this.screenName = screenName;
        this.startTime = startTime;
        this.endTime = endTime;
        this.totalAmount = totalAmount;
        this.status = status;
        this.createdAt = createdAt;
        this.seatIdentifiers = seatIdentifiers != null ? seatIdentifiers : new ArrayList<>();
    }

    public UUID getBookingReference() {
        return bookingReference;
    }

    public void setBookingReference(UUID bookingReference) {
        this.bookingReference = bookingReference;
    }

    public Long getShowtimeId() {
        return showtimeId;
    }

    public void setShowtimeId(Long showtimeId) {
        this.showtimeId = showtimeId;
    }

    public String getMovieTitle() {
        return movieTitle;
    }

    public void setMovieTitle(String movieTitle) {
        this.movieTitle = movieTitle;
    }

    public String getScreenName() {
        return screenName;
    }

    public void setScreenName(String screenName) {
        this.screenName = screenName;
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

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public List<String> getSeatIdentifiers() {
        return seatIdentifiers;
    }

    public void setSeatIdentifiers(List<String> seatIdentifiers) {
        this.seatIdentifiers = seatIdentifiers != null ? seatIdentifiers : new ArrayList<>();
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        BookingHistoryResponse that = (BookingHistoryResponse) o;
        return Objects.equals(bookingReference, that.bookingReference) &&
                Objects.equals(showtimeId, that.showtimeId) &&
                Objects.equals(movieTitle, that.movieTitle) &&
                Objects.equals(screenName, that.screenName) &&
                Objects.equals(startTime, that.startTime) &&
                Objects.equals(endTime, that.endTime) &&
                Objects.equals(totalAmount, that.totalAmount) &&
                Objects.equals(status, that.status) &&
                Objects.equals(createdAt, that.createdAt) &&
                Objects.equals(seatIdentifiers, that.seatIdentifiers);
    }

    @Override
    public int hashCode() {
        return Objects.hash(bookingReference, showtimeId, movieTitle, screenName, startTime, endTime, totalAmount, status, createdAt, seatIdentifiers);
    }

    @Override
    public String toString() {
        return "BookingHistoryResponse{" +
                "bookingReference=" + bookingReference +
                ", showtimeId=" + showtimeId +
                ", movieTitle='" + movieTitle + '\'' +
                ", screenName='" + screenName + '\'' +
                ", startTime=" + startTime +
                ", endTime=" + endTime +
                ", totalAmount=" + totalAmount +
                ", status='" + status + '\'' +
                ", createdAt=" + createdAt +
                ", seatIdentifiers=" + seatIdentifiers +
                '}';
    }
}