package com.app.moviematcher.catalog.service.impl;

import com.app.moviematcher.catalog.dto.SeatDTO;
import com.app.moviematcher.catalog.dto.SeatLayoutResponseDTO;
import com.app.moviematcher.catalog.entity.Showtime;
import com.app.moviematcher.catalog.repository.ShowtimeRepository;
import com.app.moviematcher.catalog.service.ShowtimeSeatService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.util.ArrayList;
import java.util.List;

/**
 * Implementation of ShowtimeSeatService without Lombok dependency.
 * Dynamically computes a 10x10 seat layout grid matching the 100-seat theater screens.
 * Applies tier-based pricing (Silver, Gold, VIP) using BigDecimal arithmetic.
 */
@Service
public class ShowtimeSeatServiceImpl implements ShowtimeSeatService {

    private static final Logger log = LoggerFactory.getLogger(ShowtimeSeatServiceImpl.class);

    private final ShowtimeRepository showtimeRepository;

    private static final int TOTAL_ROWS = 10;
    private static final int TOTAL_COLUMNS = 10;
    private static final String[] ROW_LABELS = {"A", "B", "C", "D", "E", "F", "G", "H", "I", "J"};

    /**
     * Tier multipliers applied to the showtime base price:
     * - Silver (Rows A-C): 1.0x (Standard base price)
     * - Gold   (Rows D-G): 1.25x (25% premium)
     * - VIP    (Rows H-J): 1.50x (50% premium)
     */
    private static final BigDecimal GOLD_MULTIPLIER = new BigDecimal("1.25");
    private static final BigDecimal VIP_MULTIPLIER = new BigDecimal("1.50");

    /**
     * Constructor injection for ShowtimeRepository.
     */
    public ShowtimeSeatServiceImpl(ShowtimeRepository showtimeRepository) {
        this.showtimeRepository = showtimeRepository;
    }

    /**
     * Retrieves the showtime entity, calculates seat pricing tiers,
     * and constructs the full 10x10 seat matrix.
     */
    @Override
    @Transactional(readOnly = true)
    public SeatLayoutResponseDTO getSeatLayout(Long showtimeId) {
        log.info("Fetching seat layout for showtime ID: {}", showtimeId);

        Showtime showtime = showtimeRepository.findById(showtimeId)
                .orElseThrow(() -> new IllegalArgumentException("Showtime not found with id: " + showtimeId));

        BigDecimal basePrice = showtime.getTicketPrice();
        List<SeatDTO> seats = new ArrayList<>(TOTAL_ROWS * TOTAL_COLUMNS);

        // Generate the 10x10 matrix (A1 to J10)
        for (int r = 0; r < TOTAL_ROWS; r++) {
            String rowLabel = ROW_LABELS[r];
            String tier = determineTier(r);
            BigDecimal seatPrice = calculatePriceForTier(basePrice, tier);

            for (int c = 1; c <= TOTAL_COLUMNS; c++) {
                String seatId = rowLabel + c; // Deterministic seat identifier for Phase 4 locks

                seats.add(new SeatDTO(
                        seatId,
                        rowLabel,
                        c,
                        tier,
                        seatPrice,
                        "AVAILABLE"
                ));
            }
        }

        return new SeatLayoutResponseDTO(
                showtime.getId(),
                showtime.getMovie().getId(),
                showtime.getMovie().getTitle(),
                showtime.getScreen().getId(),
                showtime.getScreen().getName(),
                showtime.getStartTime().toInstant(),
                showtime.getEndTime().toInstant(),
                basePrice,
                TOTAL_ROWS,
                TOTAL_COLUMNS,
                seats
        );
    }

    /**
     * Determines seat tier based on row index:
     * Rows 0-2 (A-C) -> SILVER
     * Rows 3-6 (D-G) -> GOLD
     * Rows 7-9 (H-J) -> VIP
     */
    private String determineTier(int rowIndex) {
        if (rowIndex < 3) {
            return "SILVER";
        } else if (rowIndex < 7) {
            return "GOLD";
        } else {
            return "VIP";
        }
    }

    /**
     * Calculates the scaled ticket price per seat using BigDecimal.
     */
    private BigDecimal calculatePriceForTier(BigDecimal basePrice, String tier) {
        switch (tier) {
            case "VIP":
                return basePrice.multiply(VIP_MULTIPLIER).setScale(2, RoundingMode.HALF_UP);
            case "GOLD":
                return basePrice.multiply(GOLD_MULTIPLIER).setScale(2, RoundingMode.HALF_UP);
            case "SILVER":
            default:
                return basePrice.setScale(2, RoundingMode.HALF_UP);
        }
    }
}