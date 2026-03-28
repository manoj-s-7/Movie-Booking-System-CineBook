"use client";
import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import HeroSlider from "./components/HeroSlider";
import MovieRow from "./components/MovieRow";
import Footer from "./components/Footer";
import { moviesAPI } from "./lib/api";
import { AlertCircle } from "lucide-react";

export default function HomePage() {
  const [data, setData] = useState({ nowPlaying: [], popular: [], upcoming: [], topRated: [] });
  const [error, setError] = useState(null);

  useEffect(() => {
    Promise.all([
      moviesAPI.nowPlaying(),
      moviesAPI.popular(),
      moviesAPI.upcoming(),
      moviesAPI.topRated(),
    ]).then(([np, pop, up, tr]) => {
      setData({
        nowPlaying: np.data.results || [],
        popular: pop.data.results || [],
        upcoming: up.data.results || [],
        topRated: tr.data.results || [],
      });
    }).catch((e) => {
      const msg = e.response?.data?.error || e.message;
      if (e.code === "ERR_NETWORK") setError("Backend not running. Start it: cd backend && npm run dev");
      else setError(msg || "Failed to load movies");
    });
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />

      {error ? (
        <div className="pt-24 max-w-xl mx-auto px-6">
          <div className="rounded-xl p-6 bg-red-950/40 border border-red-500/30">
            <div className="flex gap-3">
              <AlertCircle size={20} className="text-red-400 flex-none mt-0.5" />
              <div>
                <p className="font-semibold text-white mb-1">Connection Error</p>
                <p className="text-red-300 text-sm">{error}</p>
                <p className="text-[#666] text-xs mt-3 font-mono">Check: http://localhost:5000/api/movies/now-playing</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          <HeroSlider movies={data.nowPlaying.slice(0, 6)} />
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-6 -mt-4 relative z-10">
            <MovieRow title="🔥 Now Playing" movies={data.nowPlaying} accent />
            <MovieRow title="📈 Trending This Week" movies={data.popular} accent />
            <MovieRow title="⭐ Top Rated All Time" movies={data.topRated} accent />
            <MovieRow title="🎬 Coming Soon" movies={data.upcoming} accent />
          </div>
        </>
      )}
      <Footer />
    </div>
  );
}
