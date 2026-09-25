package com.app.moviematcher.booking.dto;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

public class SeatLockResponse {

    private String holdToken;
    private OffsetDateTime expiresAt;
    private Long expiresInSeconds;
    private List<String> lockedSeats = new ArrayList<>();

    public SeatLockResponse() {
    }

    public SeatLockResponse(String holdToken, OffsetDateTime expiresAt, Long expiresInSeconds, List<String> lockedSeats) {
        this.holdToken = holdToken;
        this.expiresAt = expiresAt;
        this.expiresInSeconds = expiresInSeconds;
        this.lockedSeats = lockedSeats;
    }

    public String getHoldToken() {
        return holdToken;
    }

    public void setHoldToken(String holdToken) {
        this.holdToken = holdToken;
    }

    public OffsetDateTime getExpiresAt() {
        return expiresAt;
    }

    public void setExpiresAt(OffsetDateTime expiresAt) {
        this.expiresAt = expiresAt;
    }

    public Long getExpiresInSeconds() {
        return expiresInSeconds;
    }

    public void setExpiresInSeconds(Long expiresInSeconds) {
        this.expiresInSeconds = expiresInSeconds;
    }

    public List<String> getLockedSeats() {
        return lockedSeats;
    }

    public void setLockedSeats(List<String> lockedSeats) {
        this.lockedSeats = lockedSeats;
    }

    @Override
    public String toString() {
        return "SeatLockResponse{" +
                "holdToken='" + holdToken + '\'' +
                ", expiresAt=" + expiresAt +
                ", expiresInSeconds=" + expiresInSeconds +
                ", lockedSeats=" + lockedSeats +
                '}';
    }
}