import { create } from "zustand";
import { persist } from "zustand/middleware";
import { request } from "../api/request";

// Logged-in user and token, saved in localStorage so a refresh keeps you logged in
export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,

      login: async (credentials) => {
        try {
          const { data, message } = await request("/auth/login", {
            method: "POST",
            body: JSON.stringify(credentials),
          });
          set({ user: data.user, token: data.token });
          return { success: true, message };
        } catch (err) {
          return { success: false, message: err.message };
        }
      },

      register: async (details) => {
        try {
          const { data, message } = await request("/auth/register", {
            method: "POST",
            body: JSON.stringify(details),
          });
          set({ user: data.user, token: data.token });
          return { success: true, message };
        } catch (err) {
          return { success: false, message: err.message };
        }
      },

      // Re-check the saved token with the server (e.g. on page load)
      refreshUser: async () => {
        try {
          const { data } = await request("/auth/me");
          // Only replace the saved user with a real one
          if (data?._id) set({ user: data });
        } catch {
          // request() already logs out when the token is rejected
        }
      },

      logout: () => set({ user: null, token: null }),
    }),
    { name: "bookstore-auth" }
  )
);

export const useIsAdmin = () => useAuthStore((state) => state.user?.role === "admin");
