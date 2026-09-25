package com.app.moviematcher.booking.service.impl;

import com.app.moviematcher.booking.dto.SeatLockResponse;
import com.app.moviematcher.booking.service.SeatLockService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.data.redis.core.Cursor;
import org.springframework.data.redis.core.ScanOptions;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.script.RedisScript;
import org.springframework.stereotype.Service;

import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.List;
import java.util.Set;
import java.util.UUID;

/**
 * Service implementation managing distributed seat locks using Redis and atomic Lua scripts.
 * Guarantees race-free seat reservations under high concurrency by executing atomic all-or-nothing
 * locking before relational database operations.
 */
@Service
public class SeatLockServiceImpl implements SeatLockService {

    private static final Logger log = LoggerFactory.getLogger(SeatLockServiceImpl.class);

    // Common namespace prefix for all seat lock keys stored in Redis
    private static final String LOCK_KEY_PREFIX = "lock:showtime:";

    private final StringRedisTemplate redisTemplate;
    private final RedisScript<Long> acquireSeatLockScript;
    private final RedisScript<Long> releaseSeatLockScript;
    private final long lockDurationSeconds;

    public SeatLockServiceImpl(
            StringRedisTemplate redisTemplate,
            RedisScript<Long> acquireSeatLockScript,
            RedisScript<Long> releaseSeatLockScript,
            @Value("${application.booking.seat-lock-duration-seconds:600}") long lockDurationSeconds) {
        this.redisTemplate = redisTemplate;
        this.acquireSeatLockScript = acquireSeatLockScript;
        this.releaseSeatLockScript = releaseSeatLockScript;
        this.lockDurationSeconds = lockDurationSeconds;
    }

    /**
     * Atomically locks the specified seats for a given showtime and user using an atomic Lua script.
     * If even one seat in the requested list is already locked, zero locks are created and an exception is thrown.
     *
     * @param showtimeId The target screening schedule ID
     * @param userId The authenticated customer ID requesting the hold
     * @param seatIds The list of seat coordinates (e.g., ["A1", "A2"])
     * @return SeatLockResponse containing the generated holdToken, expiration time, and locked seat list
     */
    @Override
    public SeatLockResponse lockSeats(Long showtimeId, Long userId, List<String> seatIds) {
        if (seatIds == null || seatIds.isEmpty()) {
            throw new IllegalArgumentException("Seat IDs list cannot be empty");
        }

        // Generate a cryptographically unique hold token for this transaction
        String holdToken = UUID.randomUUID().toString();

        // Lock value embeds both the token and the user ID to prevent unauthorized releases: <holdToken>:<userId>
        String lockPayload = holdToken + ":" + userId;

        // Build Redis keys for each requested seat: lock:showtime:<showtimeId>:seat:<seatIdentifier>
        List<String> redisKeys = new ArrayList<>();
        for (String seatId : seatIds) {
            redisKeys.add(buildSeatLockKey(showtimeId, seatId));
        }

        // Execute the atomic Lua script in Redis (returns 1 on success, 0 if any key already exists)
        Long executionResult = redisTemplate.execute(
                acquireSeatLockScript,
                redisKeys,
                lockPayload,
                String.valueOf(lockDurationSeconds)
        );

        // If executionResult is 0, at least one seat was already claimed
        if (executionResult == null || executionResult == 0L) {
            log.warn("Failed to acquire lock for showtime {} and seats {}. Seats already held or locked.", showtimeId, seatIds);
            throw new IllegalStateException("One or more selected seats are currently locked by another customer. Please choose different seats.");
        }

        // Calculate absolute expiration timestamp in UTC based on the TTL
        OffsetDateTime expiresAt = OffsetDateTime.now(ZoneOffset.UTC).plusSeconds(lockDurationSeconds);
        log.info("Acquired Redis lock for showtime {}, user {}, token {}, seats {}", showtimeId, userId, holdToken, seatIds);

        return new SeatLockResponse(holdToken, expiresAt, lockDurationSeconds, seatIds);
    }

    /**
     * Safely releases seat locks in Redis by verifying that each key is owned by the exact holdToken:userId pair.
     * Prevents unlocking seats that may have expired and subsequently been re-locked by another user.
     *
     * @param showtimeId The screening schedule ID
     * @param userId The ID of the user requesting the release
     * @param holdToken The hold token received during lock acquisition
     * @param seatIds The list of seat coordinates to unlock
     * @return true if at least one lock was successfully released, false otherwise
     */
    @Override
    public boolean releaseSeats(Long showtimeId, Long userId, String holdToken, List<String> seatIds) {
        if (seatIds == null || seatIds.isEmpty()) {
            return false;
        }

        String expectedPayload = holdToken + ":" + userId;
        List<String> redisKeys = new ArrayList<>();
        for (String seatId : seatIds) {
            redisKeys.add(buildSeatLockKey(showtimeId, seatId));
        }

        // Safe release Lua script only deletes a key if its value matches expectedPayload
        Long releasedCount = redisTemplate.execute(
                releaseSeatLockScript,
                redisKeys,
                expectedPayload
        );

        boolean success = releasedCount != null && releasedCount > 0L;
        log.info("Released {}/{} seat locks for showtime {}, user {}, token {}", releasedCount, seatIds.size(), showtimeId, userId, holdToken);
        return success;
    }

    /**
     * Checks if all requested seats are currently held in Redis by the specified holdToken and user.
     * Used by the booking engine prior to processing payment to guarantee hold validity.
     *
     * @param showtimeId The screening schedule ID
     * @param userId The ID of the user attempting to purchase
     * @param holdToken The hold token to verify
     * @param seatIds The list of seat identifiers
     * @return true if all seats match the expected hold value; false if expired, missing, or owned by someone else
     */
    @Override
    public boolean verifyLockOwnership(Long showtimeId, Long userId, String holdToken, List<String> seatIds) {
        if (seatIds == null || seatIds.isEmpty() || holdToken == null || userId == null) {
            return false;
        }

        String expectedPayload = holdToken + ":" + userId;
        List<String> redisKeys = new ArrayList<>();
        for (String seatId : seatIds) {
            redisKeys.add(buildSeatLockKey(showtimeId, seatId));
        }

        // Fetch all values in a single round-trip using multiGet
        List<String> values = redisTemplate.opsForValue().multiGet(redisKeys);
        if (values == null || values.size() != redisKeys.size()) {
            return false;
        }

        // Ensure every seat key still exists and contains the exact expected hold value
        for (String val : values) {
            if (val == null || !val.equals(expectedPayload)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Retrieves the set of all seat identifiers currently under an active hold for a given showtime.
     * Uses non-blocking Redis SCAN to safely query keys without stalling the single-threaded Redis engine.
     *
     * @param showtimeId The screening schedule ID
     * @return Set of seat identifier strings (e.g., ["A1", "D5", "J10"])
     */
    @Override
    public Set<String> getLockedSeatsForShowtime(Long showtimeId) {
        Set<String> lockedSeats = new HashSet<>();
        String keyPattern = LOCK_KEY_PREFIX + showtimeId + ":seat:*";

        // Non-blocking SCAN iteration in batches of 100
        ScanOptions scanOptions = ScanOptions.scanOptions().match(keyPattern).count(100).build();
        try (Cursor<String> cursor = redisTemplate.scan(scanOptions)) {
            while (cursor.hasNext()) {
                String fullKey = cursor.next();
                int lastColonIndex = fullKey.lastIndexOf(':');
                if (lastColonIndex != -1 && lastColonIndex < fullKey.length() - 1) {
                    // Extract the seat identifier from the key suffix: lock:showtime:<id>:seat:<seatIdentifier>
                    lockedSeats.add(fullKey.substring(lastColonIndex + 1));
                }
            }
        } catch (Exception e) {
            log.error("Error scanning Redis keys for pattern {}", keyPattern, e);
        }

        return lockedSeats;
    }

    /**
     * Constructs a standardized Redis key for a specific seat hold.
     * Normalizes seat identifiers to uppercase (e.g., "a1" -> "A1").
     */
    private String buildSeatLockKey(Long showtimeId, String seatId) {
        return LOCK_KEY_PREFIX + showtimeId + ":seat:" + seatId.trim().toUpperCase();
    }
}