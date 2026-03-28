"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "../../components/Navbar";
import { moviesAPI, TMDB_IMG, TMDB_BACKDROP } from "../../lib/api";
import { Star, Clock, Calendar, Play, MapPin, Ticket, ChevronRight, Globe } from "lucide-react";
import toast from "react-hot-toast";
import { format, addDays } from "date-fns";

const FORMAT_STYLE = {
  "2D": "bg-[#1a1a1a] border-white/15 text-[#b3b3b3]",
  "3D": "bg-blue-950/50 border-blue-500/40 text-blue-300",
  "IMAX": "bg-purple-950/50 border-purple-500/40 text-purple-300",
  "4DX": "bg-orange-950/50 border-orange-500/40 text-orange-300",
};

export default function MovieDetailPage() {
  const { id } = useParams();
  const [data, setData] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingST, setLoadingST] = useState(false);
  const [selectedDate, setSelectedDate] = useState(format(new Date(), "yyyy-MM-dd"));

  useEffect(() => {
    moviesAPI.details(id)
      .then(({ data }) => setData(data))
      .catch(() => toast.error("Failed to load movie"))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    setLoadingST(true);
    moviesAPI.showtimes(id, selectedDate)
      .then(({ data }) => setShowtimes(data))
      .catch(() => setShowtimes([]))
      .finally(() => setLoadingST(false));
  }, [id, selectedDate]);

  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(new Date(), i);
    return { iso: format(d, "yyyy-MM-dd"), day: format(d, "EEE"), date: format(d, "d"), month: format(d, "MMM") };
  });

  const byTheater = showtimes.reduce((acc, s) => {
    if (!acc[s.theater_name]) acc[s.theater_name] = { location: s.theater_location, shows: [] };
    acc[s.theater_name].shows.push(s);
    return acc;
  }, {});

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <div className="pt-16 h-[55vh] skeleton" />
    </div>
  );

  if (!data) return null;
  const movie = data.movie;
  const cast = data.cast || [];
  const trailer = data.videos?.[0];

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />

      {/* Backdrop Hero */}
      <div className="relative h-[55vh] overflow-hidden">
        {movie.backdrop_path && (
          <img src={TMDB_BACKDROP(movie.backdrop_path)} alt={movie.title}
            className="w-full h-full object-cover object-top" />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a] via-[#0a0a0a]/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] to-transparent" />

        <div className="absolute inset-0 flex items-end">
          <div className="max-w-screen-xl mx-auto px-6 lg:px-12 w-full pb-10 flex items-end gap-7">
            {/* Poster */}
            <div className="hidden md:block flex-none w-36 h-52 rounded-xl overflow-hidden shadow-2xl ring-1 ring-white/10">
              {movie.poster_path
                ? <img src={TMDB_IMG(movie.poster_path)} alt="" className="w-full h-full object-cover" />
                : <div className="w-full h-full bg-[#1a1a1a]" />}
            </div>
            <div className="pb-1">
              {/* Genres */}
              <div className="flex gap-2 mb-2 flex-wrap">
                {movie.genres?.map(g => <span key={g.id} className="badge badge-dark">{g.name}</span>)}
              </div>
              <h1 className="font-display text-4xl lg:text-5xl text-white tracking-wide mb-3">{movie.title}</h1>
              <div className="flex flex-wrap items-center gap-4 text-sm">
                <span className="flex items-center gap-1.5 text-[#f5c518] font-bold">
                  <Star size={14} className="fill-[#f5c518]" />{movie.vote_average?.toFixed(1)}
                  <span className="text-[#555] font-normal text-xs">/ 10</span>
                </span>
                <span className="text-[#666]">|</span>
                <span className="text-[#b3b3b3] flex items-center gap-1"><Calendar size={13} />{movie.release_date}</span>
                <span className="text-[#666]">|</span>
                <span className="text-[#b3b3b3] flex items-center gap-1"><Clock size={13} />{movie.runtime} min</span>
                <span className="text-[#666]">|</span>
                <span className="text-[#b3b3b3] flex items-center gap-1 uppercase"><Globe size={13} />{movie.original_language}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-12 py-8">
        <div className="grid lg:grid-cols-3 gap-8 mb-12">
          <div className="lg:col-span-2">
            <h2 className="text-base font-semibold text-white mb-3">Overview</h2>
            <p className="text-[#b3b3b3] leading-relaxed text-sm">{movie.overview}</p>

            {trailer && (
              <a href={`https://youtube.com/watch?v=${trailer.key}`} target="_blank" rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-4 text-sm text-red-500 hover:text-red-400 font-medium transition-colors">
                <div className="w-7 h-7 rounded-full bg-red-600/20 border border-red-600/30 flex items-center justify-center">
                  <Play size={11} className="fill-red-400 ml-0.5" />
                </div>
                Watch Trailer on YouTube
              </a>
            )}
          </div>

          {/* Info card */}
          <div className="bg-[#141414] rounded-xl border border-white/6 p-5">
            {[
              ["Status", movie.status],
              ["Budget", movie.budget ? `$${(movie.budget/1e6).toFixed(0)}M` : null],
              ["Revenue", movie.revenue ? `$${(movie.revenue/1e6).toFixed(0)}M` : null],
              ["Language", movie.original_language?.toUpperCase()],
              ["Production", movie.production_companies?.[0]?.name],
            ].filter(([,v]) => v).map(([k, v]) => (
              <div key={k} className="flex justify-between py-2.5 border-b border-white/5 last:border-0">
                <span className="text-[#555] text-xs">{k}</span>
                <span className="text-[#b3b3b3] text-xs font-medium text-right max-w-[60%] truncate">{v}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Cast */}
        {cast.length > 0 && (
          <div className="mb-12">
            <h2 className="text-base font-semibold text-white mb-4">Cast</h2>
            <div className="flex gap-3 overflow-x-auto pb-2 hide-scrollbar">
              {cast.map(c => (
                <div key={c.id} className="flex-none w-20 text-center">
                  <div className="w-16 h-16 rounded-full overflow-hidden mx-auto mb-2 bg-[#1a1a1a] ring-1 ring-white/8">
                    {c.profile_path
                      ? <img src={TMDB_IMG(c.profile_path, "w92")} alt={c.name} className="w-full h-full object-cover" />
                      : <div className="w-full h-full flex items-center justify-center text-[#444] text-xl font-bold">{c.name[0]}</div>}
                  </div>
                  <p className="text-xs text-[#b3b3b3] line-clamp-2 leading-tight">{c.name}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ===== BOOK TICKETS - BookMyShow Style ===== */}
        <div>
          <div className="flex items-center gap-3 mb-5">
            <div className="w-1 h-6 bg-red-600 rounded-full" />
            <h2 className="text-xl font-bold text-white">Book Tickets</h2>
          </div>

          {/* Date strip */}
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2 hide-scrollbar">
            {dates.map(({ iso, day, date, month }) => (
              <button key={iso} onClick={() => setSelectedDate(iso)}
                className={`flex-none flex flex-col items-center w-16 py-3 rounded-xl border transition-all ${
                  selectedDate === iso
                    ? "bg-red-600 border-red-600 text-white shadow-lg shadow-red-600/25"
                    : "bg-[#141414] border-white/8 text-[#b3b3b3] hover:border-white/20 hover:text-white"
                }`}>
                <span className="text-[10px] font-semibold uppercase tracking-wider opacity-70">{day}</span>
                <span className="text-xl font-bold leading-tight">{date}</span>
                <span className="text-[10px] opacity-70">{month}</span>
              </button>
            ))}
          </div>

          {/* Showtimes */}
          {loadingST ? (
            <div className="space-y-3">
              {[1,2].map(i => <div key={i} className="h-28 skeleton rounded-xl" />)}
            </div>
          ) : Object.keys(byTheater).length === 0 ? (
            <div className="bg-[#141414] border border-white/6 rounded-xl p-8 text-center">
              <Ticket size={28} className="text-[#333] mx-auto mb-3" />
              <p className="text-[#555]">No shows available for this date</p>
            </div>
          ) : (
            <div className="space-y-3">
              {Object.entries(byTheater).map(([theater, { location, shows }]) => (
                <div key={theater} className="bg-[#141414] border border-white/6 rounded-xl p-5 hover:border-white/12 transition-colors">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-white text-sm">{theater}</h3>
                      <p className="text-xs text-[#555] flex items-center gap-1 mt-0.5"><MapPin size={10} />{location}</p>
                    </div>
                    <span className="text-xs text-[#444]">M-Ticket Available</span>
                  </div>
                  <div className="flex flex-wrap gap-2.5">
                    {shows.map(show => (
                      <Link key={show.id}
                        href={`/booking/${show.id}?movie=${id}&title=${encodeURIComponent(movie.title)}&poster=${encodeURIComponent(movie.poster_path||"")}&theater=${encodeURIComponent(theater)}&time=${show.show_time}&date=${show.show_date}&price=${show.price}&format=${show.format}`}>
                        <div className={`border rounded-lg px-4 py-2.5 cursor-pointer hover:border-red-500/60 hover:bg-red-600/8 transition-all group ${FORMAT_STYLE[show.format] || FORMAT_STYLE["2D"]}`}>
                          <div className="text-sm font-bold text-white group-hover:text-red-400 transition-colors">{show.show_time.slice(0,5)}</div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-bold uppercase">{show.format}</span>
                            <span className="text-[10px] text-[#555]">₹{show.price}</span>
                          </div>
                          <div className="text-[10px] text-green-500 mt-0.5">{show.available_seats > 20 ? "Available" : `${show.available_seats} left`}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
