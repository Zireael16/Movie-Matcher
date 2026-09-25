package com.app.moviematcher.booking.dto;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

/**
 * Data Transfer Object representing the outcome of a payment processing attempt.
 * Encapsulates the transaction status, gateway reference ID, and audit metadata.
 */
public class PaymentResult {

    private boolean successful;
    private String transactionReference;
    private BigDecimal amount;
    private String paymentMethod;
    private String failureReason;
    private OffsetDateTime timestamp;

    public PaymentResult() {
    }

    public PaymentResult(boolean successful, String transactionReference, BigDecimal amount,
                         String paymentMethod, String failureReason, OffsetDateTime timestamp) {
        this.successful = successful;
        this.transactionReference = transactionReference;
        this.amount = amount;
        this.paymentMethod = paymentMethod;
        this.failureReason = failureReason;
        this.timestamp = timestamp;
    }

    /**
     * Factory method for creating a successful payment result.
     *
     * @param transactionReference the gateway transaction reference identifier
     * @param amount the total amount debited
     * @param paymentMethod the method utilized (e.g., UPI, CREDIT_CARD)
     * @param timestamp the UTC time when the payment was confirmed
     * @return PaymentResult instance marked as successful
     */
    public static PaymentResult success(String transactionReference, BigDecimal amount,
                                        String paymentMethod, OffsetDateTime timestamp) {
        return new PaymentResult(true, transactionReference, amount, paymentMethod, null, timestamp);
    }

    /**
     * Factory method for creating a failed payment result.
     *
     * @param amount the attempted debit amount
     * @param paymentMethod the method attempted
     * @param failureReason description of why the transaction failed
     * @param timestamp the UTC time when the payment failed
     * @return PaymentResult instance marked as failed
     */
    public static PaymentResult failure(BigDecimal amount, String paymentMethod,
                                        String failureReason, OffsetDateTime timestamp) {
        return new PaymentResult(false, null, amount, paymentMethod, failureReason, timestamp);
    }

    public boolean isSuccessful() {
        return successful;
    }

    public void setSuccessful(boolean successful) {
        this.successful = successful;
    }

    public String getTransactionReference() {
        return transactionReference;
    }

    public void setTransactionReference(String transactionReference) {
        this.transactionReference = transactionReference;
    }

    public BigDecimal getAmount() {
        return amount;
    }

    public void setAmount(BigDecimal amount) {
        this.amount = amount;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getFailureReason() {
        return failureReason;
    }

    public void setFailureReason(String failureReason) {
        this.failureReason = failureReason;
    }

    public OffsetDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(OffsetDateTime timestamp) {
        this.timestamp = timestamp;
    }

    @Override
    public String toString() {
        return "PaymentResult{" +
                "successful=" + successful +
                ", transactionReference='" + transactionReference + '\'' +
                ", amount=" + amount +
                ", paymentMethod='" + paymentMethod + '\'' +
                ", failureReason='" + failureReason + '\'' +
                ", timestamp=" + timestamp +
                '}';
    }
}