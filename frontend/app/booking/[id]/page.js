"use client";
import { useState, useEffect, useMemo } from "react";
import { useParams, useSearchParams, useRouter } from "next/navigation";
import Image from "next/image";
import Navbar from "../../components/Navbar";
import { bookingsAPI, TMDB_IMG } from "../../lib/api";
import useAuthStore from "../../hooks/useAuthStore";
import {
  MapPin, Clock, Calendar, Ticket, Check, ChevronRight,
  Info, Film, Users, AlertCircle, Star, Trash2,
  ZoomIn, ZoomOut, RotateCcw, Move
} from "lucide-react";
import toast from "react-hot-toast";

const SEAT_TYPE_CONFIG = {
  standard: { label: "Standard",  color: "#94a3b8", bg: "rgba(148,163,184,0.12)", border: "rgba(148,163,184,0.35)", multiplier: 1.0 },
  premium:  { label: "Premium",   color: "#f59e0b", bg: "rgba(245,158,11,0.12)", border: "rgba(245,197,24,0.45)", multiplier: 1.3  },
  recliner: { label: "Recliner",  color: "#a855f7", bg: "rgba(168,85,247,0.12)", border: "rgba(168,85,247,0.45)", multiplier: 1.8  },
};

function Skeleton({ className = "" }) {
  return <div className={`skeleton rounded-xl ${className}`} />;
}

function SeatLegend() {
  return (
    <div className="flex justify-center gap-4 flex-wrap text-xs mb-4">
      {[
        { label: "Available",  style: { background: "rgba(255,255,255,0.06)", border: "1.5px solid rgba(255,255,255,0.15)", borderRadius: "4px" } },
        { label: "Selected",   style: { background: "#e50914", border: "1.5px solid #ff4757", borderRadius: "4px" }, textColor: "text-red-400" },
        { label: "Booked",     style: { background: "rgba(255,255,255,0.02)", border: "1.5px solid rgba(255,255,255,0.05)", borderRadius: "4px", opacity: 0.4 } },
        { label: "Premium",    style: { background: "rgba(245,158,11,0.12)", border: "1.5px solid rgba(245,197,24,0.45)", borderRadius: "4px" }, textColor: "text-yellow-400" },
        { label: "Recliner",   style: { background: "rgba(168,85,247,0.12)", border: "1.5px solid rgba(168,85,247,0.45)", borderRadius: "7px" }, textColor: "text-purple-400" },
      ].map(({ label, style, textColor = "text-[#666]" }) => (
        <div key={label} className="flex items-center gap-1.5">
          <div className="w-5 h-4" style={style} />
          <span className={textColor}>{label}</span>
        </div>
      ))}
    </div>
  );
}

export default function BookingPage() {
  const { id: showtimeId } = useParams();
  const searchParams = useSearchParams();
  const router = useRouter();
  const { token, isHydrated, init } = useAuthStore();

  const movieId = searchParams.get("movie");
  const title   = searchParams.get("title");
  const poster  = searchParams.get("poster");
  const theater = searchParams.get("theater");
  const time    = searchParams.get("time");
  const date    = searchParams.get("date");
  const price   = parseFloat(searchParams.get("price") || "250");
  const format  = searchParams.get("format");
  const rating  = searchParams.get("rating");
  const genre   = searchParams.get("genre");

  const [seats, setSeats] = useState([]);
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [zoom, setZoom] = useState(1);
  const [infoSeat, setInfoSeat] = useState(null);
  const MAX_SEATS = 8;

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    if (!isHydrated) return;
    if (!token) {
      toast.error("Please login to book tickets");
      router.push("/login");
      return;
    }
    bookingsAPI.seats(showtimeId)
      .then(({ data }) => setSeats(data))
      .catch(() => toast.error("Failed to load seats. Please try again."))
      .finally(() => setLoading(false));
  }, [isHydrated, token, router, showtimeId]);

  const seatPrice = (seatType) => price * (SEAT_TYPE_CONFIG[seatType]?.multiplier || 1);

  const toggleSeat = (seat) => {
    if (seat.is_booked) return;
    setSelectedSeats(prev => {
      const already = prev.find(s => s.id === seat.id);
      if (already) return prev.filter(s => s.id !== seat.id);
      if (prev.length >= MAX_SEATS) {
        toast.error(`Maximum ${MAX_SEATS} seats per booking`);
        return prev;
      }
      return [...prev, seat];
    });
  };

  const removeSeat = (id) => setSelectedSeats(prev => prev.filter(s => s.id !== id));

  const totalAmount  = useMemo(() => selectedSeats.reduce((s, seat) => s + seatPrice(seat.seat_type), 0), [selectedSeats, price]);
  const convenience  = totalAmount * 0.05;
  const grandTotal   = totalAmount + convenience;

  const rows = useMemo(() => {
    const typeOrder = { standard: 0, premium: 1, recliner: 2 };
    return [...new Set(seats.map(s => s.row_label))].sort((a, b) => {
      const typeA = seats.find(s => s.row_label === a)?.seat_type || "standard";
      const typeB = seats.find(s => s.row_label === b)?.seat_type || "standard";
      return (typeOrder[typeA] - typeOrder[typeB]) || a.localeCompare(b);
    });
  }, [seats]);

  const stats = useMemo(() => {
    const total = seats.length;
    const booked = seats.filter(s => s.is_booked).length;
    return { total, booked, available: total - booked, percent: total ? Math.round((booked / total) * 100) : 0 };
  }, [seats]);

  const seatClass = (seat) => {
    const isSelected = selectedSeats.find(s => s.id === seat.id);
    if (seat.seat_type === "recliner") {
      if (seat.is_booked) return "seat recliner booked";
      if (isSelected) return "seat recliner selected";
      return "seat recliner";
    }
    if (seat.seat_type === "premium") {
      if (seat.is_booked) return "seat premium booked";
      if (isSelected) return "seat premium selected";
      return "seat premium";
    }
    if (seat.is_booked) return "seat booked";
    if (isSelected) return "seat selected";
    return "seat";
  };

  const handleProceedToPayment = () => {
    if (!selectedSeats.length) {
      toast.error("Please select at least one seat");
      return;
    }
    const params = new URLSearchParams({
      showtimeId,
      title:   title   || "",
      theater: theater || "",
      date:    date    || "",
      time:    time    || "",
      format:  format  || "",
      poster:  poster  || "",
      seats:   encodeURIComponent(JSON.stringify(selectedSeats)),
      total:   grandTotal.toFixed(2),
    });
    router.push(`/payment?${params.toString()}`);
  };

  // Group rows by type for section headers
  const rowGroups = useMemo(() => {
    const groups = [];
    let currentType = null;
    rows.forEach(rowLabel => {
      const rowType = seats.find(s => s.row_label === rowLabel)?.seat_type || "standard";
      if (rowType !== currentType) {
        groups.push({ type: rowType, rows: [rowLabel] });
        currentType = rowType;
      } else {
        groups[groups.length - 1].rows.push(rowLabel);
      }
    });
    return groups;
  }, [rows, seats]);

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <Navbar />
      <div className="pt-20 max-w-7xl mx-auto px-4 sm:px-6 py-6">

        {/* === HEADER === */}
        <div className="flex items-start gap-4 mb-6">
          {poster ? (
            <div className="flex-none">
              <Image
                src={TMDB_IMG(poster, "w92")}
                alt={title || "Movie"}
                width={60}
                height={90}
                className="rounded-xl object-cover border border-purple-500/25 shadow-2xl"
              />
            </div>
          ) : (
            <div className="w-[60px] h-[90px] rounded-xl bg-white/5 border border-purple-500/25 flex items-center justify-center flex-none">
              <Film size={22} className="text-[#444]" />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-3 flex-wrap">
              <div>
                <h1 className="text-2xl lg:text-3xl font-black text-white mb-1 leading-tight">{title}</h1>
                <div className="flex flex-wrap gap-2 text-sm text-[#b3b3b3] mt-1">
                  <span className="flex items-center gap-1.5"><MapPin size={13} className="text-red-500" />{theater}</span>
                  <span className="flex items-center gap-1.5"><Calendar size={13} className="text-purple-400" />{date}</span>
                  <span className="flex items-center gap-1.5"><Clock size={13} className="text-yellow-500" />{time?.slice(0, 5)}</span>
                  {format && <span className="badge badge-purple text-[10px]">{format}</span>}
                  {rating && (
                    <span className="flex items-center gap-1 text-yellow-400 font-semibold text-xs">
                      <Star size={11} fill="currentColor" /> {parseFloat(rating).toFixed(1)}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-[#555] text-xs mb-1">Starting from</p>
                <p className="text-2xl font-black text-white">₹{price.toFixed(0)}</p>
                <p className="text-[#555] text-xs">per seat</p>
              </div>
            </div>
          </div>
        </div>

        {/* === STEP INDICATOR === */}
        <div className="flex items-center gap-1.5 mb-6">
          {[["1", "Select Seats", true], ["2", "Payment", false], ["3", "Confirmed", false]].map(([num, label, active], i) => (
            <div key={num} className="flex items-center gap-1.5">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all ${
                active ? "bg-red-600 border-red-500 text-white shadow-lg shadow-red-500/30" : "border-purple-500/20 bg-white/5 text-[#444]"
              }`}>{num}</div>
              <span className={`text-sm hidden sm:block font-medium ${active ? "text-white" : "text-[#333]"}`}>{label}</span>
              {i < 2 && <ChevronRight size={13} className="text-[#222]" />}
            </div>
          ))}
        </div>

        <div className="grid xl:grid-cols-3 gap-5">
          {/* === SEAT MAP === */}
          <div className="xl:col-span-2">
            {/* Hall filling meter */}
            {!loading && stats.total > 0 && (
              <div className="glass rounded-2xl p-4 mb-4 flex items-center gap-4">
                <div className="flex-1">
                  <div className="flex justify-between text-xs text-[#666] mb-1.5">
                    <span>{stats.available} seats available</span>
                    <span>{stats.percent}% filled</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/5 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${stats.percent}%`,
                        background: stats.percent > 80 ? "#e50914" : stats.percent > 60 ? "#f59e0b" : "#21c55d"
                      }}
                    />
                  </div>
                </div>
                {stats.percent >= 80 && (
                  <div className="flex items-center gap-1 text-xs text-red-400 font-semibold whitespace-nowrap">
                    <AlertCircle size={13} /> Filling fast!
                  </div>
                )}
              </div>
            )}

            {/* Zoom controls */}
            <div className="flex items-center justify-between mb-3">
              <SeatLegend />
              <div className="flex items-center gap-1.5">
                <button
                  onClick={() => setZoom(z => Math.max(0.7, z - 0.1))}
                  className="w-8 h-8 rounded-lg bg-white/5 border border-purple-500/20 flex items-center justify-center text-[#666] hover:text-white transition-all hover:bg-white/10"
                >
                  <ZoomOut size={14} />
                </button>
                <button
                  onClick={() => setZoom(1)}
                  className="w-8 h-8 rounded-lg bg-white/5 border border-purple-500/20 flex items-center justify-center text-[#666] hover:text-white transition-all hover:bg-white/10 text-xs font-mono"
                >
                  {Math.round(zoom * 100)}%
                </button>
                <button
                  onClick={() => setZoom(z => Math.min(1.5, z + 0.1))}
                  className="w-8 h-8 rounded-lg bg-white/5 border border-purple-500/20 flex items-center justify-center text-[#666] hover:text-white transition-all hover:bg-white/10"
                >
                  <ZoomIn size={14} />
                </button>
              </div>
            </div>

            {/* Cinema screen */}
            <div className="text-center mb-6">
              <div className="relative mx-auto max-w-sm">
                <div className="h-2 rounded-t-full mx-8" style={{
                  background: "linear-gradient(to right, transparent, #e50914, #f84464, #e50914, transparent)",
                  boxShadow: "0 0 25px rgba(229,9,20,0.5), 0 0 50px rgba(229,9,20,0.2)",
                }} />
                <div className="h-0.5 rounded-full mx-4 opacity-30" style={{ background: "linear-gradient(to right,transparent,#ff6b8a,transparent)" }} />
                <p className="text-[9px] text-[#444] mt-2 tracking-[0.4em] uppercase">All eyes this way · Screen</p>
              </div>
            </div>

            {/* Seat grid */}
            {loading ? (
              <div className="space-y-2">
                {[...Array(6)].map((_, i) => (
                  <Skeleton key={i} className="h-10 w-full" />
                ))}
              </div>
            ) : (
              <div className="glass rounded-2xl p-6 overflow-x-auto">
                <div
                  className="min-w-max mx-auto transition-all duration-200"
                  style={{ transform: `scale(${zoom})`, transformOrigin: "top center" }}
                >
                  {rowGroups.map(({ type, rows: groupRows }) => (
                    <div key={type} className="mb-3">
                      {/* Section header */}
                      <div className="flex items-center gap-3 mb-2">
                        <div className="h-px flex-1 opacity-30" style={{ background: SEAT_TYPE_CONFIG[type]?.color }} />
                        <div className="flex items-center gap-1.5">
                          <div className="w-2 h-2 rounded-full" style={{ background: SEAT_TYPE_CONFIG[type]?.color }} />
                          <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: SEAT_TYPE_CONFIG[type]?.color }}>
                            {SEAT_TYPE_CONFIG[type]?.label}
                          </span>
                          <span className="text-[9px] text-[#444]">· ₹{(price * SEAT_TYPE_CONFIG[type]?.multiplier).toFixed(0)}</span>
                        </div>
                        <div className="h-px flex-1 opacity-30" style={{ background: SEAT_TYPE_CONFIG[type]?.color }} />
                      </div>

                      {groupRows.map(rowLabel => {
                        const rowSeats = seats.filter(s => s.row_label === rowLabel);
                        return (
                          <div key={rowLabel} className="flex items-center gap-2 mb-1.5">
                            <span className="w-5 text-[10px] text-[#333] font-mono text-right flex-none">{rowLabel}</span>
                            <div className="flex gap-1.5">
                              {/* Aisle gap in the middle */}
                              {rowSeats.map((seat, seatIdx) => (
                                <div key={seat.id} className="flex items-center gap-1.5">
                                  {seatIdx === Math.floor(rowSeats.length / 2) && (
                                    <div className="w-5" />
                                  )}
                                  <button
                                    onClick={() => toggleSeat(seat)}
                                    title={`${seat.seat_number} · ${SEAT_TYPE_CONFIG[seat.seat_type]?.label} · ₹${seatPrice(seat.seat_type).toFixed(0)}${seat.is_booked ? " · Booked" : ""}`}
                                    className={seatClass(seat)}
                                    disabled={seat.is_booked}
                                  >
                                    {seat.seat_number.replace(rowLabel, "")}
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Pricing reference */}
            <div className="grid grid-cols-3 gap-3 mt-4">
              {Object.entries(SEAT_TYPE_CONFIG).map(([type, cfg]) => (
                <div key={type} className="glass rounded-xl p-3 text-center border" style={{ borderColor: cfg.border }}>
                  <div className="w-6 h-5 rounded mx-auto mb-1.5" style={{ background: cfg.bg, border: `1.5px solid ${cfg.border}`, borderRadius: type === "recliner" ? "5px 5px 3px 3px" : "4px" }} />
                  <p className="text-white text-xs font-semibold">{cfg.label}</p>
                  <p className="font-mono font-bold text-sm mt-0.5" style={{ color: cfg.color }}>₹{(price * cfg.multiplier).toFixed(0)}</p>
                </div>
              ))}
            </div>
          </div>

          {/* === SELECTION SUMMARY === */}
          <div>
            <div className="glass rounded-2xl p-5 glow-border sticky top-24 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-white flex items-center gap-2">
                  <Ticket size={16} className="text-red-500" />
                  Your Selection
                </h3>
                {selectedSeats.length > 0 && (
                  <span className="text-xs text-[#555] font-mono bg-white/5 px-2 py-1 rounded-lg">
                    {selectedSeats.length}/{MAX_SEATS}
                  </span>
                )}
              </div>

              {selectedSeats.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-white/8 rounded-xl">
                  <div className="w-14 h-14 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-3">
                    <Ticket size={24} className="text-[#333]" />
                  </div>
                  <p className="text-[#555] text-sm font-medium">No seats selected</p>
                  <p className="text-[#333] text-xs mt-1">Click a seat on the map</p>
                </div>
              ) : (
                <div className="space-y-1.5">
                  {selectedSeats.map(s => {
                    const cfg = SEAT_TYPE_CONFIG[s.seat_type];
                    return (
                      <div
                        key={s.id}
                        className="flex items-center justify-between py-2 px-3 rounded-xl border transition-all"
                        style={{ background: cfg.bg, borderColor: cfg.border }}
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-black text-white font-mono w-8">{s.seat_number}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-lg font-bold uppercase" style={{ color: cfg.color, background: "rgba(0,0,0,0.3)" }}>
                            {cfg.label}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold font-mono" style={{ color: cfg.color }}>₹{seatPrice(s.seat_type).toFixed(0)}</span>
                          <button
                            onClick={() => removeSeat(s.id)}
                            className="w-6 h-6 rounded-lg bg-red-500/10 hover:bg-red-500/20 flex items-center justify-center transition-all"
                          >
                            <Trash2 size={12} className="text-red-400" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Pricing breakdown */}
              <div className="border-t border-white/8 pt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#666]">Subtotal ({selectedSeats.length} seat{selectedSeats.length !== 1 ? "s" : ""})</span>
                  <span className="text-white font-mono">₹{totalAmount.toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#666] flex items-center gap-1">
                    Convenience Fee
                    <span className="text-[#333] text-[10px]">(5%)</span>
                  </span>
                  <span className="text-white font-mono">₹{convenience.toFixed(0)}</span>
                </div>
                <div className="flex justify-between font-bold text-base pt-2 border-t border-white/8">
                  <span className="text-white">Total Payable</span>
                  <span className="text-red-400 font-mono">₹{grandTotal.toFixed(0)}</span>
                </div>
              </div>

              {/* Max seats warning */}
              {selectedSeats.length >= MAX_SEATS && (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-orange-500/8 border border-orange-500/15 text-xs text-orange-300">
                  <AlertCircle size={13} className="flex-none" />
                  Maximum {MAX_SEATS} seats per booking reached
                </div>
              )}

              <button
                onClick={handleProceedToPayment}
                disabled={!selectedSeats.length || loading}
                className="btn-red w-full py-4 justify-center font-bold text-base rounded-xl disabled:opacity-40 disabled:cursor-not-allowed"
              >
                {selectedSeats.length === 0 ? "Select Seats First" : (
                  <>Proceed to Payment <ChevronRight size={18} /></>
                )}
              </button>

              {selectedSeats.length > 0 && (
                <button
                  onClick={() => setSelectedSeats([])}
                  className="w-full flex items-center justify-center gap-1.5 py-2 text-xs text-[#444] hover:text-[#666] transition-colors"
                >
                  <RotateCcw size={11} /> Clear selection
                </button>
              )}

              <p className="text-center text-[#333] text-[10px]">
                Tickets are held for 10 minutes after selection
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
