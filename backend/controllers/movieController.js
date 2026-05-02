const axios = require("axios");
const path = require("path");
const pool = require("../config/db");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const TMDB_KEY = "08c77bb9352c76a7199b25a4ce8a45f5";
const TMDB_BASE = "https://api.themoviedb.org/3";

const tmdb = (endpoint, params = {}) =>
  axios.get(`${TMDB_BASE}${endpoint}`, {
    params: { api_key: TMDB_KEY, language: "en-US", ...params },
  });

// Fetch & cache now playing movies from TMDB
const getNowPlaying = async (req, res) => {
  try {
    const { data } = await tmdb("/movie/now_playing", { page: 1 });
    res.json(data);
  } catch (err) {
    console.error("TMDB now_playing error:", err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data?.status_message || err.message, tmdb_key_set: !!TMDB_KEY });
  }
};

const getPopular = async (req, res) => {
  try {
    const { data } = await tmdb("/movie/popular", { page: req.query.page || 1 });
    res.json(data);
  } catch (err) {
    console.error("TMDB popular error:", err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data?.status_message || err.message });
  }
};

const getUpcoming = async (req, res) => {
  try {
    const { data } = await tmdb("/movie/upcoming", { page: 1 });
    res.json(data);
  } catch (err) {
    console.error("TMDB upcoming error:", err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data?.status_message || err.message });
  }
};

const getTopRated = async (req, res) => {
  try {
    const { data } = await tmdb("/movie/top_rated", { page: 1 });
    res.json(data);
  } catch (err) {
    console.error("TMDB top_rated error:", err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data?.status_message || err.message });
  }
};

const getMovieDetails = async (req, res) => {
  const { tmdbId } = req.params;
  try {
    const [detail, credits, videos, similar] = await Promise.all([
      tmdb(`/movie/${tmdbId}`),
      tmdb(`/movie/${tmdbId}/credits`),
      tmdb(`/movie/${tmdbId}/videos`),
      tmdb(`/movie/${tmdbId}/similar`, { page: 1 }),
    ]);
    res.json({
      movie: detail.data,
      cast: credits.data.cast.slice(0, 10),
      videos: videos.data.results.filter((v) => v.type === "Trailer"),
      similar: similar.data.results.slice(0, 8),
    });
  } catch (err) {
    console.error("TMDB details error:", err.response?.data || err.message);
    res.status(500).json({ error: err.response?.data?.status_message || err.message });
  }
};

const searchMovies = async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ error: "Query required" });
  try {
    const { data } = await tmdb("/search/movie", { query: q });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.response?.data?.status_message || err.message });
  }
};

const getGenres = async (req, res) => {
  try {
    const { data } = await tmdb("/genre/movie/list");
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.response?.data?.status_message || err.message });
  }
};

// Get showtimes for a movie (from DB)
const getShowtimes = async (req, res) => {
  const { tmdbId } = req.params;
  const { date } = req.query;
  try {
    const queryDate = date || new Date().toISOString().split("T")[0];

    // ── 1. Ensure theaters exist ──────────────────────────────────────────────
    let [theaters] = await pool.query("SELECT id, name FROM theaters");
    if (!theaters.length) {
      await pool.query(`
        INSERT IGNORE INTO theaters (name, location, total_seats) VALUES
        ('PVR Cinemas - Indiranagar', 'Indiranagar, Bangalore', 120),
        ('INOX - Garuda Mall', 'Magrath Road, Bangalore', 150),
        ('Cinepolis - Orion Mall', 'Rajajinagar, Bangalore', 100),
        ('PVR - Phoenix Mall', 'Whitefield, Bangalore', 130),
        ('Multiplex One - Koramangala', 'Koramangala, Bangalore', 110)
      `);
      [theaters] = await pool.query("SELECT id, name FROM theaters");
    }

    // ── 2. Ensure movie is cached in DB ───────────────────────────────────────
    let [dbMovies] = await pool.query("SELECT id FROM movies WHERE tmdb_id = ?", [tmdbId]);
    if (!dbMovies.length) {
      const { data } = await axios.get(`${TMDB_BASE}/movie/${tmdbId}`, {
        params: { api_key: TMDB_KEY, language: "en-US" },
      });
      await pool.query(
        `INSERT IGNORE INTO movies
           (tmdb_id, title, overview, poster_path, backdrop_path, release_date, vote_average, runtime, language)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [data.id, data.title, data.overview, data.poster_path, data.backdrop_path,
         data.release_date || null, data.vote_average, data.runtime || 120, data.original_language]
      );
      [dbMovies] = await pool.query("SELECT id FROM movies WHERE tmdb_id = ?", [tmdbId]);
    }
    const movieId = dbMovies[0].id;

    // ── 3. Check existing showtimes ───────────────────────────────────────────
    let [showtimes] = await pool.query(
      `SELECT s.*, t.name AS theater_name, t.location AS theater_location
       FROM showtimes s JOIN theaters t ON s.theater_id = t.id
       WHERE s.movie_id = ? AND s.show_date = ?
       ORDER BY t.name, s.show_time`,
      [movieId, queryDate]
    );

    // ── 4. Auto-generate if empty ─────────────────────────────────────────────
    if (!showtimes.length) {
      const SHOW_TIMES  = ["10:00:00", "13:30:00", "17:00:00", "20:30:00"];
      const FORMATS     = ["2D", "3D", "IMAX"];
      const PRICES      = { "IMAX": 450, "3D": 350, "2D": 250 };

      // Pick up to 4 theaters for variety
      const picked = theaters.slice(0, 4);
      const inserts = [];
      for (const theater of picked) {
        // 3 shows per theater at different times & formats
        for (let i = 0; i < 3; i++) {
          const fmt   = FORMATS[i % FORMATS.length];
          const price = PRICES[fmt];
          inserts.push([movieId, theater.id, queryDate, SHOW_TIMES[i], price, 100, fmt]);
        }
      }

      await pool.query(
        `INSERT INTO showtimes (movie_id, theater_id, show_date, show_time, price, available_seats, format)
         VALUES ?`,
        [inserts]
      );

      [showtimes] = await pool.query(
        `SELECT s.*, t.name AS theater_name, t.location AS theater_location
         FROM showtimes s JOIN theaters t ON s.theater_id = t.id
         WHERE s.movie_id = ? AND s.show_date = ?
         ORDER BY t.name, s.show_time`,
        [movieId, queryDate]
      );
    }

    res.json(showtimes);
  } catch (err) {
    console.error("getShowtimes error:", err.message);
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getNowPlaying, getPopular, getUpcoming, getTopRated, getMovieDetails, searchMovies, getGenres, getShowtimes };
