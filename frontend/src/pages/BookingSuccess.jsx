import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import bookingApi from '../api/bookingApi';

/**
 * BookingSuccess Component - Digital Ticket Confirmation View
 * Retrieves booking details by UUID bookingReference and renders a
 * cinema ticket receipt with movie details, screen info, seat badges,
 * payment status, and a simulated QR code placeholder.
 */
const BookingSuccess = () => {
  const { bookingReference } = useParams();
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchBookingDetails = async () => {
      try {
        setLoading(true);
        setError('');
        const data = await bookingApi.getBookingByReference(bookingReference);
        setBooking(data);
      } catch (err) {
        console.error('Failed to load booking details:', err);
        setError(err.message || 'Unable to retrieve reservation details.');
      } finally {
        setLoading(false);
      }
    };

    if (bookingReference) {
      fetchBookingDetails();
    }
  }, [bookingReference]);

  const formatTimestamp = (isoString) => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return date.toLocaleDateString('en-IN', {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', color: '#64748b' }}>
        <p style={{ fontSize: '1.1rem' }}>Retrieving your ticket details...</p>
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh', padding: '16px' }}>
        <div style={{
          backgroundColor: '#ffffff',
          border: '1px solid #fee2e2',
          padding: '32px',
          borderRadius: '12px',
          textAlign: 'center',
          maxWidth: '420px',
          boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
        }}>
          <h2 style={{ color: '#ef4444', margin: '0 0 10px 0', fontSize: '1.25rem' }}>Ticket Retrieval Failed</h2>
          <p style={{ color: '#64748b', margin: '0 0 20px 0', fontSize: '0.9rem' }}>{error || 'Reservation could not be located.'}</p>
          <button
            type="button"
            onClick={() => navigate('/')}
            style={{
              backgroundColor: '#0f172a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              padding: '10px 20px',
              fontSize: '0.88rem',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Return to Movies
          </button>
        </div>
      </div>
    );
  }

  const confirmedSeats = booking.confirmedSeats || booking.seats || [];

  return (
    <div style={{
      minHeight: 'calc(100vh - 70px)',
      backgroundColor: '#f8fafc',
      padding: '40px 16px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
    }}>
      {/* Confirmation Banner */}
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <div style={{
          width: '56px',
          height: '56px',
          backgroundColor: '#dcfce7',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 12px auto',
        }}>
          <svg
            style={{ width: '28px', height: '28px', color: '#16a34a' }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 style={{ margin: 0, fontSize: '1.6rem', fontWeight: '800', color: '#0f172a' }}>
          Booking Confirmed!
        </h1>
        <p style={{ margin: '6px 0 0 0', color: '#64748b', fontSize: '0.92rem' }}>
          Your digital ticket has been issued and reserved.
        </p>
      </div>

      {/* Ticket Card */}
      <div style={{
        width: '100%',
        maxWidth: '520px',
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
        overflow: 'hidden',
      }}>
        {/* Top Ticket Header */}
        <div style={{
          backgroundColor: '#0f172a',
          color: '#ffffff',
          padding: '24px',
          borderBottom: '1px solid #1e293b',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <span style={{
                backgroundColor: 'rgba(34, 197, 94, 0.2)',
                color: '#4ade80',
                padding: '3px 10px',
                borderRadius: '12px',
                fontSize: '0.75rem',
                fontWeight: '700',
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
                display: 'inline-block',
                marginBottom: '8px',
              }}>
                {booking.status || 'CONFIRMED'}
              </span>
              <h2 style={{ margin: 0, fontSize: '1.35rem', fontWeight: '800' }}>
                {booking.movieTitle || 'Movie Ticket'}
              </h2>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontSize: '0.72rem', color: '#94a3b8', textTransform: 'uppercase' }}>Total Paid</span>
              <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#38bdf8' }}>
                ₹{Number(booking.totalAmount || 0).toFixed(0)}
              </div>
            </div>
          </div>

          <div style={{ marginTop: '16px', fontSize: '0.85rem', color: '#cbd5e1' }}>
            <span>{booking.screenName || 'Main Screen'}</span>
            {booking.showtime && (
              <span> • {formatTimestamp(booking.showtime)}</span>
            )}
          </div>
        </div>

        {/* Ticket Perforation / Divider */}
        <div style={{ position: 'relative', height: '16px', backgroundColor: '#ffffff' }}>
          <div style={{
            position: 'absolute',
            top: '50%',
            left: 0,
            right: 0,
            borderTop: '2px dashed #e2e8f0',
          }} />
          <div style={{
            position: 'absolute',
            left: '-10px',
            top: '0',
            width: '20px',
            height: '16px',
            backgroundColor: '#f8fafc',
            borderRadius: '0 10px 10px 0',
            borderRight: '1px solid #e2e8f0',
          }} />
          <div style={{
            position: 'absolute',
            right: '-10px',
            top: '0',
            width: '20px',
            height: '16px',
            backgroundColor: '#f8fafc',
            borderRadius: '10px 0 0 10px',
            borderLeft: '1px solid #e2e8f0',
          }} />
        </div>

        {/* Ticket Body */}
        <div style={{ padding: '24px' }}>
          {/* Seat Identifiers */}
          <div style={{ marginBottom: '20px' }}>
            <span style={{ fontSize: '0.78rem', textTransform: 'uppercase', color: '#64748b', fontWeight: '700' }}>
              Confirmed Seats ({confirmedSeats.length})
            </span>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
              {confirmedSeats.map((seatId) => (
                <span
                  key={seatId}
                  style={{
                    backgroundColor: '#eab308',
                    color: '#ffffff',
                    fontWeight: '700',
                    fontSize: '0.9rem',
                    padding: '4px 12px',
                    borderRadius: '6px',
                    boxShadow: '0 2px 4px rgba(234, 179, 8, 0.3)',
                  }}
                >
                  {seatId}
                </span>
              ))}
            </div>
          </div>

          {/* Booking Metadata Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '16px',
            backgroundColor: '#f8fafc',
            padding: '16px',
            borderRadius: '8px',
            marginBottom: '20px',
            fontSize: '0.85rem',
          }}>
            <div>
              <span style={{ display: 'block', color: '#64748b', fontSize: '0.75rem', fontWeight: '600' }}>
                Booking Reference
              </span>
              <strong style={{
                color: '#0f172a',
                fontSize: '0.82rem',
                fontFamily: 'monospace',
                wordBreak: 'break-all',
              }}>
                {booking.bookingReference}
              </strong>
            </div>

            <div>
              <span style={{ display: 'block', color: '#64748b', fontSize: '0.75rem', fontWeight: '600' }}>
                Booking Timestamp
              </span>
              <span style={{ color: '#0f172a', fontWeight: '600' }}>
                {formatTimestamp(booking.bookingTime || booking.createdAt)}
              </span>
            </div>
          </div>

          {/* Simulated QR Code Stamp */}
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '16px',
            border: '1px solid #f1f5f9',
            borderRadius: '8px',
            backgroundColor: '#ffffff',
          }}>
            <svg
              style={{ width: '84px', height: '84px', color: '#1e293b' }}
              fill="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M2 2h8v8H2V2zm2 2v4h4V4H4zm10-2h8v8h-8V2zm2 2v4h4V4h-4zM2 14h8v8H2v-8zm2 2v4h4v-4H4zm14 3h2v3h-2v-3zm-4-3h2v2h-2v-2zm2 2h2v2h-2v-2zm2-2h2v2h-2v-2zm-6 4h4v2h-4v-2zm4 2h4v2h-4v-2zm-2-8h2v2h-2v-2z" />
            </svg>
            <span style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '6px', letterSpacing: '0.5px' }}>
              Scan at cinema turnstile
            </span>
          </div>
        </div>

        {/* Ticket Footer Action */}
        <div style={{
          padding: '16px 24px',
          backgroundColor: '#f8fafc',
          borderTop: '1px solid #e2e8f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
          <button
            type="button"
            onClick={() => navigate('/')}
            style={{
              background: 'none',
              border: 'none',
              color: '#475569',
              fontSize: '0.88rem',
              fontWeight: '600',
              cursor: 'pointer',
              padding: 0,
            }}
          >
            ← Back to Movies
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            style={{
              backgroundColor: '#0f172a',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              padding: '8px 16px',
              fontSize: '0.85rem',
              fontWeight: '600',
              cursor: 'pointer',
            }}
          >
            Print Ticket
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingSuccess;