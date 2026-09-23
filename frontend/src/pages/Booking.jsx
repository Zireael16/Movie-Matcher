import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import SeatGrid from '../components/booking/SeatGrid';

/**
 * Booking Page Component - BookMyShow Theme
 * Displays screening header, interactive SeatGrid, and bottom checkout bar.
 */
const Booking = () => {
  const { showtimeId } = useParams();
  const navigate = useNavigate();

  const [layout, setLayout] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchSeatLayout = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await api.get(`/showtimes/${showtimeId}/seats`);
        setLayout(response.data);
      } catch (err) {
        console.error('Failed to load theater layout:', err);
        setError(
          err.response?.data?.message || 'Unable to retrieve seat layout for this screening.'
        );
      } finally {
        setLoading(false);
      }
    };

    if (showtimeId) {
      fetchSeatLayout();
    }
  }, [showtimeId]);

  const handleSeatToggle = (seat) => {
    setSelectedSeats((prev) => {
      const exists = prev.some((s) => s.id === seat.id);
      if (exists) {
        return prev.filter((s) => s.id !== seat.id);
      } else {
        if (prev.length >= 8) {
          alert('You can select a maximum of 8 seats per reservation.');
          return prev;
        }
        return [...prev, seat];
      }
    });
  };

  const totalPrice = selectedSeats.reduce((sum, seat) => sum + Number(seat.price), 0);

  const formatShowtimeDate = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', color: '#64748b' }}>
        <p style={{ fontSize: '1.1rem' }}>Loading auditorium layout...</p>
      </div>
    );
  }

  if (error || !layout) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #fee2e2',
          padding: '24px 32px',
          borderRadius: '8px',
          textAlign: 'center',
          boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
        }}>
          <h2 style={{ color: '#ef4444', margin: '0 0 8px 0', fontSize: '1.25rem' }}>Unavailable</h2>
          <p style={{ color: '#64748b', margin: '0 0 16px 0', fontSize: '0.9rem' }}>{error || 'Showtime not found.'}</p>
          <button
            onClick={() => navigate('/')}
            style={{
              backgroundColor: '#0f172a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 16px',
              fontSize: '0.85rem',
              cursor: 'pointer',
            }}
          >
            Return to Movies
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ width: '100%', minHeight: 'calc(100vh - 70px)', display: 'flex', flexDirection: 'column', backgroundColor: '#ffffff' }}>

      {/* Top Header Bar */}
      <div style={{
        borderBottom: '1px solid #e2e8f0',
        backgroundColor: '#ffffff',
        padding: '14px 36px',
        position: 'sticky',
        top: 0,
        zIndex: 10,
        boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <button
                onClick={() => navigate('/')}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#64748b',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  padding: 0,
                }}
              >
                ← Back
              </button>
              <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', color: '#0f172a' }}>
                {layout.movieTitle}
              </h1>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>
              {layout.screenName} | {formatShowtimeDate(layout.startTime)}
            </p>
          </div>

          <div>
            <span style={{
              backgroundColor: '#f1f5f9',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '0.85rem',
              fontWeight: '600',
              color: '#334155',
            }}>
              Base Price: ₹{Number(layout.basePrice).toFixed(0)}
            </span>
          </div>
        </div>
      </div>

      {/* Main Seat Map Area */}
      <main style={{ flex: 1, padding: '36px 16px 120px 16px' }}>
        <SeatGrid
          seats={layout.seats}
          selectedSeatIds={selectedSeats.map((s) => s.id)}
          onSeatToggle={handleSeatToggle}
        />
      </main>

      {/* Fixed Bottom Checkout Summary Bar */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#ffffff',
        borderTop: '1px solid #e2e8f0',
        padding: '16px 36px',
        boxShadow: '0 -4px 12px rgba(0,0,0,0.06)',
        zIndex: 20,
      }}>
        <div style={{
          maxWidth: '960px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <div>
            <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: '#64748b', fontWeight: '700', letterSpacing: '0.5px' }}>
              Selected Seats ({selectedSeats.length})
            </div>
            <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
              {selectedSeats.length > 0 ? (
                selectedSeats.map((seat) => (
                  <span
                    key={seat.id}
                    style={{
                      backgroundColor: '#fef08a',
                      color: '#854d0e',
                      border: '1px solid #facc15',
                      padding: '2px 8px',
                      borderRadius: '4px',
                      fontSize: '0.8rem',
                      fontWeight: '700',
                    }}
                  >
                    {seat.id}
                  </span>
                ))
              ) : (
                <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontStyle: 'italic' }}>
                  No seats selected yet
                </span>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <div style={{ textAlign: 'right' }}>
              <span style={{ display: 'block', fontSize: '0.78rem', color: '#64748b', fontWeight: '600' }}>
                Total Amount
              </span>
              <span style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a' }}>
                ₹{totalPrice.toFixed(0)}
              </span>
            </div>

            <button
              type="button"
              disabled={selectedSeats.length === 0}
              onClick={() => {
                // Phase 4 will call Redis lock and mount CheckoutModal
                alert(`Proceeding to lock seats: ${selectedSeats.map((s) => s.id).join(', ')}`);
              }}
              style={{
                backgroundColor: selectedSeats.length === 0 ? '#e2e8f0' : '#eab308',
                color: selectedSeats.length === 0 ? '#94a3b8' : '#000000',
                border: 'none',
                borderRadius: '6px',
                padding: '12px 28px',
                fontSize: '0.92rem',
                fontWeight: '700',
                cursor: selectedSeats.length === 0 ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: selectedSeats.length === 0 ? 'none' : '0 2px 8px rgba(234, 179, 8, 0.4)',
              }}
            >
              Proceed to Lock
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;