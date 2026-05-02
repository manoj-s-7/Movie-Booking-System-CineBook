"use client";
import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import HeroSlider from "./components/HeroSlider";
import MovieRow from "./components/MovieRow";
import Footer from "./components/Footer";
import { moviesAPI } from "./lib/api";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Chip, LinearProgress } from "@mui/material";

export default function HomePage() {
  const [data, setData] = useState({ nowPlaying: [], popular: [], upcoming: [], topRated: [] });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadMovies = () => {
    setError(null);
    setLoading(true);
    Promise.all([
      moviesAPI.nowPlaying(),
      moviesAPI.popular(),
      moviesAPI.upcoming(),
      moviesAPI.topRated(),
    ]).then(([np, pop, up, tr]) => {
      setData({
        nowPlaying: np.data?.results || [],
        popular: pop.data?.results || [],
        upcoming: up.data?.results || [],
        topRated: tr.data?.results || [],
      });
      setLoading(false);
    }).catch((e) => {
      const msg = e.response?.data?.error || e.message;
      if (e.code === "ERR_NETWORK") setError("Backend server is not reachable. Make sure it is running on port 5000.");
      else setError(msg || "Failed to load movies");
      setLoading(false);
    });
  };

  useEffect(() => { loadMovies(); }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />

      {loading && (
        <div className="fixed top-0 left-0 right-0 z-50">
          <LinearProgress color="error" sx={{ height: 2, "& .MuiLinearProgress-bar": { background: "linear-gradient(90deg, #e50914, #7c3aed)" } }} />
        </div>
      )}

      {error ? (
        <div className="pt-24 max-w-xl mx-auto px-6 flex flex-col items-center">
          <div className="rounded-2xl p-8 bg-red-950/30 border border-red-500/25 w-full text-center">
            <AlertCircle size={40} className="text-red-400 mx-auto mb-4" />
            <p className="font-bold text-white text-lg mb-2">Connection Error</p>
            <p className="text-red-300 text-sm mb-4">{error}</p>
            <p className="text-[#555] text-xs mb-6 font-mono">Check: http://localhost:5000/api/health</p>
            <button onClick={loadMovies} className="btn-red px-6 py-2.5 rounded-xl text-sm flex items-center gap-2 mx-auto">
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        </div>
      ) : (
        <>
          <HeroSlider movies={loading ? [] : data.nowPlaying.slice(0, 6)} loading={loading} />
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-4 relative z-10">
            {!loading && data.nowPlaying.length > 0 && (
              <div className="flex gap-2 flex-wrap mb-8 overflow-x-auto hide-scrollbar pb-1">
                {["Action","Drama","Comedy","Thriller","Sci-Fi","Horror","Romance","Animation"].map(g => (
                  <Chip key={g} label={g} size="small" sx={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.22)", color: "#b3b3b3", fontSize: "0.75rem", fontWeight: 500, cursor: "pointer", "&:hover": { background: "rgba(229,9,20,0.15)", borderColor: "rgba(229,9,20,0.4)", color: "#fff" } }} />
                ))}
              </div>
            )}
            <MovieRow title="🔥 Now Playing" movies={data.nowPlaying} loading={loading} accent />
            <MovieRow title="📈 Trending This Week" movies={data.popular} loading={loading} accent />
            <MovieRow title="⭐ Top Rated All Time" movies={data.topRated} loading={loading} accent />
            <MovieRow title="🎬 Coming Soon" movies={data.upcoming} loading={loading} accent />
          </div>
        </>
      )}
      <Footer />
    </div>
  );
}
