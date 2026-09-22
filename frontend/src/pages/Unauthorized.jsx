import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Access Denied view displayed when an authenticated user
 * lacks required privileges for an administrative route.
 */
export default function Unauthorized() {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '65vh',
        padding: '20px',
        textAlign: 'center',
        fontFamily: 'sans-serif',
      }}
    >
      <h1
        style={{
          fontSize: '4rem',
          margin: 0,
          color: '#e50914',
          fontWeight: '800',
        }}
      >
        403
      </h1>
      <h2
        style={{
          fontSize: '1.75rem',
          margin: '12px 0',
          color: '#0f172a',
        }}
      >
        Access Denied
      </h2>
      <p
        style={{
          maxWidth: '460px',
          color: '#64748b',
          fontSize: '1rem',
          lineHeight: '1.5',
          marginBottom: '24px',
        }}
      >
        You are authenticated, but you do not possess administrator rights to
        access this management portal.
      </p>
      <Link
        to="/"
        style={{
          display: 'inline-block',
          backgroundColor: '#0f172a',
          color: '#ffffff',
          padding: '10px 20px',
          borderRadius: '4px',
          textDecoration: 'none',
          fontSize: '0.9rem',
          fontWeight: '500',
        }}
      >
        Back to Public Catalog
      </Link>
    </div>
  );
}