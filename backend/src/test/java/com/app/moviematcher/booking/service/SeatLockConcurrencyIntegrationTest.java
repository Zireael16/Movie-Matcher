package com.app.moviematcher.booking.service;

import com.app.moviematcher.booking.dto.SeatLockResponse;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.data.redis.core.StringRedisTemplate;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Set;
import java.util.concurrent.CountDownLatch;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.atomic.AtomicInteger;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
@DisplayName("Multi-threaded SeatLock Concurrency Integration Test")
class SeatLockConcurrencyIntegrationTest {

    @Autowired
    private SeatLockService seatLockService;

    @Autowired
    private StringRedisTemplate redisTemplate;

    private static final Long TEST_SHOWTIME_ID = 9999L;
    private static final List<String> CONTESTED_SEATS = List.of("E5", "E6");

    @BeforeEach
    @AfterEach
    void cleanRedisState() {
        // Clean up test keys in Redis before and after each run
        Set<String> keys = redisTemplate.keys("lock:showtime:" + TEST_SHOWTIME_ID + ":*");
        if (keys != null && !keys.isEmpty()) {
            redisTemplate.delete(keys);
        }
    }

    @Test
    @DisplayName("Simulate 20 threads simultaneously competing for the same seats - only 1 must succeed")
    void testConcurrentSeatLocking_Atomicity() throws InterruptedException {
        int numberOfThreads = 20;
        ExecutorService executorService = Executors.newFixedThreadPool(numberOfThreads);

        // Latch to release all threads simultaneously at the exact same millisecond
        CountDownLatch startSignal = new CountDownLatch(1);
        CountDownLatch doneSignal = new CountDownLatch(numberOfThreads);

        AtomicInteger successCount = new AtomicInteger(0);
        AtomicInteger conflictCount = new AtomicInteger(0);
        List<SeatLockResponse> successfulResponses = Collections.synchronizedList(new ArrayList<>());

        for (int i = 0; i < numberOfThreads; i++) {
            final long userId = 1000L + i; // Each thread represents a unique user

            executorService.submit(() -> {
                try {
                    startSignal.await(); // Wait for release gun
                    SeatLockResponse response = seatLockService.lockSeats(
                            TEST_SHOWTIME_ID,
                            userId,
                            CONTESTED_SEATS
                    );
                    successCount.incrementAndGet();
                    successfulResponses.add(response);
                } catch (IllegalStateException e) {
                    // Contention conflict caught as expected
                    conflictCount.incrementAndGet();
                } catch (Exception e) {
                    System.err.println("Unexpected exception: " + e.getMessage());
                } finally {
                    doneSignal.countDown();
                }
            });
        }

        // Fire all threads at once
        startSignal.countDown();

        // Wait up to 10 seconds for all threads to finish
        boolean finished = doneSignal.await(10, TimeUnit.SECONDS);
        executorService.shutdown();

        // Assertions
        assertEquals(true, finished, "All threads should complete within 10 seconds");
        assertEquals(1, successCount.get(), "Exactly 1 user must acquire the locks");
        assertEquals(numberOfThreads - 1, conflictCount.get(), "All other 19 users must receive conflict rejection");

        // Verify winner's hold token in Redis
        SeatLockResponse winner = successfulResponses.get(0);
        assertNotNull(winner);
        assertNotNull(winner.getHoldToken());

        for (String seatId : CONTESTED_SEATS) {
            String lockKey = "lock:showtime:" + TEST_SHOWTIME_ID + ":seat:" + seatId;
            String redisValue = redisTemplate.opsForValue().get(lockKey);
            assertNotNull(redisValue, "Redis key must exist for locked seat: " + seatId);
            assertEquals(true, redisValue.contains(winner.getHoldToken()), "Redis must store the winning hold token");
        }
    }
}