package com.app.moviematcher.booking.service.impl;

import com.app.moviematcher.booking.dto.PaymentResult;
import com.app.moviematcher.booking.service.PaymentService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.UUID;

/**
 * Mock implementation of PaymentService simulating an external payment gateway.
 * Provides realistic transaction verification, processing latency simulation,
 * and generates audit transaction references without relying on third-party APIs.
 */
@Service
public class MockPaymentServiceImpl implements PaymentService {

    private static final Logger log = LoggerFactory.getLogger(MockPaymentServiceImpl.class);

    /**
     * Simulates charging the customer's selected payment method.
     * Enforces monetary validation (amount must be strictly positive)
     * and constructs an audit reference for successful settlements.
     *
     * @param amount the transaction charge amount in INR (BigDecimal)
     * @param paymentMethod payment channel (e.g., UPI, CREDIT_CARD, DEBIT_CARD)
     * @param holdToken active reservation hold token
     * @return PaymentResult indicating transaction status
     */
    @Override
    public PaymentResult processPayment(BigDecimal amount, String paymentMethod, String holdToken) {
        log.info("Initiating mock payment processing for holdToken {}, amount: INR {}, method: {}",
                holdToken, amount, paymentMethod);

        // Validation: debit amount must be strictly greater than zero
        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            log.warn("Payment rejected: Invalid transaction amount {}", amount);
            return PaymentResult.failure(
                    amount != null ? amount : BigDecimal.ZERO,
                    paymentMethod,
                    "Invalid payment amount: must be greater than zero",
                    OffsetDateTime.now(ZoneOffset.UTC)
            );
        }

        // Simulate gateway network round-trip latency
        try {
            Thread.sleep(200);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.error("Payment processing thread interrupted", e);
            return PaymentResult.failure(
                    amount,
                    paymentMethod,
                    "Payment processing was interrupted",
                    OffsetDateTime.now(ZoneOffset.UTC)
            );
        }

        // Generate synthetic gateway transaction reference
        String transactionRef = "TXN-" + UUID.randomUUID().toString().replace("-", "").substring(0, 16).toUpperCase();
        OffsetDateTime now = OffsetDateTime.now(ZoneOffset.UTC);

        log.info("Payment approved successfully. Transaction reference: {}", transactionRef);
        return PaymentResult.success(transactionRef, amount, paymentMethod, now);
    }
}