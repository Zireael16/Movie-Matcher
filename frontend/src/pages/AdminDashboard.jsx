import React, { useState, useEffect } from 'react';
import api from '../api/axios';

/**
 * Enterprise Administrative Portal for Movie and Showtime Management.
 * Communicates with Spring Boot backend endpoints:
 * - GET /movies, POST /movies, DELETE /movies/{id}
 * - GET /showtimes, POST /showtimes, DELETE /showtimes/{id}
 * - GET /movies/omdb-lookup?query={query}
 */
export default function AdminDashboard() {
  // OMDb Query State
  const [omdbQuery, setOmdbQuery] = useState('');
  const [isFetchingOmdb, setIsFetchingOmdb] = useState(false);

  // Movie Creation Form State
  const [movieTitle, setMovieTitle] = useState('');
  const [movieDescription, setMovieDescription] = useState('');
  const [durationMinutes, setDurationMinutes] = useState('');
  const [posterUrl, setPosterUrl] = useState('');
  const [imdbRating, setImdbRating] = useState('');

  // Showtime Scheduling Form State
  const [selectedMovieId, setSelectedMovieId] = useState('');
  const [selectedScreenId, setSelectedScreenId] = useState('1');
  const [startTime, setStartTime] = useState('');
  const [ticketPrice, setTicketPrice] = useState('');

  // Catalog Data & UI Status State
  const [movies, setMovies] = useState([]);
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState({ type: '', text: '' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [deletingShowtimeId, setDeletingShowtimeId] = useState(null);

  // Available Screens (Pre-seeded in PostgreSQL)
  const screens = [
    { id: 1, name: 'Screen 1 - IMAX' },
    { id: 2, name: 'Screen 2 - Dolby Atmos' },
    { id: 3, name: 'Screen 3 - Standard' },
  ];

  const fetchDashboardData = async () => {
    try {
      const [moviesRes, showtimesRes] = await Promise.all([
        api.get('/movies'),
        api.get('/showtimes'),
      ]);
      setMovies(moviesRes.data || []);
      setShowtimes(showtimesRes.data || []);
    } catch (error) {
      console.error('Error fetching admin data:', error);
      setStatusMessage({
        type: 'error',
        text: 'Failed to load catalog data from server.',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleOmdbLookup = async (e) => {
    e.preventDefault();
    if (!omdbQuery.trim()) {
      setStatusMessage({
        type: 'error',
        text: 'Please enter an IMDb ID or Movie Title to lookup.',
      });
      return;
    }

    setIsFetchingOmdb(true);
    setStatusMessage({ type: '', text: '' });

    try {
      const response = await api.get(
        `/movies/omdb-lookup?query=${encodeURIComponent(omdbQuery.trim())}`
      );
      const data = response.data;

      if (!data) {
        throw new Error('Movie not found on OMDb.');
      }

      // Handle both PascalCase and camelCase payload shapes
      const resolvedTitle = data.Title || data.title || '';
      const resolvedDescription = data.Plot || data.description || data.plot || '';
      const rawPoster = data.Poster || data.posterUrl || data.poster || '';
      const resolvedPoster = rawPoster !== 'N/A' ? rawPoster : '';
      const resolvedRating = data.imdbRating || data.ImdbRating || '';

      let resolvedDuration = '';
      if (data.runtimeMinutes != null) {
        resolvedDuration = String(data.runtimeMinutes);
      } else if (data.durationMinutes != null) {
        resolvedDuration = String(data.durationMinutes);
      } else {
        const rawRuntime = data.Runtime || data.runtime || '';
        const parsed = parseInt(String(rawRuntime).replace(/[^0-9]/g, ''), 10);
        if (!Number.isNaN(parsed)) {
          resolvedDuration = String(parsed);
        }
      }

      setMovieTitle(resolvedTitle);
      setMovieDescription(resolvedDescription);
      setPosterUrl(resolvedPoster);
      setDurationMinutes(resolvedDuration);
      setImdbRating(resolvedRating !== 'N/A' ? resolvedRating : '');

      setStatusMessage({
        type: 'success',
        text: `Details fetched for "${resolvedTitle || 'movie'}". Review and edit before saving.`,
      });
    } catch (error) {
      console.error('OMDb lookup error:', error);
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Movie not found on OMDb or lookup failed.';
      setStatusMessage({ type: 'error', text: msg });
    } finally {
      setIsFetchingOmdb(false);
    }
  };

  const handleCreateMovie = async (e) => {
    e.preventDefault();
    setStatusMessage({ type: '', text: '' });
    setIsSubmitting(true);

    try {
      await api.post('/movies', {
        title: movieTitle.trim(),
        description: movieDescription.trim(),
        durationMinutes: parseInt(durationMinutes, 10),
        posterUrl: posterUrl.trim() || null,
        imdbRating: imdbRating.trim() || null,
      });

      setStatusMessage({
        type: 'success',
        text: `Movie "${movieTitle}" registered successfully.`,
      });
      setMovieTitle('');
      setMovieDescription('');
      setDurationMinutes('');
      setPosterUrl('');
      setImdbRating('');
      setOmdbQuery('');
      await fetchDashboardData();
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to create movie.';
      setStatusMessage({ type: 'error', text: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteMovie = async (movieId, movieTitle) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${movieTitle}"? This will permanently remove the movie and its associated showtimes.`
    );
    if (!confirmed) return;

    setStatusMessage({ type: '', text: '' });
    setDeletingId(movieId);

    try {
      await api.delete(`/movies/${movieId}`);
      setStatusMessage({
        type: 'success',
        text: `Movie "${movieTitle}" removed from inventory.`,
      });
      await fetchDashboardData();
    } catch (error) {
      console.error('Failed to delete movie:', error);
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Cannot delete movie. Ensure foreign key associations or active bookings allow removal.';
      setStatusMessage({ type: 'error', text: msg });
    } finally {
      setDeletingId(null);
    }
  };

  const handleScheduleShowtime = async (e) => {
    e.preventDefault();
    setStatusMessage({ type: '', text: '' });
    setIsSubmitting(true);

    try {
      const isoStartTime = new Date(startTime).toISOString();

      await api.post('/showtimes', {
        movieId: parseInt(selectedMovieId, 10),
        screenId: parseInt(selectedScreenId, 10),
        startTime: isoStartTime,
        ticketPrice: parseFloat(ticketPrice),
      });

      setStatusMessage({
        type: 'success',
        text: 'Showtime scheduled successfully.',
      });
      setStartTime('');
      setTicketPrice('');
      await fetchDashboardData();
    } catch (error) {
      const msg =
        error.response?.data?.message || 'Failed to schedule showtime.';
      setStatusMessage({ type: 'error', text: msg });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteShowtime = async (showtimeId, movieTitle, formattedTime) => {
    const confirmed = window.confirm(
      `Are you sure you want to cancel the screening of "${movieTitle}" at ${formattedTime}?`
    );
    if (!confirmed) return;

    setStatusMessage({ type: '', text: '' });
    setDeletingShowtimeId(showtimeId);

    try {
      await api.delete(`/showtimes/${showtimeId}`);
      setStatusMessage({
        type: 'success',
        text: 'Showtime successfully removed.',
      });
      await fetchDashboardData();
    } catch (error) {
      console.error('Failed to delete showtime:', error);
      const msg =
        error.response?.data?.message ||
        error.response?.data?.error ||
        'Cannot remove showtime. Existing ticket bookings may be attached.';
      setStatusMessage({ type: 'error', text: msg });
    } finally {
      setDeletingShowtimeId(null);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', color: '#64748b' }}>
        Loading admin console...
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: '1240px',
        margin: '32px auto',
        padding: '0 24px',
        fontFamily: 'sans-serif',
      }}
    >
      <header style={{ marginBottom: '28px' }}>
        <h1
          style={{
            fontSize: '1.85rem',
            color: '#0f172a',
            margin: '0 0 6px 0',
            fontWeight: '700',
          }}
        >
          Operations & Inventory Management
        </h1>
        <p style={{ margin: 0, color: '#64748b', fontSize: '0.95rem' }}>
          Register new movie titles, schedule screenings, and manage catalog inventory.
        </p>
      </header>

      {/* Alert Notification */}
      {statusMessage.text && (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '6px',
            marginBottom: '24px',
            fontSize: '0.9rem',
            backgroundColor:
              statusMessage.type === 'success' ? '#dcfce7' : '#fee2e2',
            color: statusMessage.type === 'success' ? '#166534' : '#991b1b',
            border: `1px solid ${
              statusMessage.type === 'success' ? '#bbf7d0' : '#fecaca'
            }`,
          }}
        >
          {statusMessage.text}
        </div>
      )}

      {/* OMDb Search & Auto-Fill Toolbar */}
      <section
        style={{
          backgroundColor: '#ffffff',
          padding: '20px 24px',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          marginBottom: '28px',
        }}
      >
        <div style={{ marginBottom: '12px' }}>
          <h2
            style={{
              fontSize: '1.1rem',
              margin: '0 0 4px 0',
              color: '#0f172a',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <span>🎬</span> Auto-Fill via OMDb Integration
          </h2>
          <p style={{ margin: 0, color: '#64748b', fontSize: '0.85rem' }}>
            Lookup movie metadata by IMDb identifier or film title to populate registration fields automatically.
          </p>
        </div>
        <form
          onSubmit={handleOmdbLookup}
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '12px',
            alignItems: 'center',
          }}
        >
          <input
            type="text"
            value={omdbQuery}
            onChange={(e) => setOmdbQuery(e.target.value)}
            placeholder="e.g. tt0111161 or Inception"
            disabled={isFetchingOmdb}
            style={{
              flex: '1 1 280px',
              padding: '10px 14px',
              borderRadius: '6px',
              border: '1px solid #cbd5e1',
              fontSize: '0.9rem',
              outline: 'none',
              boxSizing: 'border-box',
            }}
          />
          <button
            type="submit"
            disabled={isFetchingOmdb}
            style={{
              backgroundColor: '#3b82f6',
              color: '#ffffff',
              border: 'none',
              padding: '10px 20px',
              borderRadius: '6px',
              fontWeight: '600',
              fontSize: '0.9rem',
              cursor: isFetchingOmdb ? 'not-allowed' : 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              transition: 'background-color 0.2s',
            }}
          >
            {isFetchingOmdb ? (
              <>
                <span
                  style={{
                    display: 'inline-block',
                    width: '12px',
                    height: '12px',
                    border: '2px solid #ffffff',
                    borderTopColor: 'transparent',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                  }}
                />
                Fetching Details...
              </>
            ) : (
              'Fetch Details'
            )}
          </button>
        </form>
      </section>

      {/* Form Section */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '28px',
          marginBottom: '36px',
        }}
      >
        {/* Form 1: Add Movie */}
        <div
          style={{
            backgroundColor: '#ffffff',
            padding: '24px',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <h2
            style={{
              fontSize: '1.2rem',
              margin: '0 0 16px 0',
              color: '#0f172a',
            }}
          >
            Register New Movie
          </h2>
          <form onSubmit={handleCreateMovie}>
            {/* Visual Poster Preview & Main Inputs */}
            <div
              style={{
                display: 'flex',
                gap: '16px',
                marginBottom: '14px',
                alignItems: 'flex-start',
              }}
            >
              {/* Poster Thumbnail */}
              <div
                style={{
                  width: '90px',
                  height: '130px',
                  borderRadius: '6px',
                  border: '1px dashed #cbd5e1',
                  backgroundColor: '#f8fafc',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                  flexShrink: 0,
                }}
              >
                {posterUrl && posterUrl !== 'N/A' ? (
                  <img
                    src={posterUrl}
                    alt="Poster Preview"
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
                  <span
                    style={{
                      fontSize: '0.75rem',
                      color: '#94a3b8',
                      textAlign: 'center',
                      padding: '4px',
                    }}
                  >
                    No Poster
                  </span>
                )}
              </div>

              {/* Title, Duration, & IMDb Rating Fields */}
              <div style={{ flex: 1 }}>
                <div style={{ marginBottom: '12px' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.85rem',
                      fontWeight: '600',
                      marginBottom: '6px',
                      color: '#334155',
                    }}
                  >
                    Title
                  </label>
                  <input
                    type="text"
                    required
                    value={movieTitle}
                    onChange={(e) => setMovieTitle(e.target.value)}
                    placeholder="e.g. Interstellar"
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      boxSizing: 'border-box',
                      borderRadius: '4px',
                      border: '1px solid #cbd5e1',
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        marginBottom: '6px',
                        color: '#334155',
                      }}
                    >
                      Duration (min)
                    </label>
                    <input
                      type="number"
                      required
                      min="1"
                      value={durationMinutes}
                      onChange={(e) => setDurationMinutes(e.target.value)}
                      placeholder="169"
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        boxSizing: 'border-box',
                        borderRadius: '4px',
                        border: '1px solid #cbd5e1',
                      }}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display: 'block',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        marginBottom: '6px',
                        color: '#334155',
                      }}
                    >
                      IMDb Rating
                    </label>
                    <input
                      type="text"
                      value={imdbRating}
                      onChange={(e) => setImdbRating(e.target.value)}
                      placeholder="e.g. 8.8"
                      style={{
                        width: '100%',
                        padding: '8px 12px',
                        boxSizing: 'border-box',
                        borderRadius: '4px',
                        border: '1px solid #cbd5e1',
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Poster URL Manual Override */}
            <div style={{ marginBottom: '14px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  marginBottom: '6px',
                  color: '#334155',
                }}
              >
                Poster Image URL (Optional)
              </label>
              <input
                type="url"
                value={posterUrl}
                onChange={(e) => setPosterUrl(e.target.value)}
                placeholder="https://m.media-amazon.com/images/..."
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  boxSizing: 'border-box',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1',
                }}
              />
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  marginBottom: '6px',
                  color: '#334155',
                }}
              >
                Description
              </label>
              <textarea
                required
                rows="3"
                value={movieDescription}
                onChange={(e) => setMovieDescription(e.target.value)}
                placeholder="Short synopsis..."
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  boxSizing: 'border-box',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: '100%',
                backgroundColor: '#0f172a',
                color: '#ffffff',
                border: 'none',
                padding: '10px',
                borderRadius: '4px',
                fontWeight: '600',
                cursor: isSubmitting ? 'not-allowed' : 'pointer',
              }}
            >
              {isSubmitting ? 'Processing...' : 'Add Movie'}
            </button>
          </form>
        </div>

        {/* Form 2: Schedule Showtime */}
        <div
          style={{
            backgroundColor: '#ffffff',
            padding: '24px',
            borderRadius: '8px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <h2
            style={{
              fontSize: '1.2rem',
              margin: '0 0 16px 0',
              color: '#0f172a',
            }}
          >
            Schedule Showtime
          </h2>
          <form onSubmit={handleScheduleShowtime}>
            <div style={{ marginBottom: '14px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  marginBottom: '6px',
                  color: '#334155',
                }}
              >
                Select Movie
              </label>
              <select
                required
                value={selectedMovieId}
                onChange={(e) => setSelectedMovieId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  boxSizing: 'border-box',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1',
                }}
              >
                <option value="">-- Choose a film --</option>
                {movies.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title} ({m.durationMinutes}m) {m.imdbRating ? `★ ${m.imdbRating}` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  marginBottom: '6px',
                  color: '#334155',
                }}
              >
                Auditorium Screen
              </label>
              <select
                value={selectedScreenId}
                onChange={(e) => setSelectedScreenId(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  boxSizing: 'border-box',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1',
                }}
              >
                {screens.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  marginBottom: '6px',
                  color: '#334155',
                }}
              >
                Screening Start Time
              </label>
              <input
                type="datetime-local"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  boxSizing: 'border-box',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1',
                }}
              />
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  marginBottom: '6px',
                  color: '#334155',
                }}
              >
                Ticket Price (₹)
              </label>
              <input
                type="number"
                step="1"
                min="0"
                required
                value={ticketPrice}
                onChange={(e) => setTicketPrice(e.target.value)}
                placeholder="250"
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  boxSizing: 'border-box',
                  borderRadius: '4px',
                  border: '1px solid #cbd5e1',
                }}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting || movies.length === 0}
              style={{
                width: '100%',
                backgroundColor: '#e50914',
                color: '#ffffff',
                border: 'none',
                padding: '10px',
                borderRadius: '4px',
                fontWeight: '600',
                cursor: isSubmitting || movies.length === 0 ? 'not-allowed' : 'pointer',
              }}
            >
              {isSubmitting ? 'Verifying schedule...' : 'Schedule Screening'}
            </button>
          </form>
        </div>
      </div>

      {/* Section 1: Movie Catalog Inventory & Deletion */}
      <section
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          padding: '24px',
          marginBottom: '32px',
        }}
      >
        <h2
          style={{
            fontSize: '1.25rem',
            margin: '0 0 16px 0',
            color: '#0f172a',
          }}
        >
          Movie Inventory ({movies.length})
        </h2>

        {movies.length === 0 ? (
          <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.95rem' }}>
            No movies registered in catalog.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                textAlign: 'left',
                fontSize: '0.9rem',
              }}
            >
              <thead>
                <tr
                  style={{
                    borderBottom: '2px solid #e2e8f0',
                    color: '#475569',
                  }}
                >
                  <th style={{ padding: '10px 14px' }}>Poster</th>
                  <th style={{ padding: '10px 14px' }}>Title</th>
                  <th style={{ padding: '10px 14px' }}>Rating</th>
                  <th style={{ padding: '10px 14px' }}>Duration</th>
                  <th style={{ padding: '10px 14px' }}>Description</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {movies.map((m) => (
                  <tr key={m.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '12px 14px' }}>
                      {m.posterUrl ? (
                        <img
                          src={m.posterUrl}
                          alt={m.title}
                          style={{
                            width: '36px',
                            height: '52px',
                            objectFit: 'cover',
                            borderRadius: '3px',
                          }}
                        />
                      ) : (
                        <div
                          style={{
                            width: '36px',
                            height: '52px',
                            backgroundColor: '#f1f5f9',
                            borderRadius: '3px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.65rem',
                            color: '#94a3b8',
                          }}
                        >
                          N/A
                        </div>
                      )}
                    </td>
                    <td
                      style={{
                        padding: '12px 14px',
                        fontWeight: '600',
                        color: '#0f172a',
                      }}
                    >
                      {m.title}
                    </td>
                    <td style={{ padding: '12px 14px', fontWeight: '700', color: '#b45309' }}>
                      {m.imdbRating ? `★ ${m.imdbRating}` : '-'}
                    </td>
                    <td style={{ padding: '12px 14px', color: '#475569' }}>
                      {m.durationMinutes} mins
                    </td>
                    <td
                      style={{
                        padding: '12px 14px',
                        color: '#64748b',
                        maxWidth: '340px',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {m.description}
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                      <button
                        onClick={() => handleDeleteMovie(m.id, m.title)}
                        disabled={deletingId === m.id}
                        style={{
                          backgroundColor: '#fee2e2',
                          color: '#b91c1c',
                          border: '1px solid #fecaca',
                          padding: '6px 12px',
                          borderRadius: '4px',
                          fontWeight: '600',
                          fontSize: '0.8rem',
                          cursor: deletingId === m.id ? 'not-allowed' : 'pointer',
                          transition: 'background-color 0.2s',
                        }}
                      >
                        {deletingId === m.id ? 'Deleting...' : 'Delete'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Section 2: Active Showtimes Table & Showtime Deletion */}
      <section
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          padding: '24px',
        }}
      >
        <h2
          style={{
            fontSize: '1.25rem',
            margin: '0 0 16px 0',
            color: '#0f172a',
          }}
        >
          Scheduled Showtimes ({showtimes.length})
        </h2>

        {showtimes.length === 0 ? (
          <p style={{ color: '#94a3b8', margin: 0, fontSize: '0.95rem' }}>
            No showtimes currently active in database.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                textAlign: 'left',
                fontSize: '0.9rem',
              }}
            >
              <thead>
                <tr
                  style={{
                    borderBottom: '2px solid #e2e8f0',
                    color: '#475569',
                  }}
                >
                  <th style={{ padding: '10px 14px' }}>Movie</th>
                  <th style={{ padding: '10px 14px' }}>Screen</th>
                  <th style={{ padding: '10px 14px' }}>Start Time</th>
                  <th style={{ padding: '10px 14px' }}>End Time</th>
                  <th style={{ padding: '10px 14px' }}>Price</th>
                  <th style={{ padding: '10px 14px', textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {showtimes.map((st) => {
                  const formattedStartTime = new Date(st.startTime).toLocaleString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  });

                  return (
                    <tr key={st.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td
                        style={{
                          padding: '12px 14px',
                          fontWeight: '600',
                          color: '#0f172a',
                        }}
                      >
                        {st.movieTitle}
                      </td>
                      <td style={{ padding: '12px 14px', color: '#475569' }}>
                        {st.screenName}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        {formattedStartTime}
                      </td>
                      <td style={{ padding: '12px 14px', color: '#64748b' }}>
                        {new Date(st.endTime).toLocaleString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                      <td
                        style={{
                          padding: '12px 14px',
                          fontWeight: '600',
                          color: '#0f766e',
                        }}
                      >
                        ₹{Number(st.ticketPrice).toFixed(0)}
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                        <button
                          onClick={() =>
                            handleDeleteShowtime(st.id, st.movieTitle, formattedStartTime)
                          }
                          disabled={deletingShowtimeId === st.id}
                          style={{
                            backgroundColor: '#fee2e2',
                            color: '#b91c1c',
                            border: '1px solid #fecaca',
                            padding: '6px 12px',
                            borderRadius: '4px',
                            fontWeight: '600',
                            fontSize: '0.8rem',
                            cursor: deletingShowtimeId === st.id ? 'not-allowed' : 'pointer',
                            transition: 'background-color 0.2s',
                          }}
                        >
                          {deletingShowtimeId === st.id ? 'Canceling...' : 'Cancel Showtime'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}