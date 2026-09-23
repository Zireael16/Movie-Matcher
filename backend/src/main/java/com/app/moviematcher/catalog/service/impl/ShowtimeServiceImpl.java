package com.app.moviematcher.catalog.service.impl;

import com.app.moviematcher.catalog.dto.ShowtimeRequest;
import com.app.moviematcher.catalog.dto.ShowtimeResponse;
import com.app.moviematcher.catalog.entity.Movie;
import com.app.moviematcher.catalog.entity.Screen;
import com.app.moviematcher.catalog.entity.Showtime;
import com.app.moviematcher.catalog.repository.MovieRepository;
import com.app.moviematcher.catalog.repository.ScreenRepository;
import com.app.moviematcher.catalog.repository.ShowtimeRepository;
import com.app.moviematcher.catalog.service.ShowtimeService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.time.ZoneOffset;
import java.util.List;
import java.util.stream.Collectors;

/**
 * Implementation of ShowtimeService enforcing screen collision checks, schedule integrity,
 * and date-window filtering for public movie browsing.
 */
@Service
public class ShowtimeServiceImpl implements ShowtimeService {

    private final ShowtimeRepository showtimeRepository;
    private final MovieRepository movieRepository;
    private final ScreenRepository screenRepository;

    /**
     * Constructor injection without Lombok.
     */
    public ShowtimeServiceImpl(ShowtimeRepository showtimeRepository,
                               MovieRepository movieRepository,
                               ScreenRepository screenRepository) {
        this.showtimeRepository = showtimeRepository;
        this.movieRepository = movieRepository;
        this.screenRepository = screenRepository;
    }

    @Override
    @Transactional
    public ShowtimeResponse createShowtime(ShowtimeRequest request) {
        // 1. Verify start time is in the future
        if (request.getStartTime().isBefore(OffsetDateTime.now())) {
            throw new IllegalArgumentException("Showtime start time cannot be in the past");
        }

        // 2. Fetch associated Movie to determine runtime duration
        Movie movie = movieRepository.findById(request.getMovieId())
                .orElseThrow(() -> new IllegalArgumentException("Movie not found with ID: " + request.getMovieId()));

        // 3. Fetch target Screen
        Screen screen = screenRepository.findById(request.getScreenId())
                .orElseThrow(() -> new IllegalArgumentException("Screen not found with ID: " + request.getScreenId()));

        // 4. Calculate exact end time based on the movie duration
        OffsetDateTime calculatedEndTime = request.getStartTime().plusMinutes(movie.getDurationMinutes());

        // 5. Overlap Validation: Ensure screen is not occupied during (startTime, calculatedEndTime)
        boolean hasOverlap = showtimeRepository.existsOverlappingShowtime(
                screen.getId(),
                request.getStartTime(),
                calculatedEndTime
        );

        if (hasOverlap) {
            throw new IllegalStateException(
                    String.format("Screen '%s' is already booked for another showtime during the interval [%s - %s]",
                            screen.getName(), request.getStartTime(), calculatedEndTime)
            );
        }

        // 6. Build and persist Showtime entity
        Showtime showtime = new Showtime(
                movie,
                screen,
                request.getStartTime(),
                calculatedEndTime,
                request.getTicketPrice()
        );

        Showtime savedShowtime = showtimeRepository.save(showtime);
        return ShowtimeResponse.fromEntity(savedShowtime);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ShowtimeResponse> getAllShowtimes() {
        return showtimeRepository.findAllWithDetails()
                .stream()
                .map(ShowtimeResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ShowtimeResponse> getShowtimesByMovieId(Long movieId) {
        if (!movieRepository.existsById(movieId)) {
            throw new IllegalArgumentException("Movie not found with ID: " + movieId);
        }
        return showtimeRepository.findByMovieIdWithDetails(movieId)
                .stream()
                .map(ShowtimeResponse::fromEntity)
                .collect(Collectors.toList());
    }

    /**
     * Filters showtimes for a specific movie within the boundaries of a given date (00:00:00 to 23:59:59.999999999 UTC).
     *
     * @param movieId target movie ID
     * @param date requested calendar date
     * @return List of ShowtimeResponse DTOs matching that day
     */
    @Override
    @Transactional(readOnly = true)
    public List<ShowtimeResponse> getShowtimesByMovieIdAndDate(Long movieId, LocalDate date) {
        if (!movieRepository.existsById(movieId)) {
            throw new IllegalArgumentException("Movie not found with ID: " + movieId);
        }

        OffsetDateTime startOfDay = date.atStartOfDay().atOffset(ZoneOffset.UTC);
        OffsetDateTime endOfDay = date.atTime(LocalTime.MAX).atOffset(ZoneOffset.UTC);

        return showtimeRepository.findByMovieIdAndDateRangeWithDetails(movieId, startOfDay, endOfDay)
                .stream()
                .map(ShowtimeResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ShowtimeResponse getShowtimeById(Long id) {
        Showtime showtime = showtimeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Showtime not found with ID: " + id));
        return ShowtimeResponse.fromEntity(showtime);
    }

    @Override
    @Transactional
    public void deleteShowtime(Long id) {
        if (!showtimeRepository.existsById(id)) {
            throw new IllegalArgumentException("Cannot delete: Showtime not found with ID: " + id);
        }
        showtimeRepository.deleteById(id);
    }
}