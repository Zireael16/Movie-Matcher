import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/axios';

/**
 * UserProfile component presenting user credentials and ticket cards
 * modeled after the cinema booking receipt card format.
 */
const UserProfile = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMyBookings = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await api.get('/bookings/my-bookings');
        setBookings(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
        console.error('Failed to load user booking history:', err);
        setError(
          err.response?.data?.message ||
          err.message ||
          'Failed to retrieve booking history. Please try again.'
        );
      } finally {
        setLoading(false);
      }
    };

    fetchMyBookings();
  }, []);

  // Split bookings into Upcoming and Past categories
  const now = new Date();

  const upcomingBookings = bookings.filter((b) => {
    const startTime = b.startTime ? new Date(b.startTime) : null;
    return b.status === 'CONFIRMED' && startTime && startTime > now;
  });

  const pastBookings = bookings.filter((b) => {
    const startTime = b.startTime ? new Date(b.startTime) : null;
    return b.status !== 'CONFIRMED' || !startTime || startTime <= now;
  });

  const formatShowtimeDateTime = (isoString) => {
    if (!isoString) return 'Date Unavailable';
    const date = new Date(isoString);
    const datePart = date.toLocaleDateString('en-GB', {
      weekday: 'short',
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    const timePart = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    return `${datePart} | ${timePart}`;
  };

  const formatCreatedAt = (isoString) => {
    if (!isoString) return '—';
    const date = new Date(isoString);
    const datePart = date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
    const timePart = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
    return `${datePart} ${timePart}`;
  };

  const handleCancelClick = (bookingReference) => {
    alert(`Cancellation requested for booking reference: ${bookingReference}`);
  };

  // Derive display name from user's name or email
  const rawName = user?.name || user?.email?.split('@')[0] || 'User';
  const displayName = rawName.charAt(0).toUpperCase() + rawName.slice(1);
  const avatarLetter = displayName.charAt(0).toUpperCase();

  const renderBookingCard = (item, isUpcoming) => {
    const seats = item.seatIdentifiers || item.seats || [];
    const seatCount = seats.length;
    const totalAmount = Number(item.totalAmount || 0);

    // Compute fee itemization (₹25 per seat fee)
    const convenienceFee = seatCount * 25;
    const baseTicketPrice = Math.max(0, totalAmount - convenienceFee);

    // Format reference ID for display
    const bookingRef = String(item.bookingReference || '');
    const shortRef = bookingRef.length > 8 ? bookingRef.substring(0, 8).toUpperCase() : bookingRef.toUpperCase();

    const hasPoster = item.moviePosterUrl && item.moviePosterUrl !== 'N/A';

    return (
      <div
        key={item.bookingReference}
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '16px',
          border: '1px solid #e2e8f0',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)',
          marginBottom: '28px',
          overflow: 'hidden',
        }}
      >
        {/* Main Ticket Upper Section */}
        <div style={{ display: 'flex', flexDirection: 'row', minHeight: '260px' }}>

          {/* Left Poster Thumbnail Container */}
          <div
            style={{
              width: '180px',
              minWidth: '180px',
              backgroundColor: '#0f172a',
              position: 'relative',
              overflow: 'hidden',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            {hasPoster ? (
              <img
                src={item.moviePosterUrl}
                alt={item.movieTitle || 'Movie Poster'}
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
                style={{
                  width: '100%',
                  height: '100%',
                  objectFit: 'cover',
                  objectPosition: 'center',
                  display: 'block',
                }}
              />
            ) : (
              <div
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  textAlign: 'center',
                  padding: '16px',
                  boxSizing: 'border-box',
                  background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                  color: '#ffffff',
                }}
              >
                <svg
                  style={{ width: '40px', height: '40px', color: '#94a3b8', marginBottom: '10px' }}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z"
                  />
                </svg>
                <span
                  style={{
                    fontSize: '0.82rem',
                    fontWeight: '700',
                    color: '#e2e8f0',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    lineHeight: '1.2',
                  }}
                >
                  {item.movieTitle || 'Movie'}
                </span>
              </div>
            )}
          </div>

          {/* Ticket Perforation Divider */}
          <div
            style={{
              position: 'relative',
              width: '1px',
              backgroundColor: 'transparent',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            {/* Top semi-circle cutout */}
            <div
              style={{
                width: '20px',
                height: '12px',
                backgroundColor: '#f8fafc',
                borderBottomLeftRadius: '12px',
                borderBottomRightRadius: '12px',
                border: '1px solid #e2e8f0',
                borderTop: 'none',
                position: 'absolute',
                top: '-1px',
                left: '-10px',
                zIndex: 2,
              }}
            />
            {/* Dotted center divider */}
            <div
              style={{
                width: '1px',
                height: '100%',
                borderLeft: '2px dashed #cbd5e1',
              }}
            />
            {/* Bottom semi-circle cutout */}
            <div
              style={{
                width: '20px',
                height: '12px',
                backgroundColor: '#f8fafc',
                borderTopLeftRadius: '12px',
                borderTopRightRadius: '12px',
                border: '1px solid #e2e8f0',
                borderBottom: 'none',
                position: 'absolute',
                bottom: '-1px',
                left: '-10px',
                zIndex: 2,
              }}
            />
          </div>

          {/* Right Ticket Info Body */}
          <div style={{ flex: 1, padding: '24px 28px', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>

            {/* Title & Badge Row */}
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1.35rem', fontWeight: '800', color: '#0f172a' }}>
                    {item.movieTitle}
                  </h3>
                  <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>
                    2D
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      fontSize: '0.85rem',
                      fontWeight: '700',
                      color: '#475569',
                      backgroundColor: '#f1f5f9',
                      padding: '4px 10px',
                      borderRadius: '6px',
                    }}
                  >
                    M-Ticket
                  </span>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: '700',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      textTransform: 'uppercase',
                      backgroundColor: item.status === 'CONFIRMED' ? '#dcfce7' : '#fee2e2',
                      color: item.status === 'CONFIRMED' ? '#15803d' : '#b91c1c',
                      border: `1px solid ${item.status === 'CONFIRMED' ? '#86efac' : '#fca5a5'}`,
                    }}
                  >
                    {item.status || 'CONFIRMED'}
                  </span>
                </div>
              </div>

              {/* Showtime & Venue */}
              <div style={{ marginTop: '12px' }}>
                <div style={{ fontSize: '0.98rem', fontWeight: '700', color: '#1e293b' }}>
                  {formatShowtimeDateTime(item.startTime)}
                </div>
                <div style={{ fontSize: '0.84rem', color: '#64748b', marginTop: '2px' }}>
                  {item.screenName || 'Screen 1'} • Cinema Hub
                </div>
              </div>

              {/* Quantity & Seats */}
              <div style={{ marginTop: '14px' }}>
                <div style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '600' }}>
                  Quantity: {seatCount}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '6px', flexWrap: 'wrap' }}>
                  <svg style={{ width: '18px', height: '18px', color: '#64748b' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
                  </svg>
                  <strong style={{ fontSize: '0.92rem', color: '#1e293b' }}>
                    SEATS:
                  </strong>
                  <span style={{ fontSize: '0.92rem', fontWeight: '700', color: '#0f172a' }}>
                    {seats.join(', ') || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Price Ledger */}
            <div style={{ marginTop: '16px', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', color: '#64748b', marginBottom: '4px' }}>
                <span>Ticket price</span>
                <span>₹{baseTicketPrice.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.84rem', color: '#64748b', marginBottom: '6px' }}>
                <span>Convenience fees</span>
                <span>₹{convenienceFee.toFixed(2)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', paddingTop: '8px', borderTop: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '1rem', fontWeight: '700', color: '#0f172a' }}>Amount Paid</span>
                <span style={{ fontSize: '1.4rem', fontWeight: '800', color: '#0f172a' }}>
                  ₹{totalAmount.toFixed(2)}
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Bottom Metadata & Actions Strip */}
        <div
          style={{
            backgroundColor: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            padding: '12px 28px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', gap: '32px', flexWrap: 'wrap' }}>
            <div>
              <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                BOOKING DATE & TIME
              </span>
              <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#1e293b' }}>
                {formatCreatedAt(item.createdAt)}
              </span>
            </div>

            <div>
              <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                PAYMENT METHOD
              </span>
              <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#1e293b' }}>
                UPI
              </span>
            </div>

            <div>
              <span style={{ display: 'block', fontSize: '0.7rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                BOOKING ID
              </span>
              <span style={{ fontSize: '0.85rem', fontWeight: '700', color: '#0f172a', fontFamily: 'monospace' }}>
                {shortRef}
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              type="button"
              onClick={() => navigate(`/booking/success/${item.bookingReference}`)}
              style={{
                backgroundColor: '#ffffff',
                color: '#0f172a',
                border: '1px solid #cbd5e1',
                borderRadius: '6px',
                padding: '7px 14px',
                fontSize: '0.82rem',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              View Ticket →
            </button>

            {isUpcoming && (
              <button
                type="button"
                onClick={() => handleCancelClick(item.bookingReference)}
                style={{
                  backgroundColor: '#ffffff',
                  color: '#dc2626',
                  border: '1px solid #fca5a5',
                  borderRadius: '6px',
                  padding: '7px 14px',
                  fontSize: '0.82rem',
                  fontWeight: '700',
                  cursor: 'pointer',
                  transition: 'all 0.15s',
                }}
              >
                Cancel Ticket
              </button>
            )}
          </div>
        </div>

      </div>
    );
  };

  return (
    <div
      style={{
        minHeight: 'calc(100vh - 70px)',
        backgroundColor: '#f8fafc',
        padding: '36px 16px 80px 16px',
      }}
    >
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>

        {/* User Details Header Card (Centered) */}
        <section
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '28px 36px',
            marginBottom: '36px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                backgroundColor: '#0f172a',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.6rem',
                fontWeight: '800',
                boxShadow: '0 4px 10px rgba(15, 23, 42, 0.25)',
              }}
            >
              {avatarLetter}
            </div>
            <div>
              <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800', color: '#0f172a' }}>
                {displayName}
              </h1>
              <p style={{ margin: '4px 0 0 0', fontSize: '0.92rem', color: '#64748b', fontWeight: '500' }}>
                {user?.email || 'user@example.com'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate('/')}
            style={{
              backgroundColor: '#0f172a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '8px',
              padding: '10px 20px',
              fontSize: '0.88rem',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'background-color 0.2s',
            }}
          >
            Browse Movies
          </button>
        </section>

        {/* Error Alert */}
        {error && (
          <div
            style={{
              backgroundColor: '#fee2e2',
              color: '#b91c1c',
              border: '1px solid #fecaca',
              padding: '12px 18px',
              borderRadius: '8px',
              fontSize: '0.88rem',
              marginBottom: '24px',
            }}
          >
            {error}
          </div>
        )}

        {/* Loading State */}
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: '#64748b' }}>
            <p style={{ fontSize: '1.05rem' }}>Loading your booking history...</p>
          </div>
        ) : (
          <div>

            {/* Upcoming Bookings Section */}
            <section style={{ marginBottom: '44px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '800', color: '#0f172a' }}>
                    Upcoming Bookings
                  </h2>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                    Confirmed tickets for future screenings
                  </p>
                </div>
                <span
                  style={{
                    backgroundColor: '#dcfce7',
                    color: '#15803d',
                    fontSize: '0.78rem',
                    fontWeight: '700',
                    padding: '4px 12px',
                    borderRadius: '20px',
                  }}
                >
                  {upcomingBookings.length} Active
                </span>
              </div>

              {upcomingBookings.length === 0 ? (
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px dashed #cbd5e1',
                    padding: '36px',
                    textAlign: 'center',
                    color: '#64748b',
                    fontSize: '0.9rem',
                  }}
                >
                  You have no upcoming movie reservations.
                </div>
              ) : (
                upcomingBookings.map((b) => renderBookingCard(b, true))
              )}
            </section>

            {/* Past & Cancelled Bookings Section */}
            <section>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '800', color: '#0f172a' }}>
                    Past & Cancelled Bookings
                  </h2>
                  <p style={{ margin: '4px 0 0 0', fontSize: '0.82rem', color: '#64748b' }}>
                    Previous screenings and expired reservations
                  </p>
                </div>
                <span
                  style={{
                    backgroundColor: '#f1f5f9',
                    color: '#475569',
                    fontSize: '0.78rem',
                    fontWeight: '700',
                    padding: '4px 12px',
                    borderRadius: '20px',
                  }}
                >
                  {pastBookings.length} Records
                </span>
              </div>

              {pastBookings.length === 0 ? (
                <div
                  style={{
                    backgroundColor: '#ffffff',
                    borderRadius: '12px',
                    border: '1px dashed #cbd5e1',
                    padding: '36px',
                    textAlign: 'center',
                    color: '#64748b',
                    fontSize: '0.9rem',
                  }}
                >
                  No past reservations found.
                </div>
              ) : (
                pastBookings.map((b) => renderBookingCard(b, false))
              )}
            </section>

          </div>
        )}

      </div>
    </div>
  );
};

export default UserProfile;