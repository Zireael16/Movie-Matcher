import axios from 'axios';

/**
 * Base Axios instance configured for the Movie Matcher REST API.
 * All subsequent requests made using this instance will target the backend API root.
 */
const api = axios.create({
  // Backend API base URL targeting Spring Boot's API gateway / server
  baseURL: 'http://localhost:8080/api/v1',
  headers: {
    'Content-Type': 'application/json',
  },
});

/**
 * Request Interceptor:
 * Intercepts every outgoing request before it leaves the browser.
 * Checks if a JWT exists in localStorage; if found, attaches it as a Bearer token.
 */
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      // Attach the JWT to the Authorization header
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Handle request configuration errors before the request is sent
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor:
 * Intercepts incoming responses from the backend.
 * Automatically handles expired tokens or unauthorized access (HTTP 401).
 */
api.interceptors.response.use(
  (response) => {
    // Return the response data directly if the request was successful (HTTP 2xx)
    return response;
  },
  (error) => {
    // Check if the error response indicates an unauthorized access (token expired / invalid)
    if (error.response && error.response.status === 401) {
      // Clear stale authentication credentials from browser storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      // If needed, dispatch an event or redirect to login (avoiding reload loops)
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;