package com.app.moviematcher.catalog.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.OneToMany;
import jakarta.persistence.PrePersist;
import jakarta.persistence.PreUpdate;
import jakarta.persistence.Table;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;

/**
 * JPA Entity representing an auditorium or theater screen.
 * Corresponds to the 'screens' table created by Flyway migration V2.
 */
@Entity
@Table(name = "screens")
public class Screen {

    /**
     * Primary Key backed by PostgreSQL BIGSERIAL auto-increment sequence.
     */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Unique display name of the screen (e.g. "Screen 1 - IMAX").
     */
    @Column(name = "name", nullable = false, unique = true, length = 100)
    private String name;

    /**
     * Total physical seating capacity of the screen.
     * Serves as the upper ceiling for ticket inventory in reservation modules.
     */
    @Column(name = "total_capacity", nullable = false)
    private Integer totalCapacity;

    /**
     * Bi-directional relationship: One Screen hosts many scheduled Showtimes.
     * Mapped by the 'screen' field in the Showtime entity.
     */
    @OneToMany(mappedBy = "screen")
    private List<Showtime> showtimes = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    /**
     * Default no-argument constructor required by JPA specification.
     */
    public Screen() {
    }

    /**
     * Convenience constructor for initializing a screen instance.
     */
    public Screen(String name, Integer totalCapacity) {
        this.name = name;
        this.totalCapacity = totalCapacity;
    }

    /**
     * Automatically populate auditing timestamps before inserting a new record.
     */
    @PrePersist
    protected void onCreate() {
        OffsetDateTime now = OffsetDateTime.now();
        this.createdAt = now;
        this.updatedAt = now;
    }

    /**
     * Automatically update timestamp before modifying an existing record.
     */
    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = OffsetDateTime.now();
    }

    // --- Standard Getters and Setters (No Lombok) ---

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getTotalCapacity() {
        return totalCapacity;
    }

    public void setTotalCapacity(Integer totalCapacity) {
        this.totalCapacity = totalCapacity;
    }

    public List<Showtime> getShowtimes() {
        return showtimes;
    }

    public void setShowtimes(List<Showtime> showtimes) {
        this.showtimes = showtimes;
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
}