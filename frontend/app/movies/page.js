"use client";
import { useState, useEffect, useCallback } from "react";
import { useSearchParams } from "next/navigation";
import Navbar from "../components/Navbar";
import MovieCard from "../components/MovieCard";
import Footer from "../components/Footer";
import { moviesAPI } from "../lib/api";
import { Search, X } from "lucide-react";
import { Tabs, Tab, Chip } from "@mui/material";

const FILTERS = [
  { key: "popular", label: "Popular" },
  { key: "now_playing", label: "Now Playing" },
  { key: "upcoming", label: "Coming Soon" },
  { key: "top_rated", label: "Top Rated" },
];

export default function MoviesPage() {
  const searchParams = useSearchParams();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [searchQuery, setSearchQuery] = useState(searchParams.get("search") || "");
  const [searchInput, setSearchInput] = useState(searchParams.get("search") || "");
  const [activeFilter, setActiveFilter] = useState(searchParams.get("filter") || "popular");
  const [genres, setGenres] = useState([]);
  const [selectedGenre, setSelectedGenre] = useState(null);

  // Sync filter/search from URL — so navbar "Now Playing" and "Coming Soon" links work
  useEffect(() => {
    const urlFilter = searchParams.get("filter");
    const urlSearch = searchParams.get("search");
    if (urlFilter && urlFilter !== activeFilter) {
      setActiveFilter(urlFilter);
      setSearchQuery("");
      setSearchInput("");
      setPage(1);
    }
    if (urlSearch && urlSearch !== searchQuery) {
      setSearchQuery(urlSearch);
      setSearchInput(urlSearch);
      setPage(1);
    }
  }, [searchParams]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchMovies = useCallback(async () => {
    setLoading(true);
    try {
      let res;
      if (searchQuery.trim()) {
        res = await moviesAPI.search(searchQuery);
      } else {
        const map = { popular: () => moviesAPI.popular(page), now_playing: moviesAPI.nowPlaying, upcoming: moviesAPI.upcoming, top_rated: moviesAPI.topRated };
        res = await (map[activeFilter] || moviesAPI.popular)();
      }
      let results = res.data.results || [];
      if (selectedGenre) results = results.filter(m => m.genre_ids?.includes(selectedGenre));
      setMovies(results);
      setTotalPages(Math.min(res.data.total_pages || 1, 20));
    } catch (e) { console.error(e); setMovies([]); }
    finally { setLoading(false); }
  }, [searchQuery, activeFilter, page, selectedGenre]);

  useEffect(() => { fetchMovies(); }, [fetchMovies]);
  useEffect(() => { moviesAPI.genres().then(r => setGenres(r.data.genres || [])).catch(() => {}); }, []);

  const handleSearch = (e) => { e.preventDefault(); setSearchQuery(searchInput); setPage(1); };
  const clearSearch = () => { setSearchInput(""); setSearchQuery(""); setPage(1); };
  const filterValue = searchQuery ? false : activeFilter;

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <div className="pt-20 max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-7">
          <div>
            <h1 className="text-3xl font-bold text-white">Movies</h1>
            {!loading && <p className="text-[#666] text-sm mt-1">{movies.length} titles</p>}
          </div>

          {/* Search */}
          <form onSubmit={handleSearch} className="relative w-full sm:w-72">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#555]" />
            <input type="text" value={searchInput} onChange={e => setSearchInput(e.target.value)}
              placeholder="Search movies..."
              className="w-full bg-[#1a1a1a] border border-purple-500/25 rounded-lg py-2.5 pl-10 pr-10 text-sm text-white placeholder-[#555] outline-none focus:border-red-600/50 focus:bg-[#1e1e1e] transition-all" />
            {searchInput && (
              <button type="button" onClick={clearSearch} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#555] hover:text-white">
                <X size={13} />
              </button>
            )}
          </form>
        </div>

        {/* Filter bar */}
        <div className="flex flex-wrap items-center gap-2 mb-6">
          <div className="bg-[#141414] rounded-xl border border-purple-500/25 px-1 py-0.5">
            <Tabs
              value={filterValue}
              onChange={(_, value) => {
                setActiveFilter(value);
                setPage(1);
                setSearchQuery("");
                setSearchInput("");
              }}
              textColor="inherit"
              indicatorColor="secondary"
              sx={{
                minHeight: 42,
                "& .MuiTabs-indicator": { backgroundColor: "#f84464", height: 3, borderRadius: 12 },
                "& .MuiTab-root": { color: "#9ca3af", textTransform: "none", fontWeight: 600, minHeight: 42 },
                "& .Mui-selected": { color: "#ffffff !important" },
              }}
            >
              {FILTERS.map((f) => (
                <Tab key={f.key} value={f.key} label={f.label} />
              ))}
            </Tabs>
          </div>

          <div className="flex gap-1.5 ml-2 flex-wrap">
            <Chip
              label="All"
              onClick={() => setSelectedGenre(null)}
              variant={!selectedGenre ? "filled" : "outlined"}
              sx={{
                borderColor: "rgba(124,58,237,0.35)",
                color: !selectedGenre ? "#fff" : "#9ca3af",
                backgroundColor: !selectedGenre ? "rgba(124,58,237,0.35)" : "transparent",
              }}
            />
            {genres.slice(0, 8).map((g) => (
              <Chip
                key={g.id}
                label={g.name}
                onClick={() => setSelectedGenre(selectedGenre === g.id ? null : g.id)}
                variant={selectedGenre === g.id ? "filled" : "outlined"}
                sx={{
                  borderColor: selectedGenre === g.id ? "rgba(248,68,100,0.5)" : "rgba(124,58,237,0.35)",
                  color: selectedGenre === g.id ? "#fecdd3" : "#9ca3af",
                  backgroundColor: selectedGenre === g.id ? "rgba(248,68,100,0.2)" : "transparent",
                }}
              />
            ))}
          </div>
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3">
            {Array.from({ length: 21 }).map((_, i) => (
              <div key={i} className="skeleton rounded aspect-[2/3]" />
            ))}
          </div>
        ) : movies.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-[#444] text-lg mb-2">No movies found</p>
            <p className="text-[#333] text-sm">Try a different search or filter</p>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 xl:grid-cols-7 gap-3">
            {movies.map((m, i) => (
              <div key={m.id} className="fade-up" style={{ animationDelay: `${i * 20}ms` }}>
                <MovieCard movie={m} />
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && !searchQuery && totalPages > 1 && (
          <div className="flex justify-center items-center gap-3 mt-10">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="px-5 py-2 bg-[#1a1a1a] border border-purple-500/20 rounded-lg text-sm text-[#b3b3b3] hover:text-white hover:bg-[#222] disabled:opacity-30 transition-all">
              ← Prev
            </button>
            <span className="text-[#666] text-sm">Page {page} / {totalPages}</span>
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages}
              className="px-5 py-2 bg-[#1a1a1a] border border-purple-500/20 rounded-lg text-sm text-[#b3b3b3] hover:text-white hover:bg-[#222] disabled:opacity-30 transition-all">
              Next →
            </button>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}
