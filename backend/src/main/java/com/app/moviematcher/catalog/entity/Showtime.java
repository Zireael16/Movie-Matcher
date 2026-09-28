package com.app.moviematcher.catalog.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Objects;

/**
 * JPA Entity representing a scheduled screening linking a Movie to a Screen.
 * Corresponds to the 'showtimes' table created by Flyway migration V2 and updated by V5.
 */
@Entity
@Table(name = "showtimes")
public class Showtime {

    /**
     * Primary Key backed by PostgreSQL BIGSERIAL auto-increment sequence.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Foreign key association to Movie.
     * Uses FetchType.LAZY to prevent automatic joins unless explicitly requested.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "movie_id", nullable = false)
    private Movie movie;

    /**
     * Foreign key association to Screen.
     * Uses FetchType.LAZY to prevent automatic joins unless explicitly requested.
     */
    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "screen_id", nullable = false)
    private Screen screen;

    /**
     * Scheduled start time of the screening (with timezone).
     */
    @Column(name = "start_time", nullable = false)
    private OffsetDateTime startTime;

    /**
     * Calculated end time of the screening (start_time + movie.duration_minutes).
     * Used for schedule conflict and overlap validation.
     */
    @Column(name = "end_time", nullable = false)
    private OffsetDateTime endTime;

    /**
     * Price per ticket for this screening.
     * Represented as BigDecimal to prevent floating-point financial precision errors.
     */
    @Column(name = "ticket_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal ticketPrice;

    /**
     * Lifecycle state of the screening: 'ACTIVE' or 'CANCELLED'.
     * Defaults to 'ACTIVE' for all newly created showtimes.
     */
    @Column(name = "status", nullable = false, length = 20)
    private String status = "ACTIVE";

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    /**
     * Default no-argument constructor required by JPA specification.
     */
    public Showtime() {
    }

    /**
     * Convenience constructor for initializing a Showtime instance with default ACTIVE status.
     */
    public Showtime(Movie movie, Screen screen, OffsetDateTime startTime, OffsetDateTime endTime, BigDecimal ticketPrice) {
        this.movie = movie;
        this.screen = screen;
        this.startTime = startTime;
        this.endTime = endTime;
        this.ticketPrice = ticketPrice;
        this.status = "ACTIVE";
    }

    /**
     * Full-parameter constructor including explicit status.
     */
    public Showtime(Movie movie, Screen screen, OffsetDateTime startTime, OffsetDateTime endTime, BigDecimal ticketPrice, String status) {
        this.movie = movie;
        this.screen = screen;
        this.startTime = startTime;
        this.endTime = endTime;
        this.ticketPrice = ticketPrice;
        this.status = (status != null && !status.trim().isEmpty()) ? status : "ACTIVE";
    }

    /**
     * Automatically populate auditing timestamps before inserting a new record.
     */
    @PrePersist
    protected void onCreate() {
        OffsetDateTime now = OffsetDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
        if (this.status == null || this.status.trim().isEmpty()) {
            this.status = "ACTIVE";
        }
    }

    /**
     * Automatically update timestamp before modifying an existing record.
     */
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = OffsetDateTime.now();
    }

    // --- Standard Getters and Setters (Strictly No Lombok) ---

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Movie getMovie() {
        return movie;
    }

    public void setMovie(Movie movie) {
        this.movie = movie;
    }

    public Screen getScreen() {
        return screen;
    }

    public void setScreen(Screen screen) {
        this.screen = screen;
    }

    public OffsetDateTime getStartTime() {
        return startTime;
    }

    public void setStartTime(OffsetDateTime startTime) {
        this.startTime = startTime;
    }

    public OffsetDateTime getEndTime() {
        return endTime;
    }

    public void setEndTime(OffsetDateTime endTime) {
        this.endTime = endTime;
    }

    public BigDecimal getTicketPrice() {
        return ticketPrice;
    }

    public void setTicketPrice(BigDecimal ticketPrice) {
        this.ticketPrice = ticketPrice;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public OffsetDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(OffsetDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public OffsetDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(OffsetDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Showtime showtime = (Showtime) o;
        return Objects.equals(id, showtime.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }

    @Override
    public String toString() {
        return "Showtime{" +
                "id=" + id +
                ", startTime=" + startTime +
                ", endTime=" + endTime +
                ", ticketPrice=" + ticketPrice +
                ", status='" + status + '\'' +
                ", createdAt=" + createdAt +
                ", updatedAt=" + updatedAt +
                '}';
    }
}