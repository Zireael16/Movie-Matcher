import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';

/**
 * Home Page Component
 * Displays available movies and interactive showtime badges that navigate
 * to the seat layout selection screen (/booking/:showtimeId).
 */
export default function Home() {
  const navigate = useNavigate();
  const [movies, setMovies] = useState([]);
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

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
    <div style={{ width: '100%', maxWidth: '1440px', margin: '36px auto', padding: '0 36px' }}>
      <header style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2.2rem', color: '#0f172a', fontWeight: '800', margin: '0 0 8px 0' }}>
          Now Showing
        </h1>
        <p style={{ margin: 0, color: '#64748b', fontSize: '1.05rem' }}>
          Explore featured titles and book tickets across our auditoriums.
        </p>
      </header>

      {errorMessage && (
        <div style={{ backgroundColor: '#fee2e2', color: '#b91c1c', border: '1px solid #fecaca', borderRadius: '4px', padding: '12px 16px', marginBottom: '24px' }}>
          {errorMessage}
        </div>
      )}

      {movies.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '80px 20px', backgroundColor: '#ffffff', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
          <p style={{ margin: 0, color: '#64748b', fontSize: '1.1rem' }}>No movies scheduled right now.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '24px' }}>
          {movies.map((movie) => {
            const movieSchedules = showtimes.filter((st) => st.movieId === movie.id);

            return (
              <div
                key={movie.id}
                style={{
                  backgroundColor: '#ffffff',
                  borderRadius: '10px',
                  border: '1px solid #e2e8f0',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
                  display: 'flex',
                  flexDirection: 'column',
                  padding: '24px',
                }}
              >
                <h2 style={{ fontSize: '1.35rem', margin: '0 0 8px 0', color: '#0f172a', fontWeight: '700' }}>
                  {movie.title}
                </h2>
                <p style={{ fontSize: '0.92rem', color: '#475569', lineHeight: '1.5', margin: '0 0 16px 0', flex: '1 0 auto' }}>
                  {movie.description}
                </p>

                <div style={{ fontSize: '0.88rem', color: '#64748b', marginBottom: '18px' }}>
                  Duration: <strong style={{ color: '#1e293b' }}>{movie.durationMinutes} mins</strong>
                </div>

                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                  <div style={{ fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#94a3b8', marginBottom: '12px' }}>
                    Available Showtimes
                  </div>

                  {movieSchedules.length === 0 ? (
                    <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>No showtimes scheduled</span>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      {movieSchedules.map((schedule) => (
                        <div
                          key={schedule.id}
                          onClick={() => navigate(`/booking/${schedule.id}`)}
                          style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'center',
                            backgroundColor: '#f8fafc',
                            border: '1px solid #edf2f7',
                            padding: '10px 14px',
                            borderRadius: '6px',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = '#0284c7';
                            e.currentTarget.style.backgroundColor = '#f0f9ff';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = '#edf2f7';
                            e.currentTarget.style.backgroundColor = '#f8fafc';
                          }}
                        >
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                            <strong style={{ color: '#0f172a', fontSize: '0.92rem' }}>
                              {formatShowtime(schedule.startTime)}
                            </strong>
                            <span style={{ color: '#64748b', fontSize: '0.82rem' }}>
                              {schedule.screenName}
                            </span>
                          </div>

                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ color: '#0f766e', fontWeight: '700', fontSize: '1rem' }}>
                              ₹{Number(schedule.ticketPrice).toFixed(0)}
                            </span>
                            <span style={{ color: '#0284c7', fontSize: '0.8rem', fontWeight: '600' }}>
                              Book →
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}