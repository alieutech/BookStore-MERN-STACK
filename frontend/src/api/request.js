import { useAuthStore } from "../store/auth";

// API base URL. Empty by default so requests go through the Vite dev proxy
// (see vite.config.ts); set VITE_API_URL to call the API directly.
const API_BASE_URL = import.meta.env.VITE_API_URL || "";

// Send a request (with the login token, if any) and return the parsed JSON body,
// or throw with the server's message
export const request = async (path, options = {}) => {
  const { token, logout } = useAuthStore.getState();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      // Let the browser set the multipart boundary for file uploads
      ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const data = await res.json().catch(() => ({}));
  // An expired or invalid token means the user has to log in again
  if (res.status === 401 && token) logout();
  if (!res.ok || data.success === false) {
    throw new Error(data.message || `Request failed with status ${res.status}`);
  }
  return data;
};
