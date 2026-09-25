package com.app.moviematcher.booking.dto;

import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.ArrayList;
import java.util.List;

public class SeatLockRequest {

    @NotEmpty(message = "Seat list cannot be empty")
    @Size(max = 8, message = "Cannot select more than 8 seats per transaction")
    private List<String> seatIds = new ArrayList<>();

    public SeatLockRequest() {
    }

    public SeatLockRequest(List<String> seatIds) {
        this.seatIds = seatIds;
    }

    public List<String> getSeatIds() {
        return seatIds;
    }

    public void setSeatIds(List<String> seatIds) {
        this.seatIds = seatIds;
    }

    @Override
    public String toString() {
        return "SeatLockRequest{" +
                "seatIds=" + seatIds +
                '}';
    }
}