import axios from "axios";

const API = axios.create({ baseURL: process.env.NEXT_PUBLIC_API_URL });

API.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("cb_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const TMDB_IMG = (path, size = "w500") =>
  path ? `${process.env.NEXT_PUBLIC_TMDB_IMAGE}/${size}${path}` : "/placeholder.jpg";

export const TMDB_BACKDROP = (path) => TMDB_IMG(path, "original");

// Auth
export const authAPI = {
  login: (data) => API.post("/auth/login", data),
  register: (data) => API.post("/auth/register", data),
  me: () => API.get("/auth/me"),
};

// Movies
export const moviesAPI = {
  nowPlaying: () => API.get("/movies/now-playing"),
  popular: (page = 1) => API.get(`/movies/popular?page=${page}`),
  upcoming: () => API.get("/movies/upcoming"),
  topRated: () => API.get("/movies/top-rated"),
  genres: () => API.get("/movies/genres"),
  search: (q) => API.get(`/movies/search?q=${q}`),
  details: (tmdbId) => API.get(`/movies/${tmdbId}/details`),
  showtimes: (tmdbId, date) => API.get(`/movies/${tmdbId}/showtimes${date ? `?date=${date}` : ""}`),
};

// Bookings
export const bookingsAPI = {
  seats: (showtimeId) => API.get(`/bookings/seats/${showtimeId}`),
  create: (data) => API.post("/bookings", data),
  myBookings: () => API.get("/bookings/my"),
  cancel: (id) => API.patch(`/bookings/${id}/cancel`),
};

export default API;
