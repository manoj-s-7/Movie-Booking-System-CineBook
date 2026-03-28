"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { bookingsAPI } from "../lib/api";
import useAuthStore from "../hooks/useAuthStore";
import { Ticket, MapPin, Calendar, Clock, Film, CheckCircle, AlertCircle } from "lucide-react";
import toast from "react-hot-toast";

const TMDB_BACKDROP = (path) => path ? `https://image.tmdb.org/t/p/w500${path}` : null;

export default function BookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelling, setCancelling] = useState(null);
  const { token, isHydrated, init } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    if (!isHydrated) return;
    if (!token) { router.push("/login"); return; }
    bookingsAPI.myBookings()
      .then(({ data }) => setBookings(data))
      .catch(() => toast.error("Failed to load bookings"))
      .finally(() => setLoading(false));
  }, [isHydrated, token, router]);

  useEffect(() => {
    const nodes = document.querySelectorAll(".scroll-reveal");
    if (!nodes.length) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) entry.target.classList.add("is-visible");
        });
      },
      { threshold: 0.12 }
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, [bookings]);

  const handleCancel = async (id) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    setCancelling(id);
    try {
      await bookingsAPI.cancel(id);
      setBookings(prev => prev.map(b => b.id === id ? { ...b, status: "cancelled" } : b));
      toast.success("Booking cancelled");
    } catch (err) {
      toast.error(err.response?.data?.error || "Cancellation failed");
    } finally {
      setCancelling(null);
    }
  };

  const upcoming = bookings.filter(b => b.status !== "cancelled" && new Date(`${b.show_date} ${b.show_time}`) >= new Date());
  const past = bookings.filter(b => b.status === "cancelled" || new Date(`${b.show_date} ${b.show_time}`) < new Date());

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <div className="pt-20 max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-red-600/15 border border-red-500/25 flex items-center justify-center">
            <Ticket size={18} className="text-red-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">My Bookings</h1>
            <p className="text-[#555] text-sm">{bookings.length} total bookings</p>
          </div>
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => <div key={i} className="h-36 skeleton rounded-2xl" />)}
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 rounded-full bg-white/4 border border-white/8 flex items-center justify-center mx-auto mb-5">
              <Ticket size={32} className="text-[#333]" />
            </div>
            <p className="text-white text-xl font-semibold mb-2">No bookings yet</p>
            <p className="text-[#555] text-sm mb-6">Book your first movie ticket and enjoy!</p>
            <button onClick={() => router.push("/movies")} className="btn-red px-8 py-3">
              Browse Movies
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Upcoming */}
            {upcoming.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-[#b3b3b3] uppercase tracking-wider mb-3">Upcoming ({upcoming.length})</h2>
                <div className="space-y-3">
                  {upcoming.map((b, idx) => <BookingCard key={b.id} booking={b} onCancel={handleCancel} cancelling={cancelling} index={idx} />)}
                </div>
              </div>
            )}

            {/* Past / Cancelled */}
            {past.length > 0 && (
              <div>
                <h2 className="text-sm font-semibold text-[#555] uppercase tracking-wider mb-3">Past & Cancelled ({past.length})</h2>
                <div className="space-y-3">
                  {past.map((b, idx) => <BookingCard key={b.id} booking={b} onCancel={handleCancel} cancelling={cancelling} isPast index={idx} />)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

function BookingCard({ booking: b, onCancel, cancelling, isPast, index = 0 }) {
  const seatsList = (() => { try { return JSON.parse(b.seats || "[]"); } catch { return []; } })();
  const isCancelled = b.status === "cancelled";
  const backdropUrl = TMDB_BACKDROP(b.backdrop_path);

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border transition-all group scroll-reveal ${
      isCancelled ? "border-slate-500/20 opacity-60" : "border-purple-500/20 hover:border-red-500/25"
    }`}
      style={{ transitionDelay: `${index * 40}ms` }}
    >
      {/* Backdrop faint bg */}
      {backdropUrl && (
        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: `url(${backdropUrl})`, backgroundSize: "cover", backgroundPosition: "center" }} />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-[#111] via-[#111]/95 to-[#111]/80" />

      <div className="relative p-5">
        <div className="flex items-start gap-4">
          {/* Poster */}
          {b.poster_path ? (
            <img
              src={`https://image.tmdb.org/t/p/w92${b.poster_path}`}
              alt={b.movie_title}
              className="w-14 h-20 object-cover rounded-lg flex-none border border-purple-500/20"
            />
          ) : (
            <div className="w-14 h-20 rounded-lg bg-white/5 border border-purple-500/20 flex items-center justify-center flex-none">
              <Film size={20} className="text-[#333]" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className="font-bold text-white text-base mb-0.5 line-clamp-1">{b.movie_title}</h3>
                <div className="flex flex-wrap gap-2 text-xs text-[#666] mb-2">
                  <span className="flex items-center gap-1"><MapPin size={10} />{b.theater_name}</span>
                  <span className="flex items-center gap-1"><Calendar size={10} />{b.show_date}</span>
                  <span className="flex items-center gap-1"><Clock size={10} />{b.show_time?.slice(0, 5)}</span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  {seatsList.map((s, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-red-600/12 border border-red-500/20 text-red-400 text-[10px] font-mono font-bold">
                      {s.seat_number}
                    </span>
                  ))}
                </div>
              </div>
              <div className="text-right flex-none">
                <p className="text-white font-bold">₹{parseFloat(b.total_amount).toFixed(0)}</p>
                <span className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-bold mt-1 ${
                  isCancelled ? "bg-red-500/15 text-red-400 border border-red-500/20" :
                  "bg-green-500/15 text-green-400 border border-green-500/20"
                }`}>
                  {isCancelled ? <><AlertCircle size={9} /> Cancelled</> : <><CheckCircle size={9} /> Confirmed</>}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-purple-500/15">
          <p className="text-[#444] text-xs font-mono">{b.booking_ref}</p>
          {!isCancelled && !isPast && (
            <button
              onClick={() => onCancel(b.id)}
              disabled={cancelling === b.id}
              className="text-xs text-[#666] hover:text-red-400 border border-purple-500/20 hover:border-red-500/30 px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
            >
              {cancelling === b.id ? "Cancelling..." : "Cancel"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
