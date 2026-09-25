import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import bookingApi from '../api/bookingApi';
import SeatGrid from '../components/booking/SeatGrid';
import HoldTimer from '../components/booking/HoldTimer';

const CONVENIENCE_FEE_PER_SEAT = 25;
const MAX_SEATS_ALLOWED = 6;

/**
 * Booking Page Component - Phase 5 Orchestration
 * Coordinates seat selection, Redis lock acquisition, HoldTimer synchronization,
 * dynamic pricing calculations, and transactional checkout.
 */
const Booking = () => {
  const { showtimeId } = useParams();
  const navigate = useNavigate();

  // Screen layout & selection state
  const [layout, setLayout] = useState(null);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Lock & Checkout state
  const [holdToken, setHoldToken] = useState(null);
  const [expiresInSeconds, setExpiresInSeconds] = useState(600);
  const [isLocked, setIsLocked] = useState(false);
  const [lockingLoading, setLockingLoading] = useState(false);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('UPI');

  // Keep references for clean unmount/expiration release
  const holdTokenRef = useRef(holdToken);
  const selectedSeatsRef = useRef(selectedSeats);

  useEffect(() => {
    holdTokenRef.current = holdToken;
  }, [holdToken]);

  useEffect(() => {
    selectedSeatsRef.current = selectedSeats;
  }, [selectedSeats]);

  const fetchSeatLayout = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const data = await bookingApi.getShowtimeSeats(showtimeId);
      setLayout(data);
    } catch (err) {
      console.error('Failed to load theater layout:', err);
      setError(err.message || 'Unable to retrieve seat layout for this screening.');
    } finally {
      setLoading(false);
    }
  }, [showtimeId]);

  useEffect(() => {
    if (showtimeId) {
      fetchSeatLayout();
    }
  }, [showtimeId, fetchSeatLayout]);

  const handleSeatToggle = (seat) => {
    if (isLocked) {
      return; // Prevent changing seats while locks are held
    }

    setSelectedSeats((prev) => {
      const exists = prev.some((s) => s.id === seat.id);
      if (exists) {
        return prev.filter((s) => s.id !== seat.id);
      }
      if (prev.length >= MAX_SEATS_ALLOWED) {
        alert(`You can select a maximum of ${MAX_SEATS_ALLOWED} seats per reservation.`);
        return prev;
      }
      return [...prev, seat];
    });
  };

  const handleHoldExpire = useCallback(async () => {
    const token = holdTokenRef.current;
    const seats = selectedSeatsRef.current;

    alert('Your seat hold has expired. The seats have been released.');
    setIsLocked(false);
    setHoldToken(null);
    setSelectedSeats([]);

    if (token && seats.length > 0) {
      try {
        await bookingApi.releaseSeats(
          showtimeId,
          token,
          seats.map((s) => s.id)
        );
      } catch (err) {
        console.warn('Failed to release expired lock from client:', err);
      }
    }

    fetchSeatLayout();
  }, [showtimeId, fetchSeatLayout]);

  const handleLockSeats = async () => {
    if (selectedSeats.length === 0) return;

    try {
      setLockingLoading(true);
      setError('');
      const seatIds = selectedSeats.map((s) => s.id);
      const response = await bookingApi.lockSeats(showtimeId, seatIds);

      setHoldToken(response.holdToken);
      setExpiresInSeconds(response.expiresInSeconds || 600);
      setIsLocked(true);
    } catch (err) {
      console.error('Lock acquisition failed:', err);
      alert(err.message || 'Selected seats are no longer available. Please choose other seats.');
      setSelectedSeats([]);
      setIsLocked(false);
      setHoldToken(null);
      fetchSeatLayout();
    } finally {
      setLockingLoading(false);
    }
  };

  const handleCancelHold = async () => {
    if (!holdToken || selectedSeats.length === 0) return;

    try {
      setLockingLoading(true);
      const seatIds = selectedSeats.map((s) => s.id);
      await bookingApi.releaseSeats(showtimeId, holdToken, seatIds);
    } catch (err) {
      console.warn('Seat release request error:', err);
    } finally {
      setIsLocked(false);
      setHoldToken(null);
      setSelectedSeats([]);
      setLockingLoading(false);
      fetchSeatLayout();
    }
  };

  const handleCheckout = async () => {
    if (!holdToken || selectedSeats.length === 0) {
      alert('Active seat hold missing. Please re-lock your seats.');
      return;
    }

    try {
      setBookingLoading(true);
      setError('');
      const bookingData = {
        showtimeId: Number(showtimeId),
        holdToken,
        seatIds: selectedSeats.map((s) => s.id),
        paymentMethod,
      };

      const response = await bookingApi.createBooking(bookingData);

      // Successfully booked; prevent unmount release and navigate to success receipt
      setHoldToken(null);
      navigate(`/booking/success/${response.bookingReference}`);
    } catch (err) {
      console.error('Payment checkout failed:', err);
      alert(err.message || 'Payment processing failed. Please try again.');
      setIsLocked(false);
      setHoldToken(null);
      setSelectedSeats([]);
      fetchSeatLayout();
    } finally {
      setBookingLoading(false);
    }
  };

  // Financial calculations
  const subtotal = selectedSeats.reduce((sum, seat) => sum + Number(seat.price || 0), 0);
  const convenienceFee = selectedSeats.length * CONVENIENCE_FEE_PER_SEAT;
  const grandTotal = subtotal + convenienceFee;

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

  if (error && !layout) {
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
          <p style={{ color: '#64748b', margin: '0 0 16px 0', fontSize: '0.9rem' }}>{error}</p>
          <button
            type="button"
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
                type="button"
                onClick={async () => {
                  if (isLocked) {
                    await handleCancelHold();
                  }
                  navigate('/');
                }}
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
                {layout?.movieTitle}
              </h1>
            </div>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>
              {layout?.screenName} | {formatShowtimeDate(layout?.startTime)}
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {isLocked && (
              <HoldTimer
                expiresInSeconds={expiresInSeconds}
                onExpire={handleHoldExpire}
              />
            )}
            <span style={{
              backgroundColor: '#f1f5f9',
              padding: '6px 14px',
              borderRadius: '20px',
              fontSize: '0.85rem',
              fontWeight: '600',
              color: '#334155',
            }}>
              Base Price: ₹{Number(layout?.basePrice || 0).toFixed(0)}
            </span>
          </div>
        </div>
      </div>

      {/* Main Seat Map Area */}
      <main style={{ flex: 1, padding: '36px 16px 160px 16px' }}>
        <SeatGrid
          seats={layout?.seats || []}
          selectedSeatIds={selectedSeats.map((s) => s.id)}
          onSeatToggle={handleSeatToggle}
        />
      </main>

      {/* Fixed Bottom Checkout Drawer */}
      <div style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: '#ffffff',
        borderTop: '1px solid #e2e8f0',
        padding: '16px 36px',
        boxShadow: '0 -4px 14px rgba(0,0,0,0.08)',
        zIndex: 20,
      }}>
        <div style={{
          maxWidth: '1080px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '16px',
        }}>
          {/* Selected Seat Badges */}
          <div style={{ minWidth: '220px' }}>
            <div style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: '#64748b', fontWeight: '700', letterSpacing: '0.5px' }}>
              Selected Seats ({selectedSeats.length}/{MAX_SEATS_ALLOWED})
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

          {/* Ledger Breakdown (when seats are selected) */}
          {selectedSeats.length > 0 && (
            <div style={{
              display: 'flex',
              gap: '20px',
              fontSize: '0.85rem',
              color: '#475569',
              borderLeft: '1px solid #f1f5f9',
              paddingLeft: '20px',
            }}>
              <div>
                <span style={{ display: 'block', color: '#94a3b8', fontSize: '0.75rem' }}>Subtotal</span>
                <strong>₹{subtotal.toFixed(0)}</strong>
              </div>
              <div>
                <span style={{ display: 'block', color: '#94a3b8', fontSize: '0.75rem' }}>Fees (₹25/seat)</span>
                <strong>₹{convenienceFee.toFixed(0)}</strong>
              </div>
              <div>
                <span style={{ display: 'block', color: '#94a3b8', fontSize: '0.75rem' }}>Grand Total</span>
                <strong style={{ color: '#0f172a', fontSize: '1.05rem' }}>₹{grandTotal.toFixed(0)}</strong>
              </div>
            </div>
          )}

          {/* Action & Payment Controls */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            {!isLocked ? (
              <button
                type="button"
                disabled={selectedSeats.length === 0 || lockingLoading}
                onClick={handleLockSeats}
                style={{
                  backgroundColor: selectedSeats.length === 0 || lockingLoading ? '#e2e8f0' : '#eab308',
                  color: selectedSeats.length === 0 || lockingLoading ? '#94a3b8' : '#000000',
                  border: 'none',
                  borderRadius: '6px',
                  padding: '12px 24px',
                  fontSize: '0.92rem',
                  fontWeight: '700',
                  cursor: selectedSeats.length === 0 || lockingLoading ? 'not-allowed' : 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: selectedSeats.length === 0 || lockingLoading ? 'none' : '0 2px 8px rgba(234, 179, 8, 0.4)',
                }}
              >
                {lockingLoading ? 'Locking Seats...' : 'Lock & Proceed'}
              </button>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  style={{
                    padding: '10px 14px',
                    borderRadius: '6px',
                    border: '1.5px solid #cbd5e1',
                    fontSize: '0.88rem',
                    fontWeight: '600',
                    color: '#1e293b',
                    backgroundColor: '#ffffff',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <option value="UPI">UPI</option>
                  <option value="CREDIT_CARD">Credit Card</option>
                  <option value="DEBIT_CARD">Debit Card</option>
                </select>

                <button
                  type="button"
                  disabled={bookingLoading}
                  onClick={handleCheckout}
                  style={{
                    backgroundColor: bookingLoading ? '#94a3b8' : '#22c55e',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '12px 24px',
                    fontSize: '0.92rem',
                    fontWeight: '700',
                    cursor: bookingLoading ? 'not-allowed' : 'pointer',
                    boxShadow: '0 2px 8px rgba(34, 197, 94, 0.3)',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {bookingLoading ? 'Processing...' : `Pay ₹${grandTotal.toFixed(0)}`}
                </button>

                <button
                  type="button"
                  disabled={bookingLoading || lockingLoading}
                  onClick={handleCancelHold}
                  style={{
                    backgroundColor: 'transparent',
                    color: '#ef4444',
                    border: '1px solid #fca5a5',
                    borderRadius: '6px',
                    padding: '11px 16px',
                    fontSize: '0.85rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                  }}
                >
                  Cancel Hold
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Booking;