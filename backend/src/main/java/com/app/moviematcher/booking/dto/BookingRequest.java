package com.app.moviematcher.booking.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.ArrayList;
import java.util.List;

public class BookingRequest {

    @NotBlank(message = "Hold token is required")
    private String holdToken;

    @NotNull(message = "Showtime ID is required")
    private Long showtimeId;

    @NotEmpty(message = "Seat list cannot be empty")
    @Size(max = 8, message = "Cannot book more than 8 seats per transaction")
    private List<String> seatIds = new ArrayList<>();

    @NotBlank(message = "Payment method is required")
    private String paymentMethod;

    public BookingRequest() {
    }

    public BookingRequest(String holdToken, Long showtimeId, List<String> seatIds, String paymentMethod) {
        this.holdToken = holdToken;
        this.showtimeId = showtimeId;
        this.seatIds = seatIds;
        this.paymentMethod = paymentMethod;
    }

    public String getHoldToken() {
        return holdToken;
    }

    public void setHoldToken(String holdToken) {
        this.holdToken = holdToken;
    }

    public Long getShowtimeId() {
        return showtimeId;
    }

    public void setShowtimeId(Long showtimeId) {
        this.showtimeId = showtimeId;
    }

    public List<String> getSeatIds() {
        return seatIds;
    }

    public void setSeatIds(List<String> seatIds) {
        this.seatIds = seatIds;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    @Override
    public String toString() {
        return "BookingRequest{" +
                "holdToken='" + holdToken + '\'' +
                ", showtimeId=" + showtimeId +
                ", seatIds=" + seatIds +
                ", paymentMethod='" + paymentMethod + '\'' +
                '}';
    }
}