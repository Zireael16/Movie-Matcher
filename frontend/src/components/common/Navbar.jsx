import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function Navbar() {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // Derive display name from user's email or default to 'User'
  const rawName = user?.name || user?.email?.split('@')[0] || 'User';
  const displayName = rawName.charAt(0).toUpperCase() + rawName.slice(1);

  return (
    <nav
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 36px',
        backgroundColor: '#0f172a',
        color: '#ffffff',
        boxShadow: '0 2px 4px rgba(0,0,0,0.15)',
      }}
    >
      {/* Brand & Links */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '28px' }}>
        <Link
          to="/"
          style={{
            color: '#e50914',
            fontSize: '1.4rem',
            fontWeight: '800',
            textDecoration: 'none',
            letterSpacing: '0.5px',
          }}
        >
          MovieMatcher
        </Link>
        <Link
          to="/"
          style={{
            color: '#cbd5e1',
            textDecoration: 'none',
            fontSize: '0.95rem',
            fontWeight: '500',
          }}
        >
          Movies
        </Link>

        {isAdmin() && (
          <Link
            to="/admin"
            style={{
              backgroundColor: '#e50914',
              color: '#ffffff',
              padding: '4px 10px',
              borderRadius: '4px',
              textDecoration: 'none',
              fontSize: '0.8rem',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
            }}
          >
            Admin Console
          </Link>
        )}
      </div>

      {/* Greeting & Auth Actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '18px' }}>
        {isAuthenticated ? (
          <>
            <span style={{ fontSize: '0.95rem', color: '#f8fafc', fontWeight: '500' }}>
              Hi, <strong style={{ color: '#ffffff' }}>{displayName}</strong>
            </span>
            <button
              onClick={handleLogout}
              style={{
                backgroundColor: 'transparent',
                border: '1px solid #475569',
                color: '#cbd5e1',
                padding: '6px 14px',
                borderRadius: '4px',
                cursor: 'pointer',
                fontSize: '0.85rem',
                transition: 'all 0.2s',
              }}
            >
              Sign Out
            </button>
          </>
        ) : (
          <>
            <Link
              to="/login"
              style={{
                color: '#e2e8f0',
                textDecoration: 'none',
                fontSize: '0.9rem',
                marginRight: '6px',
              }}
            >
              Sign In
            </Link>
            <Link
              to="/register"
              style={{
                backgroundColor: '#e50914',
                color: '#ffffff',
                padding: '6px 14px',
                borderRadius: '4px',
                textDecoration: 'none',
                fontSize: '0.9rem',
                fontWeight: '500',
              }}
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
}