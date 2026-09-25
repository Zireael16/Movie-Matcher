package com.app.moviematcher.booking.service;

import com.app.moviematcher.booking.dto.SeatLockResponse;

import java.util.List;
import java.util.Set;

public interface SeatLockService {

    SeatLockResponse lockSeats(Long showtimeId, Long userId, List<String> seatIds);

    boolean releaseSeats(Long showtimeId, Long userId, String holdToken, List<String> seatIds);

    boolean verifyLockOwnership(Long showtimeId, Long userId, String holdToken, List<String> seatIds);

    Set<String> getLockedSeatsForShowtime(Long showtimeId);
}