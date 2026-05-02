"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import { bookingsAPI } from "../lib/api";
import useAuthStore from "../hooks/useAuthStore";
import {
  Ticket, MapPin, Calendar, Clock, Film,
  CheckCircle, AlertCircle, RefreshCw, Download, Star
} from "lucide-react";
import {
  Alert, LinearProgress, Chip, Tooltip,
  Tabs, Tab, Badge, Divider, Skeleton
} from "@mui/material";
import toast from "react-hot-toast";

const TMDB_IMG = (path) => path ? `https://image.tmdb.org/t/p/w500${path}` : null;

export default function BookingsPage() {
  const [bookings, setBookings]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cancelling, setCancelling] = useState(null);
  const [tab, setTab]             = useState(0);
  const { token, isHydrated, init } = useAuthStore();
  const router = useRouter();
  const [bookingError, setBookingError] = useState(null);

  // Always init on mount
  useEffect(() => { init(); }, [init]);

  const fetchBookings = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    setBookingError(null);
    try {
      const { data } = await bookingsAPI.myBookings();
      setBookings(Array.isArray(data) ? data : []);
    } catch (err) {
      const msg = err?.response?.data?.error || err?.message || "Failed to load bookings";
      if (err?.response?.status === 401) {
        // Token expired — redirect to login
        router.push("/login");
        return;
      }
      if (!silent) setBookingError(msg);
      else toast.error("Failed to refresh bookings");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [router]);

  useEffect(() => {
    if (!isHydrated) return;
    if (!token) { router.push("/login"); return; }
    fetchBookings();
  }, [isHydrated, token, router, fetchBookings]);

  // Scroll-reveal
  useEffect(() => {
    const nodes = document.querySelectorAll(".scroll-reveal");
    if (!nodes.length) return;
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add("is-visible"); }),
      { threshold: 0.12 }
    );
    nodes.forEach(n => observer.observe(n));
    return () => observer.disconnect();
  }, [bookings, tab]);

  const handleCancel = async (id) => {
    if (!confirm("Cancel this booking?")) return;
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

  const now = new Date();
  // MySQL DATE fields come back as ISO strings like "2026-04-27T18:30:00.000Z"
  // Extract just the date portion (YYYY-MM-DD) before building the Date object
  const parseShowDate = (show_date, show_time) => {
    const dateStr = show_date ? show_date.split('T')[0] : show_date;
    return new Date(`${dateStr}T${show_time}`);
  };
  const upcoming = bookings.filter(b =>
    b.status !== "cancelled" && parseShowDate(b.show_date, b.show_time) >= now
  );
  const past = bookings.filter(b =>
    b.status === "cancelled" || parseShowDate(b.show_date, b.show_time) < now
  );
  const displayed = tab === 0 ? upcoming : past;

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <div className="pt-20 max-w-4xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between gap-3 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/15 border border-red-500/20 flex items-center justify-center">
              <Ticket size={18} className="text-red-500" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white">My Bookings</h1>
              <p className="text-[#555] text-sm">
                {loading ? "Loading..." : `${bookings.length} total booking${bookings.length !== 1 ? "s" : ""}`}
              </p>
            </div>
          </div>
          <Tooltip title="Refresh bookings" arrow>
            <button
              onClick={() => fetchBookings(true)}
              disabled={refreshing || loading}
              className="w-9 h-9 rounded-xl bg-white/5 border border-[rgba(139,92,246,0.20)] flex items-center justify-center text-[#555] hover:text-white transition-all disabled:opacity-50"
            >
              <RefreshCw size={15} className={refreshing ? "spin" : ""} />
            </button>
          </Tooltip>
        </div>

        {/* MUI LinearProgress while loading */}
        {loading && <LinearProgress color="error" sx={{ mb: 2, borderRadius: 1, "& .MuiLinearProgress-bar": { background: "linear-gradient(90deg,#e50914,#7c3aed)" } }} />}

        {/* Stats row */}
        {!loading && bookings.length > 0 && (
          <div className="grid grid-cols-3 gap-3 mb-6">
            {[
              { label: "Total Bookings", value: bookings.length, color: "#7c3aed" },
              { label: "Upcoming Shows", value: upcoming.length, color: "#21c55d" },
              { label: "Total Spent", value: `₹${bookings.reduce((s, b) => s + parseFloat(b.total_amount || 0), 0).toFixed(0)}`, color: "#f5c518" },
            ].map(({ label, value, color }) => (
              <div key={label} className="rounded-xl p-4 border" style={{ background: "rgba(255,255,255,0.02)", borderColor: "rgba(139,92,246,0.15)" }}>
                <p className="text-[#555] text-xs mb-1">{label}</p>
                <p className="font-bold text-lg" style={{ color }}>{value}</p>
              </div>
            ))}
          </div>
        )}

        {/* MUI Tabs */}
        <div className="mb-5">
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            sx={{
              "& .MuiTab-root": { color: "#555", textTransform: "none", fontWeight: 600 },
              "& .Mui-selected": { color: "#fff !important" },
              "& .MuiTabs-indicator": { background: "#e50914" },
            }}
          >
            <Tab
              label={
                <Badge badgeContent={upcoming.length} color="error" max={99}>
                  <span style={{ paddingRight: upcoming.length > 0 ? 10 : 0 }}>Upcoming</span>
                </Badge>
              }
            />
            <Tab
              label={
                <Badge badgeContent={past.length} color="default" max={99}>
                  <span style={{ paddingRight: past.length > 0 ? 10 : 0 }}>Past & Cancelled</span>
                </Badge>
              }
            />
          </Tabs>
          <Divider sx={{ borderColor: "rgba(139,92,246,0.12)" }} />
        </div>

        {loading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-2xl overflow-hidden border border-[rgba(139,92,246,0.13)] p-5">
                <div className="flex gap-4">
                  <Skeleton variant="rectangular" width={56} height={80} sx={{ bgcolor: "#1a1a1a", borderRadius: 1 }} />
                  <div className="flex-1 space-y-2">
                    <Skeleton variant="text" width="60%" sx={{ bgcolor: "#1a1a1a" }} />
                    <Skeleton variant="text" width="40%" sx={{ bgcolor: "#1a1a1a" }} />
                    <Skeleton variant="text" width="80%" sx={{ bgcolor: "#1a1a1a" }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : bookingError ? (
          <div className="text-center py-20">
            <div className="w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-4">
              <AlertCircle size={28} className="text-red-400" />
            </div>
            <p className="text-white font-semibold mb-2">Failed to Load Bookings</p>
            <p className="text-[#555] text-sm mb-2">{bookingError}</p>
            <p className="text-[#333] text-xs mb-5 font-mono">Make sure you're logged in and the backend is running</p>
            <button onClick={() => fetchBookings()} className="btn-red px-6 py-2.5 rounded-xl text-sm flex items-center gap-2 mx-auto">
              <RefreshCw size={14} /> Retry
            </button>
          </div>
        ) : bookings.length === 0 ? (
          <div className="text-center py-24">
            <div className="w-20 h-20 rounded-full bg-white/4 border border-[rgba(139,92,246,0.15)] flex items-center justify-center mx-auto mb-5">
              <Ticket size={32} className="text-[#333]" />
            </div>
            <p className="text-white text-xl font-semibold mb-2">No bookings yet</p>
            <p className="text-[#555] text-sm mb-6">Book your first movie and enjoy the experience!</p>
            <button onClick={() => router.push("/movies")} className="btn-red px-8 py-3 rounded-xl">
              Browse Movies
            </button>
          </div>
        ) : displayed.length === 0 ? (
          <div className="text-center py-16">
            <Alert
              severity="info"
              sx={{ background: "rgba(139,92,246,0.08)", border: "1px solid rgba(139,92,246,0.2)", color: "#b3b3b3", "& .MuiAlert-icon": { color: "#7c3aed" } }}
            >
              {tab === 0 ? "No upcoming bookings. Browse movies to book tickets!" : "No past or cancelled bookings."}
            </Alert>
            {tab === 0 && (
              <button onClick={() => router.push("/movies")} className="btn-red px-8 py-3 rounded-xl mt-4">
                Browse Movies
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {displayed.map((b, idx) => (
              <BookingCard
                key={b.id}
                booking={b}
                onCancel={handleCancel}
                cancelling={cancelling}
                isPast={tab === 1}
                index={idx}
              />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

function BookingCard({ booking: b, onCancel, cancelling, isPast, index = 0 }) {
  const seatsList = (() => {
    try { return JSON.parse(b.seats || "[]"); }
    catch { return []; }
  })();
  const isCancelled = b.status === "cancelled";
  const backdropUrl = TMDB_IMG(b.backdrop_path);

  return (
    <div
      className={`relative overflow-hidden rounded-2xl border transition-all group scroll-reveal ${
        isCancelled
          ? "border-[rgba(139,92,246,0.08)] opacity-60"
          : "border-[rgba(139,92,246,0.18)] hover:border-red-500/30 hover:shadow-lg hover:shadow-red-500/5"
      }`}
      style={{ transitionDelay: `${index * 40}ms` }}
    >
      {backdropUrl && (
        <div
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: `url(${backdropUrl})`, backgroundSize: "cover", backgroundPosition: "center" }}
        />
      )}
      <div className="absolute inset-0 bg-gradient-to-r from-[#111] via-[#111]/95 to-[#111]/80" />

      <div className="relative p-5">
        <div className="flex items-start gap-4">
          {b.poster_path ? (
            <img
              src={`https://image.tmdb.org/t/p/w92${b.poster_path}`}
              alt={b.movie_title}
              className="w-14 h-20 object-cover rounded-lg flex-none border border-[rgba(139,92,246,0.20)]"
            />
          ) : (
            <div className="w-14 h-20 rounded-lg bg-white/5 border border-[rgba(139,92,246,0.18)] flex items-center justify-center flex-none">
              <Film size={20} className="text-[#333]" />
            </div>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-white text-base mb-0.5 line-clamp-1">{b.movie_title}</h3>
                <div className="flex flex-wrap gap-2 text-xs text-[#666] mb-2">
                  <span className="flex items-center gap-1"><MapPin size={10} className="text-red-500/60" />{b.theater_name}</span>
                  <span className="flex items-center gap-1"><Calendar size={10} className="text-purple-400/60" />{b.show_date ? b.show_date.split('T')[0] : ''}</span>
                  <span className="flex items-center gap-1"><Clock size={10} className="text-yellow-500/60" />{b.show_time?.slice(0, 5)}</span>
                </div>
                {/* Seats using MUI Chips */}
                <div className="flex items-center gap-1.5 flex-wrap">
                  {seatsList.slice(0, 6).map((s, i) => {
                    const sn = typeof s === "object" ? (s.seat_number || `S${i+1}`) : s;
                    return (
                      <Chip
                        key={i}
                        label={sn}
                        size="small"
                        sx={{
                          height: "20px",
                          fontSize: "10px",
                          fontWeight: 700,
                          fontFamily: "monospace",
                          background: "rgba(229,9,20,0.10)",
                          border: "1px solid rgba(229,9,20,0.22)",
                          color: "#f87171",
                          "& .MuiChip-label": { px: "6px" }
                        }}
                      />
                    );
                  })}
                  {seatsList.length > 6 && (
                    <span className="text-[#555] text-xs">+{seatsList.length - 6} more</span>
                  )}
                </div>
              </div>
              <div className="text-right flex-none">
                <p className="text-white font-bold text-base">₹{parseFloat(b.total_amount || 0).toFixed(0)}</p>
                <Chip
                  icon={isCancelled ? <AlertCircle size={11} /> : <CheckCircle size={11} />}
                  label={isCancelled ? "Cancelled" : "Confirmed"}
                  size="small"
                  sx={{
                    mt: 0.5,
                    height: "20px",
                    fontSize: "10px",
                    fontWeight: 700,
                    background: isCancelled ? "rgba(239,68,68,0.1)" : "rgba(34,197,94,0.1)",
                    border: `1px solid ${isCancelled ? "rgba(239,68,68,0.25)" : "rgba(34,197,94,0.25)"}`,
                    color: isCancelled ? "#f87171" : "#4ade80",
                    "& .MuiChip-label": { px: "6px" },
                    "& .MuiChip-icon": { color: "inherit", ml: "4px", fontSize: "11px" },
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Format badge if available */}
        {b.format && (
          <div className="mt-3">
            <span className="badge badge-purple text-[10px]">{b.format}</span>
          </div>
        )}

        <div className="flex items-center justify-between mt-4 pt-3 border-t border-[rgba(139,92,246,0.10)]">
          <div>
            <p className="text-[#333] text-xs font-mono">{b.booking_ref}</p>
            <p className="text-[#444] text-[10px] mt-0.5">{b.payment_method ? `via ${b.payment_method}` : ""}</p>
          </div>
          <div className="flex items-center gap-2">
            {!isCancelled && !isPast && (
              <button
                onClick={() => onCancel(b.id)}
                disabled={cancelling === b.id}
                className="text-xs text-[#555] hover:text-red-400 border border-[rgba(139,92,246,0.18)] hover:border-red-500/30 px-3 py-1.5 rounded-lg transition-all disabled:opacity-50"
              >
                {cancelling === b.id ? "Cancelling..." : "Cancel"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
