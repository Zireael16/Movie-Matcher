import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * User registration page allowing new customers to create an account.
 */
export default function Register() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    // Client-side guard for matching passwords
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    const result = await register(email, password);
    setIsSubmitting(false);

    if (result.success) {
      navigate('/', { replace: true });
    } else {
      setErrorMessage(result.message);
    }
  };

  return (
    <div
      style={{
        maxWidth: '420px',
        margin: '60px auto',
        padding: '32px',
        borderRadius: '8px',
        border: '1px solid #e2e8f0',
        backgroundColor: '#ffffff',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)',
        fontFamily: 'sans-serif',
      }}
    >
      <h2
        style={{
          margin: '0 0 8px 0',
          fontSize: '1.6rem',
          color: '#0f172a',
          fontWeight: '700',
        }}
      >
        Create an Account
      </h2>
      <p style={{ margin: '0 0 24px 0', color: '#64748b', fontSize: '0.9rem' }}>
        Register to start booking seats for upcoming screenings
      </p>

      {/* Error Alert */}
      {errorMessage && (
        <div
          style={{
            backgroundColor: '#fee2e2',
            color: '#b91c1c',
            border: '1px solid #fecaca',
            borderRadius: '4px',
            padding: '10px 14px',
            fontSize: '0.85rem',
            marginBottom: '16px',
          }}
        >
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: '16px' }}>
          <label
            htmlFor="email"
            style={{
              display: 'block',
              fontSize: '0.88rem',
              fontWeight: '600',
              color: '#334155',
              marginBottom: '6px',
            }}
          >
            Email Address
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: '10px 12px',
              borderRadius: '4px',
              border: '1px solid #cbd5e1',
              fontSize: '0.95rem',
              outline: 'none',
            }}
          />
        </div>

        <div style={{ marginBottom: '16px' }}>
          <label
            htmlFor="password"
            style={{
              display: 'block',
              fontSize: '0.88rem',
              fontWeight: '600',
              color: '#334155',
              marginBottom: '6px',
            }}
          >
            Password
          </label>
          <input
            id="password"
            type="password"
            required
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: '10px 12px',
              borderRadius: '4px',
              border: '1px solid #cbd5e1',
              fontSize: '0.95rem',
              outline: 'none',
            }}
          />
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label
            htmlFor="confirmPassword"
            style={{
              display: 'block',
              fontSize: '0.88rem',
              fontWeight: '600',
              color: '#334155',
              marginBottom: '6px',
            }}
          >
            Confirm Password
          </label>
          <input
            id="confirmPassword"
            type="password"
            required
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••"
            style={{
              width: '100%',
              boxSizing: 'border-box',
              padding: '10px 12px',
              borderRadius: '4px',
              border: '1px solid #cbd5e1',
              fontSize: '0.95rem',
              outline: 'none',
            }}
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          style={{
            width: '100%',
            backgroundColor: isSubmitting ? '#94a3b8' : '#e50914',
            color: '#ffffff',
            border: 'none',
            padding: '11px',
            borderRadius: '4px',
            fontSize: '0.95rem',
            fontWeight: '600',
            cursor: isSubmitting ? 'not-allowed' : 'pointer',
            transition: 'background-color 0.2s',
          }}
        >
          {isSubmitting ? 'Creating account...' : 'Create Account'}
        </button>
      </form>

      <div
        style={{
          marginTop: '24px',
          textAlign: 'center',
          fontSize: '0.88rem',
          color: '#64748b',
        }}
      >
        Already have an account?{' '}
        <Link
          to="/login"
          style={{
            color: '#0284c7',
            textDecoration: 'none',
            fontWeight: '600',
          }}
        >
          Sign In
        </Link>
      </div>
    </div>
  );
}