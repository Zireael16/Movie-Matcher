package com.app.moviematcher.booking.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

public class BookingResponse {

    private String bookingReference;
    private String status;
    private Long showtimeId;
    private BigDecimal totalAmount;
    private OffsetDateTime bookingTime;
    private List<String> confirmedSeats = new ArrayList<>();

    public BookingResponse() {
    }

    public BookingResponse(String bookingReference, String status, Long showtimeId,
                           BigDecimal totalAmount, OffsetDateTime bookingTime, List<String> confirmedSeats) {
        this.bookingReference = bookingReference;
        this.status = status;
        this.showtimeId = showtimeId;
        this.totalAmount = totalAmount;
        this.bookingTime = bookingTime;
        this.confirmedSeats = confirmedSeats;
    }

    public String getBookingReference() {
        return bookingReference;
    }

    public void setBookingReference(String bookingReference) {
        this.bookingReference = bookingReference;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Long getShowtimeId() {
        return showtimeId;
    }

    public void setShowtimeId(Long showtimeId) {
        this.showtimeId = showtimeId;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public OffsetDateTime getBookingTime() {
        return bookingTime;
    }

    public void setBookingTime(OffsetDateTime bookingTime) {
        this.bookingTime = bookingTime;
    }

    public List<String> getConfirmedSeats() {
        return confirmedSeats;
    }

    public void setConfirmedSeats(List<String> confirmedSeats) {
        this.confirmedSeats = confirmedSeats;
    }

    @Override
    public String toString() {
        return "BookingResponse{" +
                "bookingReference='" + bookingReference + '\'' +
                ", status='" + status + '\'' +
                ", showtimeId=" + showtimeId +
                ", totalAmount=" + totalAmount +
                ", bookingTime=" + bookingTime +
                ", confirmedSeats=" + confirmedSeats +
                '}';
    }
}