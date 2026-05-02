"use client";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Play, Ticket, Star, Clock, ChevronLeft, ChevronRight, Info } from "lucide-react";
import { TMDB_BACKDROP, TMDB_IMG } from "../lib/api";

export default function HeroSlider({ movies = [] }) {
  const [current, setCurrent] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const router = useRouter();

  const goTo = useCallback((idx) => {
    if (isAnimating) return;
    setIsAnimating(true);
    setCurrent(idx);
    setTimeout(() => setIsAnimating(false), 600);
  }, [isAnimating]);

  const next = useCallback(() => {
    goTo((current + 1) % movies.length);
  }, [current, movies.length, goTo]);

  const prev = useCallback(() => {
    goTo((current - 1 + movies.length) % movies.length);
  }, [current, movies.length, goTo]);

  useEffect(() => {
    if (movies.length <= 1) return;
    const t = setInterval(next, 6000);
    return () => clearInterval(t);
  }, [next, movies.length]);

  if (!movies.length) {
    return (
      <div className="h-[85vh] skeleton rounded-none" />
    );
  }

  const movie = movies[current];
  const rating = movie.vote_average?.toFixed(1);

  return (
    <div className="relative h-[76vh] min-h-[480px] overflow-hidden">
      {/* Backdrop */}
      <div
        key={current}
        className="absolute inset-0 transition-opacity duration-700"
        style={{ opacity: isAnimating ? 0 : 1 }}
      >
        <Image
          src={TMDB_BACKDROP(movie.backdrop_path)}
          alt={movie.title}
          fill
          priority
          className="object-cover object-top"
          sizes="100vw"
        />
      </div>

      {/* Vignette overlays */}
      <div className="absolute inset-0 hero-vignette" />
      <div className="absolute inset-0 hero-gradient" />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#0a0a0a] to-transparent" />

      {/* Content */}
      <div
        className="relative h-full flex flex-col justify-end pb-20 px-6 sm:px-10 lg:px-16 max-w-screen-xl mx-auto"
        style={{ opacity: isAnimating ? 0 : 1, transition: "opacity 0.5s ease" }}
      >
        {/* Genre chips */}
        <div className="flex gap-2 mb-4 flex-wrap">
          {movie.genre_ids?.slice(0, 3).map((id) => (
            <span key={id} className="badge badge-dark">{genreMap[id] || "Film"}</span>
          ))}
          {rating && (
            <span className="flex items-center gap-1 badge badge-gold">
              <Star size={10} fill="currentColor" /> {rating}
            </span>
          )}
          {movie.original_language && (
            <span className="badge badge-dark uppercase">{movie.original_language}</span>
          )}
        </div>

        {/* Title */}
        <h1
          className="text-5xl sm:text-6xl lg:text-7xl text-white font-black mb-3 leading-none max-w-2xl"
          style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.03em" }}
        >
          {movie.title}
        </h1>

        {/* Overview */}
        <p className="text-[#b3b3b3] text-base max-w-xl mb-7 line-clamp-2 leading-relaxed">
          {movie.overview}
        </p>

        {/* CTAs */}
        <div className="flex gap-3 flex-wrap">
          <button
            onClick={() => router.push(`/movies/${movie.id}`)}
            className="btn-red text-base px-7 py-3"
          >
            <Ticket size={18} /> Book Now
          </button>
          <button
            onClick={() => router.push(`/movies/${movie.id}`)}
            className="btn-ghost text-base px-7 py-3"
          >
            <Info size={18} /> More Info
          </button>
        </div>
      </div>

      {/* Navigation Arrows */}
      {movies.length > 1 && (
        <>
          <button
            onClick={prev}
            className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 border border-purple-500/25 flex items-center justify-center text-white hover:bg-black/80 transition-all hover:scale-110 backdrop-blur-sm"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={next}
            className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 border border-purple-500/25 flex items-center justify-center text-white hover:bg-black/80 transition-all hover:scale-110 backdrop-blur-sm"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}

      {/* Dots + Progress */}
      {movies.length > 1 && (
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2">
          {movies.map((_, i) => (
            <button
              key={i}
              onClick={() => goTo(i)}
              className={`transition-all rounded-full ${
                i === current
                  ? "w-8 h-2 bg-red-600"
                  : "w-2 h-2 bg-white/30 hover:bg-white/50"
              }`}
            />
          ))}
        </div>
      )}

      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-[10px] tracking-[0.25em] text-[#777] no-print">
        SCROLL FOR MORE
      </div>
    </div>
  );
}

const genreMap = {
  28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 80: "Crime",
  99: "Documentary", 18: "Drama", 10751: "Family", 14: "Fantasy", 36: "History",
  27: "Horror", 10402: "Music", 9648: "Mystery", 10749: "Romance", 878: "Sci-Fi",
  10770: "TV Movie", 53: "Thriller", 10752: "War", 37: "Western",
};
