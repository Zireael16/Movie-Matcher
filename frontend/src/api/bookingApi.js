import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach JWT Bearer token if present
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Normalize error envelopes & handle unauthenticated sessions
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      if (status === 401) {
        localStorage.removeItem('token');
        if (!window.location.pathname.includes('/login')) {
          window.location.href = '/login';
        }
      }

      const message =
        (typeof data === 'object' && (data?.message || data?.error)) ||
        `Request failed with status code ${status}`;

      return Promise.reject(new Error(message));
    } else if (error.request) {
      return Promise.reject(new Error('Network error: No response received from server.'));
    }
    return Promise.reject(error);
  }
);

export const bookingApi = {
  /**
   * Fetches synthesized seat matrix (AVAILABLE, LOCKED, RESERVED) for a showtime.
   */
  getShowtimeSeats: async (showtimeId) => {
    const response = await apiClient.get(`/showtimes/${showtimeId}/seats`);
    return response.data;
  },

  /**
   * Requests temporary Redis distributed holds on selected seats.
   * Expected payload response: { holdToken, expiresAt, expiresInSeconds, lockedSeats }
   */
  lockSeats: async (showtimeId, seatIds) => {
    const response = await apiClient.post(`/bookings/locks/${showtimeId}`, {
      seatIds,
    });
    return response.data;
  },

  /**
   * Releases Redis distributed holds manually if the user cancels or deselects.
   */
  releaseSeats: async (showtimeId, holdToken, seatIds) => {
    const response = await apiClient.delete(`/bookings/locks/${showtimeId}`, {
      data: {
        holdToken,
        seatIds,
      },
    });
    return response.data;
  },

  /**
   * Confirms reservation and triggers transactional payment.
   * Expected input: { showtimeId, holdToken, seatIds, paymentMethod }
   */
  createBooking: async ({ showtimeId, holdToken, seatIds, paymentMethod }) => {
    const response = await apiClient.post('/bookings', {
      showtimeId,
      holdToken,
      seatIds,
      paymentMethod,
    });
    return response.data;
  },

  /**
   * Fetches confirmed booking details by UUID reference.
   */
  getBookingByReference: async (bookingReference) => {
    const response = await apiClient.get(`/bookings/${bookingReference}`);
    return response.data;
  },

  /**
   * Fetches booking history for the authenticated user.
   */
  getMyBookings: async () => {
    const response = await apiClient.get('/bookings/my-bookings');
    return response.data;
  },
};

export default bookingApi;