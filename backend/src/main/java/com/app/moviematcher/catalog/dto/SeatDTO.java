package com.app.moviematcher.catalog.dto;

import java.math.BigDecimal;

/**
 * Data Transfer Object representing an individual cinema seat.
 * Contains seat positioning, tier classification, and calculated price.
 */
public class SeatDTO {
    private String id;              // e.g. "A1", "J10" - used as seat_identifier in Phase 4
    private String rowLabel;        // e.g. "A", "B", ... "J"
    private Integer seatNumber;     // e.g. 1, 2, ... 10
    private String tier;            // "SILVER", "GOLD", "VIP"
    private BigDecimal price;       // Base ticket price scaled by tier multiplier
    private String status;          // "AVAILABLE", "LOCKED", "RESERVED"

    public SeatDTO() {
    }

    public SeatDTO(String id, String rowLabel, Integer seatNumber, String tier, BigDecimal price, String status) {
        this.id = id;
        this.rowLabel = rowLabel;
        this.seatNumber = seatNumber;
        this.tier = tier;
        this.price = price;
        this.status = status;
    }

    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getRowLabel() {
        return rowLabel;
    }

    public void setRowLabel(String rowLabel) {
        this.rowLabel = rowLabel;
    }

    public Integer getSeatNumber() {
        return seatNumber;
    }

    public void setSeatNumber(Integer seatNumber) {
        this.seatNumber = seatNumber;
    }

    public String getTier() {
        return tier;
    }

    public void setTier(String tier) {
        this.tier = tier;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }
}