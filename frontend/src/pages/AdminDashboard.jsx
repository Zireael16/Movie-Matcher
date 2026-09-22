import React, { useState, useEffect } from 'react';
import axios from '../api/axios'; // Pre-configured Axios instance with JWT interceptor

export default function AdminDashboard() {
  // --- Data State ---
  const [movies, setMovies] = useState([]);
  const [screens, setScreens] = useState([
    { id: 1, name: 'Screen 1 - IMAX' },
    { id: 2, name: 'Screen 2 - Dolby Atmos' },
    { id: 3, name: 'Screen 3 - Standard' }
  ]);
  const [showtimes, setShowtimes] = useState([]);

  // --- Form States ---
  const [movieForm, setMovieForm] = useState({
    title: '',
    description: '',
    durationMinutes: ''
  });

  const [showtimeForm, setShowtimeForm] = useState({
    movieId: '',
    screenId: '',
    startTime: '',
    ticketPrice: ''
  });

  // --- UI Feedback State ---
  const [movieError, setMovieError] = useState('');
  const [movieSuccess, setMovieSuccess] = useState('');
  const [showtimeError, setShowtimeError] = useState('');
  const [showtimeSuccess, setShowtimeSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  // --- Initial Data Load ---
  useEffect(() => {
    fetchMovies();
    fetchShowtimes();
  }, []);

  const fetchMovies = async () => {
    try {
      const response = await axios.get('/movies');
      setMovies(response.data);
    } catch (err) {
      console.error('Failed to load movies:', err);
    }
  };

  const fetchShowtimes = async () => {
    try {
      const response = await axios.get('/showtimes');
      setShowtimes(response.data);
    } catch (err) {
      console.error('Failed to load showtimes:', err);
    }
  };

  // --- Handle Movie Creation ---
  const handleMovieSubmit = async (e) => {
    e.preventDefault();
    setMovieError('');
    setMovieSuccess('');
    setLoading(true);

    try {
      const payload = {
        title: movieForm.title,
        description: movieForm.description,
        durationMinutes: parseInt(movieForm.durationMinutes, 10)
      };

      const response = await axios.post('/movies', payload);
      setMovieSuccess(`Movie "${response.data.title}" added successfully!`);
      setMovieForm({ title: '', description: '', durationMinutes: '' });
      fetchMovies();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Failed to create movie.';
      setMovieError(msg);
    } finally {
      setLoading(false);
    }
  };

  // --- Handle Showtime Scheduling ---
  const handleShowtimeSubmit = async (e) => {
    e.preventDefault();
    setShowtimeError('');
    setShowtimeSuccess('');
    setLoading(true);

    try {
      // Convert HTML datetime-local (YYYY-MM-DDTHH:mm) to ISO-8601 with timezone
      const isoStartTime = new Date(showtimeForm.startTime).toISOString();

      const payload = {
        movieId: parseInt(showtimeForm.movieId, 10),
        screenId: parseInt(showtimeForm.screenId, 10),
        startTime: isoStartTime,
        ticketPrice: parseFloat(showtimeForm.ticketPrice)
      };

      await axios.post('/showtimes', payload);
      setShowtimeSuccess('Showtime scheduled successfully!');
      setShowtimeForm({ movieId: '', screenId: '', startTime: '', ticketPrice: '' });
      fetchShowtimes();
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Failed to schedule showtime.';
      setShowtimeError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '1100px', margin: '30px auto', padding: '0 20px', fontFamily: 'sans-serif' }}>
      <h1>Admin Management Dashboard</h1>
      <p style={{ color: '#666' }}>Catalog administration: add movies and schedule non-overlapping showtimes.</p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '30px', marginTop: '20px' }}>

        {/* --- Form 1: Add New Movie --- */}
        <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px', backgroundColor: '#fafafa' }}>
          <h2>Add New Movie</h2>
          {movieSuccess && <div style={{ color: 'green', marginBottom: '10px' }}>{movieSuccess}</div>}
          {movieError && <div style={{ color: 'red', marginBottom: '10px' }}>{movieError}</div>}

          <form onSubmit={handleMovieSubmit}>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontWeight: 'bold' }}>Title:</label>
              <input
                type="text"
                required
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                value={movieForm.title}
                onChange={(e) => setMovieForm({ ...movieForm, title: e.target.value })}
                placeholder="e.g. Inception"
              />
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontWeight: 'bold' }}>Runtime (Minutes):</label>
              <input
                type="number"
                min="1"
                required
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                value={movieForm.durationMinutes}
                onChange={(e) => setMovieForm({ ...movieForm, durationMinutes: e.target.value })}
                placeholder="e.g. 148"
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontWeight: 'bold' }}>Description:</label>
              <textarea
                rows="3"
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                value={movieForm.description}
                onChange={(e) => setMovieForm({ ...movieForm, description: e.target.value })}
                placeholder="Brief synopsis..."
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                backgroundColor: '#007bff',
                color: '#fff',
                padding: '10px 16px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {loading ? 'Submitting...' : 'Save Movie'}
            </button>
          </form>
        </div>

        {/* --- Form 2: Schedule Showtime --- */}
        <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px', backgroundColor: '#fafafa' }}>
          <h2>Schedule Showtime</h2>
          {showtimeSuccess && <div style={{ color: 'green', marginBottom: '10px' }}>{showtimeSuccess}</div>}
          {showtimeError && <div style={{ color: 'red', marginBottom: '10px' }}>{showtimeError}</div>}

          <form onSubmit={handleShowtimeSubmit}>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontWeight: 'bold' }}>Select Movie:</label>
              <select
                required
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                value={showtimeForm.movieId}
                onChange={(e) => setShowtimeForm({ ...showtimeForm, movieId: e.target.value })}
              >
                <option value="">-- Choose Movie --</option>
                {movies.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.title} ({m.durationMinutes} min)
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontWeight: 'bold' }}>Select Screen:</label>
              <select
                required
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                value={showtimeForm.screenId}
                onChange={(e) => setShowtimeForm({ ...showtimeForm, screenId: e.target.value })}
              >
                <option value="">-- Choose Screen --</option>
                {screens.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>

            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontWeight: 'bold' }}>Start Date & Time:</label>
              <input
                type="datetime-local"
                required
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                value={showtimeForm.startTime}
                onChange={(e) => setShowtimeForm({ ...showtimeForm, startTime: e.target.value })}
              />
            </div>

            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', fontWeight: 'bold' }}>Ticket Price (₹):</label>
              <input
                type="number"
                step="0.50"
                min="0"
                required
                style={{ width: '100%', padding: '8px', boxSizing: 'border-box' }}
                value={showtimeForm.ticketPrice}
                onChange={(e) => setShowtimeForm({ ...showtimeForm, ticketPrice: e.target.value })}
                placeholder="e.g. 199"
              />
            </div>

            <button
              type="submit"
              disabled={loading || movies.length === 0}
              style={{
                backgroundColor: '#28a745',
                color: '#fff',
                padding: '10px 16px',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              {loading ? 'Scheduling...' : 'Schedule Showtime'}
            </button>
          </form>
        </div>
      </div>

      {/* --- Section 3: Live Showtime Schedule View --- */}
      <div style={{ marginTop: '40px' }}>
        <h2>Current Schedule</h2>
        {showtimes.length === 0 ? (
          <p style={{ color: '#888' }}>No showtimes scheduled yet.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
            <thead>
              <tr style={{ backgroundColor: '#eaeaea', textAlign: 'left' }}>
                <th style={{ padding: '8px', border: '1px solid #ccc' }}>Movie</th>
                <th style={{ padding: '8px', border: '1px solid #ccc' }}>Screen</th>
                <th style={{ padding: '8px', border: '1px solid #ccc' }}>Start Time</th>
                <th style={{ padding: '8px', border: '1px solid #ccc' }}>End Time</th>
                <th style={{ padding: '8px', border: '1px solid #ccc' }}>Price</th>
              </tr>
            </thead>
            <tbody>
              {showtimes.map((st) => (
                <tr key={st.id}>
                  <td style={{ padding: '8px', border: '1px solid #ccc' }}>{st.movieTitle}</td>
                  <td style={{ padding: '8px', border: '1px solid #ccc' }}>{st.screenName}</td>
                  <td style={{ padding: '8px', border: '1px solid #ccc' }}>
                    {new Date(st.startTime).toLocaleString()}
                  </td>
                  <td style={{ padding: '8px', border: '1px solid #ccc' }}>
                    {new Date(st.endTime).toLocaleString()}
                  </td>
                  <td style={{ padding: '8px', border: '1px solid #ccc' }}>
                    ${Number(st.ticketPrice).toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}