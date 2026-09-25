import React, { useState, useEffect, useRef } from 'react';

/**
 * HoldTimer component synchronized with Redis distributed lock TTL (default 600s / 10m).
 * Transitions from standard amber to urgent red warning when under 2 minutes (120s).
 *
 * @param {number} expiresInSeconds - Initial duration in seconds (default: 600).
 * @param {function} onExpire - Callback invoked when the countdown reaches 00:00.
 */
const HoldTimer = ({ expiresInSeconds = 600, onExpire }) => {
  const [timeLeft, setTimeLeft] = useState(expiresInSeconds);
  const onExpireRef = useRef(onExpire);

  // Keep ref updated to handle callback changes without resetting timer
  useEffect(() => {
    onExpireRef.current = onExpire;
  }, [onExpire]);

  useEffect(() => {
    setTimeLeft(expiresInSeconds);
  }, [expiresInSeconds]);

  useEffect(() => {
    if (timeLeft <= 0) {
      if (onExpireRef.current) {
        onExpireRef.current();
      }
      return;
    }

    const timerId = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerId);
          if (onExpireRef.current) {
            onExpireRef.current();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [timeLeft]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;

  const isUrgent = timeLeft <= 120;

  const containerStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    padding: '8px 16px',
    borderRadius: '8px',
    fontWeight: '600',
    fontSize: '0.95rem',
    transition: 'background-color 0.3s ease, color 0.3s ease, border-color 0.3s ease',
    backgroundColor: isUrgent ? '#fee2e2' : '#fef3c7',
    color: isUrgent ? '#b91c1c' : '#b45309',
    border: `1px solid ${isUrgent ? '#fca5a5' : '#fcd34d'}`,
  };

  const iconStyle = {
    width: '18px',
    height: '18px',
  };

  return (
    <div style={containerStyle} role="timer" aria-live="polite">
      <svg
        style={iconStyle}
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
      <span>
        {isUrgent ? 'Hurry! Seats hold expires in: ' : 'Seats held for: '}
        <strong>{formattedTime}</strong>
      </span>
    </div>
  );
};

export default HoldTimer;