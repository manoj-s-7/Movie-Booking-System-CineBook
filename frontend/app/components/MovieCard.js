"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Star, Ticket, Play } from "lucide-react";
import { TMDB_IMG } from "../lib/api";

export default function MovieCard({ movie }) {
  const router = useRouter();
  if (!movie) return null;

  const rating = movie.vote_average?.toFixed(1);
  const year = movie.release_date?.slice(0, 4);

  return (
    <div
      className="movie-card flex-none cursor-pointer group"
      style={{ width: "160px" }}
      onClick={() => router.push(`/movies/${movie.id}`)}
    >
      {/* Poster */}
      <div className="relative" style={{ height: "240px" }}>
        <Image
          src={TMDB_IMG(movie.poster_path)}
          alt={movie.title}
          fill
          sizes="160px"
          className="object-cover rounded-md"
        />

        {/* Overlay on hover */}
        <div className="card-overlay rounded-md" />

        {/* Rating badge */}
        {rating && (
          <div className="absolute top-2 left-2 flex items-center gap-1 bg-black/70 backdrop-blur-sm rounded-full px-2 py-0.5">
            <Star size={9} className="text-yellow-400" fill="currentColor" />
            <span className="text-white text-[10px] font-bold">{rating}</span>
          </div>
        )}

        {/* Hover content */}
        <div className="absolute inset-0 flex flex-col justify-end p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <p className="text-white text-xs font-bold line-clamp-2 mb-2">{movie.title}</p>
          <div className="flex gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); router.push(`/movies/${movie.id}`); }}
              className="flex-1 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold py-1.5 rounded flex items-center justify-center gap-1 transition-colors"
            >
              <Ticket size={10} /> Book
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); router.push(`/movies/${movie.id}`); }}
              className="w-8 h-6 bg-white/15 hover:bg-white/25 text-white rounded flex items-center justify-center transition-colors"
            >
              <Play size={10} fill="white" />
            </button>
          </div>
          {year && <p className="text-[#b3b3b3] text-[9px] mt-1">{year}</p>}
        </div>
      </div>
    </div>
  );
}
