import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

/**
 * Home Page Component
 * Displays available movies with a 2:3 vertical poster card ratio,
 * bottom rating overlay bar, runtime, and interactive showtime badges.
 */
export default function Home() {
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');
  const [expandedMovieIds, setExpandedMovieIds] = useState(new Set());

  useEffect(() => {
    const fetchCatalog = async () => {
      try {
        setErrorMessage('');
        const [moviesResponse, showtimesResponse] = await Promise.all([
          api.get('/movies'),
          api.get('/showtimes'),
        ]);

        setMovies(moviesResponse.data || []);
        setShowtimes(showtimesResponse.data || []);
      } catch (error) {
        console.error('Failed to load catalog:', error);
        setErrorMessage('Unable to load movie listings. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCatalog();
  }, []);

  const toggleExpandDescription = (movieId) => {
    setExpandedMovieIds((prev) => {
      const next = new Set(prev);
      if (next.has(movieId)) {
        next.delete(movieId);
      } else {
        next.add(movieId);
      }
      return next;
    });
  };

  // Formats to: "22 Sep, 07:30 PM"
  const formatShowtime = (isoString) => {
    const date = new Date(isoString);
    const datePart = date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
    });
    const timePart = date.toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
    return `${datePart}, ${timePart}`;
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', color: '#64748b' }}>
        <p style={{ fontSize: '1.1rem' }}>Loading current listings...</p>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', maxWidth: '1320px', margin: '36px auto', padding: '0 24px' }}>
      <header style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '2rem', color: '#0f172a', fontWeight: '800', margin: '0 0 6px 0' }}>
          Now Showing
        </h1>
        <p style={{ margin: 0, color: '#64748b', fontSize: '0.98rem' }}>
          Explore featured titles and book tickets across our auditoriums.
        </p>
      </header>

      {errorMessage && (
        <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca', borderRadius: '6px', padding: '12px 16px', marginBottom: '24px' }}>
          {errorMessage}
        </div>
      )}

      {movies.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
          <p style={{ margin: 0, color: '#64748b', fontSize: '1.1rem' }}>No movies scheduled right now.</p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
            gap: '24px',
            alignItems: 'start',
          }}
        >
          {movies.map((movie) => {
            const movieSchedules = showtimes.filter((st) => st.movieId === movie.id);
            const hasPoster = movie.posterUrl && movie.posterUrl !== 'N/A';
            const hasRating = movie.imdbRating && movie.imdbRating !== 'N/A';
            const isExpanded = expandedMovieIds.has(movie.id);
            const description = movie.description || '';
            const isLongDescription = description.length > 80;

            return (
              <div
                key={movie.id}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.04)',
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
              >
                {/* 2:3 Aspect Ratio Movie Poster Container */}
                <div
                  style={{
                    position: 'relative',
                    width: '100%',
                    aspectRatio: '2 / 3',
                    backgroundColor: '#0f172a',
                    overflow: 'hidden',
                  }}
                >
                  {hasPoster ? (
                    <img
                      src={movie.posterUrl}
                      alt={movie.title}
                      onError={(e) => {
                        e.target.style.display = 'none';
                      }}
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                      }}
                    />
                  ) : (
                    <div
                      style={{
                        width: '100%',
                        height: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: '#94a3b8',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        textAlign: 'center',
                        padding: '16px',
                        background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                      }}
                    >
                      🎬 No Poster Available
                    </div>
                  )}

                  {/* Bottom Rating Bar */}
                  {hasRating && (
                    <div
                      style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        right: 0,
                        backgroundColor: '#000000',
                        color: '#ffffff',
                        padding: '8px 12px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        borderBottomLeftRadius: '0px',
                        borderBottomRightRadius: '0px',
                      }}
                    >
                      <span style={{ color: '#f43f5e', fontSize: '1rem', lineHeight: '1' }}>★</span>
                      <strong style={{ fontSize: '0.92rem', color: '#ffffff', fontWeight: '800' }}>
                        {movie.imdbRating}/10
                      </strong>
                      <span style={{ fontSize: '0.78rem', color: '#cbd5e1', fontWeight: '500' }}>
                        IMDb
                      </span>
                    </div>
                  )}
                </div>

                {/* Card Information */}
                <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: '1 0 auto' }}>
                  <h2
                    style={{
                      fontSize: '1.15rem',
                      margin: '0 0 6px 0',
                      color: '#0f172a',
                      fontWeight: '800',
                      lineHeight: '1.3',
                    }}
                  >
                    {movie.title}
                  </h2>

                  <div style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '10px' }}>
                    <span>{movie.durationMinutes ? `${movie.durationMinutes} mins` : 'Feature Film'}</span>
                  </div>

                  {/* Synopsis Toggle */}
                  {description && (
                    <div style={{ marginBottom: '14px' }}>
                      <p
                        style={{
                          fontSize: '0.82rem',
                          color: '#475569',
                          lineHeight: '1.45',
                          margin: 0,
                          ...(isExpanded
                            ? {}
                            : {
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                overflow: 'hidden',
                              }),
                        }}
                      >
                        {description}
                      </p>

                      {isLongDescription && (
                        <button
                          type="button"
                          onClick={() => toggleExpandDescription(movie.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            padding: '3px 0 0 0',
                            color: '#0284c7',
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                          }}
                        >
                          {isExpanded ? 'Show less ▲' : 'Read more ▼'}
                        </button>
                      )}
                    </div>
                  )}

                  {/* Available Showtimes Section */}
                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '12px', marginTop: 'auto' }}>
                    <div
                      style={{
                        fontSize: '0.72rem',
                        fontWeight: '700',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        color: '#94a3b8',
                        marginBottom: '8px',
                      }}
                    >
                      Showtimes
                    </div>

                    {movieSchedules.length === 0 ? (
                      <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>No screenings available</span>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        {movieSchedules.map((schedule) => (
                          <div
                            key={schedule.id}
                            onClick={() => navigate(`/booking/${schedule.id}`)}
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              backgroundColor: '#f8fafc',
                              border: '1px solid #e2e8f0',
                              padding: '8px 10px',
                              borderRadius: '6px',
                              cursor: 'pointer',
                              transition: 'all 0.15s ease',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.borderColor = '#0284c7';
                              e.currentTarget.style.backgroundColor = '#f0f9ff';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.borderColor = '#e2e8f0';
                              e.currentTarget.style.backgroundColor = '#f8fafc';
                            }}
                          >
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                              <strong style={{ color: '#0f172a', fontSize: '0.82rem' }}>
                                {formatShowtime(schedule.startTime)}
                              </strong>
                              <span style={{ color: '#64748b', fontSize: '0.72rem' }}>
                                {schedule.screenName}
                              </span>
                            </div>

                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{ color: '#0f766e', fontWeight: '700', fontSize: '0.88rem' }}>
                                ₹{Number(schedule.ticketPrice).toFixed(0)}
                              </span>
                              <span style={{ color: '#0284c7', fontSize: '0.75rem', fontWeight: '700' }}>
                                Book →
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}