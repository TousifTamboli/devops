import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api",
  withCredentials: true,
});

// Response interceptor to handle token refresh
api.interceptors.response.use(
  (response) => {
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // If 401 Unauthorized and not already retrying (to prevent infinite loops)
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Silently hit refresh route
        await api.post("/auth/refresh");
        // Retry original request (cookies are automatically sent now)
        return api(originalRequest);
      } catch (refreshError) {
        // Refresh token died/expired, force logout or redirect to login
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);
