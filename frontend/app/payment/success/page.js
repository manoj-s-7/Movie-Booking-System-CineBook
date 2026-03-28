"use client";
import { useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Download, Ticket, MapPin, Calendar, Clock, Film, ArrowRight } from "lucide-react";
import toast from "react-hot-toast";

export default function PaymentSuccessPage() {
  const searchParams = useSearchParams();
  const [downloading, setDownloading] = useState(false);
  const canvasRef = useRef(null);
  const ticketRef = useRef(null);

  const bookingRef = searchParams.get("bookingRef");
  const movie = searchParams.get("movie");
  const theater = searchParams.get("theater");
  const date = searchParams.get("date");
  const time = searchParams.get("time");
  const format = searchParams.get("format");
  const total = searchParams.get("total");
  const method = searchParams.get("method");
  const poster = searchParams.get("poster");
  const seatsList = (() => { try { const raw = searchParams.get("seats") || "[]"; return JSON.parse(decodeURIComponent(raw)); } catch { return []; } })();

  // Confetti effect
  useEffect(() => {
    let frame;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: -20,
      vx: (Math.random() - 0.5) * 3,
      vy: Math.random() * 4 + 2,
      r: Math.random() * 6 + 3,
      color: ["#e50914", "#f84464", "#7c3aed", "#f5c518", "#21c55d", "#3b82f6"][Math.floor(Math.random() * 6)],
      rotation: Math.random() * 360,
      rotationSpeed: (Math.random() - 0.5) * 5,
      shape: Math.random() > 0.5 ? "rect" : "circle",
    }));

    let alive = true;
    const animate = () => {
      if (!alive) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let anyAlive = false;
      particles.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05;
        p.rotation += p.rotationSpeed;
        if (p.y < canvas.height + 20) anyAlive = true;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, 1 - p.y / canvas.height);
        if (p.shape === "rect") {
          ctx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r);
        } else {
          ctx.beginPath();
          ctx.arc(0, 0, p.r, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      });
      if (anyAlive) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => { alive = false; cancelAnimationFrame(frame); };
  }, []);

  const methodLabels = { card: "Credit/Debit Card", upi: "UPI", netbanking: "Net Banking", wallet: "Wallet" };

  const handleDownloadPdf = async () => {
    if (!ticketRef.current || downloading) return;
    try {
      setDownloading(true);
      window.print();
      toast.success("Print dialog opened. Choose 'Save as PDF' to download exact ticket style.");
    } catch {
      toast.error("Failed to download ticket PDF");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] relative overflow-hidden">
      {/* Confetti canvas */}
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-50 no-print" />

      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none no-print">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-green-500/5 blur-3xl" />
        <div className="absolute top-1/4 left-1/4 w-[300px] h-[300px] rounded-full bg-purple-600/5 blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-12">
        {/* Success header */}
        <div className="text-center mb-8 scale-in no-print">
          <div className="relative w-24 h-24 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full bg-green-500/20 border-2 border-green-500/30 animate-ping" style={{ animationDuration: "2s" }} />
            <div className="absolute inset-0 rounded-full bg-green-500/10 border-2 border-green-500/50" />
            <CheckCircle size={40} className="absolute inset-0 m-auto text-green-400" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-2" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.05em" }}>
            BOOKING CONFIRMED!
          </h1>
          <p className="text-[#b3b3b3]">Payment successful. Your e-tickets are ready!</p>
        </div>

        {/* E-TICKET */}
        <div className="w-full max-w-md fade-up scroll-reveal is-visible print-ticket" style={{ animationDelay: "0.2s" }} ref={ticketRef}>
          <div className="ticket-card overflow-hidden">
            {/* Movie info strip */}
            <div className="p-5 pb-0">
              <div className="flex items-start gap-4">
                {poster ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w92${poster}`}
                    alt={movie}
                    className="w-16 h-24 object-cover rounded-lg flex-none border border-purple-500/20"
                  />
                ) : (
                  <div className="w-16 h-24 rounded-lg bg-white/5 border border-purple-500/20 flex items-center justify-center flex-none">
                    <Film size={24} className="text-[#444]" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h2 className="font-bold text-white text-lg leading-tight mb-1 line-clamp-2">{movie}</h2>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-purple-600/20 text-purple-300 border border-purple-500/30 mb-2">
                    {format}
                  </span>
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-[#b3b3b3] text-xs">
                      <MapPin size={11} /> {theater}
                    </div>
                    <div className="flex items-center gap-3 text-[#b3b3b3] text-xs">
                      <span className="flex items-center gap-1"><Calendar size={11} /> {date}</span>
                      <span className="flex items-center gap-1"><Clock size={11} /> {time}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Seats */}
            <div className="px-5 py-4">
              <div className="flex flex-wrap gap-1.5">
                {seatsList.map((seat, i) => (
                  <span key={i} className="px-2.5 py-1 rounded-lg bg-red-600/15 border border-red-500/25 text-red-400 text-xs font-bold font-mono">
                    {seat}
                  </span>
                ))}
              </div>
            </div>

            {/* Divider with perforations */}
            <div className="ticket-perforation border-t border-dashed border-purple-500/25 mx-4" />

            {/* Booking ref section */}
            <div className="p-5 pt-4">
              <div className="text-center mb-4">
                <p className="text-[#555] text-xs uppercase tracking-widest mb-1">Booking Reference</p>
                <p className="font-mono text-2xl font-black text-white tracking-wider">{bookingRef}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-[#555] text-xs mb-0.5">Total Paid</p>
                  <p className="text-white font-bold">₹{total}</p>
                </div>
                <div>
                  <p className="text-[#555] text-xs mb-0.5">Payment via</p>
                  <p className="text-white font-medium text-xs">{methodLabels[method] || method}</p>
                </div>
              </div>

              {/* Barcode (decorative) - fixed widths to avoid hydration mismatch */}
              <div className="mt-4 flex justify-center">
                <svg width="220" height="40" viewBox="0 0 220 40">
                  {Array.from({ length: 55 }, (_, i) => (
                    <rect
                      key={i}
                      x={i * 4}
                      y="0"
                      width={(i % 3 === 0 ? 1 : 2)}
                      height="40"
                      fill="rgba(255,255,255,0.55)"
                    />
                  ))}
                </svg>
              </div>
              <p className="text-center text-[#444] text-[9px] font-mono mt-1">{bookingRef}</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-6 w-full max-w-md fade-up no-print" style={{ animationDelay: "0.4s" }}>
          <button
            onClick={handleDownloadPdf}
            disabled={downloading}
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-white/5 border border-purple-500/20 text-[#b3b3b3] hover:text-white hover:border-purple-400/30 transition-all text-sm font-medium disabled:opacity-60"
          >
            <Download size={16} /> {downloading ? "Preparing Ticket..." : "Download Ticket PDF"}
          </button>
        </div>

        {/* Nav links */}
        <div className="flex gap-3 mt-3 w-full max-w-md fade-up no-print" style={{ animationDelay: "0.5s" }}>
          <Link
            href="/bookings"
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-purple-600/10 border border-purple-500/20 text-purple-400 hover:bg-purple-600/20 transition-all text-sm font-medium"
          >
            <Ticket size={16} /> My Bookings
          </Link>
          <Link
            href="/movies"
            className="flex-1 btn-red py-3 rounded-xl justify-center text-sm"
          >
            Book More <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
