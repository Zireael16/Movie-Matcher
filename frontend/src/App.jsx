import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

// Layout & Security Components
import Navbar from './components/common/Navbar';
import ProtectedRoute from './components/auth/ProtectedRoute';

// Page Views
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Unauthorized from './pages/Unauthorized';
import AdminDashboard from './pages/AdminDashboard';
import Booking from './pages/Booking';
import BookingSuccess from './pages/BookingSuccess';

/**
 * Root Application Router.
 * Configures application-wide routing rules, public access points,
 * role-restricted boundaries, and the interactive booking flow.
 */
export default function App() {
  return (
    <BrowserRouter>
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          backgroundColor: '#f8fafc',
        }}
      >
        {/* Global Persistent Header */}
        <Navbar />

        {/* Dynamic Route Container */}
        <main style={{ flex: 1 }}>
          <Routes>
            {/* Public Access Endpoints */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />

            {/* Interactive Booking Flow Endpoints */}
            <Route path="/booking/:showtimeId" element={<Booking />} />
            <Route path="/showtimes/:showtimeId/booking" element={<Booking />} />
            <Route path="/booking/success/:bookingReference" element={<BookingSuccess />} />

            {/* Role-Gated Administrative Portal */}
            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRole="ADMIN">
                  <AdminDashboard />
                </ProtectedRoute>
              }
            />

            {/* Error Handlers & Fallbacks */}
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}