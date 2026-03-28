"use client";
import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import MovieCard from "./MovieCard";

export default function MovieRow({ title, movies = [], accent }) {
  const rowRef = useRef(null);
  const wrapperRef = useRef(null);
  const [showLeft, setShowLeft] = useState(false);
  const [showRight, setShowRight] = useState(true);

  useEffect(() => {
    if (!wrapperRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("is-visible");
        });
      },
      { threshold: 0.15 }
    );
    observer.observe(wrapperRef.current);
    return () => observer.disconnect();
  }, []);

  const scroll = (dir) => {
    const el = rowRef.current;
    if (!el) return;
    const amount = dir === "left" ? -520 : 520;
    el.scrollBy({ left: amount, behavior: "smooth" });
    setTimeout(() => {
      setShowLeft(el.scrollLeft > 10);
      setShowRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
    }, 300);
  };

  if (!movies.length) {
    return (
      <div className="mb-8">
        <div className="h-6 w-48 skeleton rounded mb-4" />
        <div className="flex gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex-none w-40 h-60 skeleton rounded-md" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div ref={wrapperRef} className="mb-10 group/row relative scroll-reveal">
      {/* Title */}
      <div className="flex items-center gap-3 mb-4 px-1">
        <h2 className="text-lg sm:text-xl font-bold text-white">{title}</h2>
        {accent && (
          <div className="h-0.5 flex-1 bg-gradient-to-r from-red-600/40 to-transparent rounded-full" />
        )}
      </div>

      {/* Row container */}
      <div className="relative row-container">
        {/* Left arrow */}
        {showLeft && (
          <button
            onClick={() => scroll("left")}
            className="absolute left-0 top-0 bottom-0 z-20 w-12 flex items-center justify-center bg-gradient-to-r from-[#0a0a0a] to-transparent text-white hover:from-black transition-all"
          >
            <div className="w-8 h-8 rounded-full bg-black/60 border border-purple-500/25 flex items-center justify-center hover:bg-black transition-all hover:scale-110">
              <ChevronLeft size={18} />
            </div>
          </button>
        )}

        {/* Scroll container */}
        <div
          ref={rowRef}
          onScroll={(e) => {
            setShowLeft(e.target.scrollLeft > 10);
            setShowRight(e.target.scrollLeft < e.target.scrollWidth - e.target.clientWidth - 10);
          }}
          className="flex gap-2 overflow-x-auto hide-scrollbar pb-2"
          style={{ paddingLeft: "2px", paddingRight: "2px" }}
        >
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>

        {/* Right arrow */}
        {showRight && (
          <button
            onClick={() => scroll("right")}
            className="absolute right-0 top-0 bottom-0 z-20 w-12 flex items-center justify-center bg-gradient-to-l from-[#0a0a0a] to-transparent text-white hover:from-black transition-all"
          >
            <div className="w-8 h-8 rounded-full bg-black/60 border border-purple-500/25 flex items-center justify-center hover:bg-black transition-all hover:scale-110">
              <ChevronRight size={18} />
            </div>
          </button>
        )}
      </div>
    </div>
  );
}
