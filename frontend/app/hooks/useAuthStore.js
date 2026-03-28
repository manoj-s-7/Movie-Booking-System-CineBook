import { create } from "zustand";
import { authAPI } from "../lib/api";

const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  isHydrated: false,

  init: () => {
    if (typeof window === "undefined") return;
    if (get().isHydrated) return;
    const token = localStorage.getItem("cb_token");
    const user = localStorage.getItem("cb_user");
    if (token && user) {
      set({ token, user: JSON.parse(user), isHydrated: true });
      return;
    }
    set({ isHydrated: true });
  },

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const { data } = await authAPI.login({ email, password });
      localStorage.setItem("cb_token", data.token);
      localStorage.setItem("cb_user", JSON.stringify(data.user));
      set({ token: data.token, user: data.user, isLoading: false });
      return { success: true };
    } catch (err) {
      set({ isLoading: false });
      return { success: false, error: err.response?.data?.error || "Login failed" };
    }
  },

  register: async (name, email, password) => {
    set({ isLoading: true });
    try {
      const { data } = await authAPI.register({ name, email, password });
      localStorage.setItem("cb_token", data.token);
      localStorage.setItem("cb_user", JSON.stringify(data.user));
      set({ token: data.token, user: data.user, isLoading: false });
      return { success: true };
    } catch (err) {
      set({ isLoading: false });
      return { success: false, error: err.response?.data?.error || "Registration failed" };
    }
  },

  logout: () => {
    localStorage.removeItem("cb_token");
    localStorage.removeItem("cb_user");
    set({ user: null, token: null, isHydrated: true });
  },

  isAuthenticated: () => !!get().token,
}));

export default useAuthStore;
