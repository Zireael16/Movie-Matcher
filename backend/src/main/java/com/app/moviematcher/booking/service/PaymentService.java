package com.app.moviematcher.booking.service;

import com.app.moviematcher.booking.dto.PaymentResult;

import java.math.BigDecimal;

/**
 * Service interface for payment processing gateway interactions.
 * Handles the charging of customer payment methods during the booking checkout flow.
 */
public interface PaymentService {

    /**
     * Processes payment for a reservation attempt.
     *
     * @param amount the exact monetary amount to charge in INR (BigDecimal)
     * @param paymentMethod the payment instrument chosen (e.g., UPI, CREDIT_CARD, NET_BANKING)
     * @param holdToken the associated hold token tied to the active seat locks
     * @return PaymentResult encapsulating the status, transaction reference, or error message
     */
    PaymentResult processPayment(BigDecimal amount, String paymentMethod, String holdToken);
}