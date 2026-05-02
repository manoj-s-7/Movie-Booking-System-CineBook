"use client";
import { useEffect, useRef, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle, Download, Ticket, MapPin, Calendar,
  Clock, Film, ArrowRight, Share2, Printer
} from "lucide-react";
import { Alert, Tooltip, Chip, Snackbar } from "@mui/material";
import toast from "react-hot-toast";

function PaymentSuccessPageInner() {
  const searchParams = useSearchParams();
  const [downloading, setDownloading] = useState(false);
  const [snackOpen, setSnackOpen] = useState(false);
  const canvasRef = useRef(null);
  const ticketRef = useRef(null);

  const bookingRef = searchParams.get("bookingRef");
  const movie      = searchParams.get("movie");
  const theater    = searchParams.get("theater");
  const date       = searchParams.get("date");
  const time       = searchParams.get("time");
  const format     = searchParams.get("format");
  const total      = searchParams.get("total");
  const method     = searchParams.get("method");
  const poster     = searchParams.get("poster");
  const seatsList  = (() => {
    try { const raw = searchParams.get("seats") || "[]"; return JSON.parse(decodeURIComponent(raw)); }
    catch { return []; }
  })();

  // Confetti
  useEffect(() => {
    let frame;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const particles = Array.from({ length: 140 }, () => ({
      x: Math.random() * canvas.width,
      y: -20,
      vx: (Math.random() - 0.5) * 3,
      vy: Math.random() * 4 + 2,
      r: Math.random() * 6 + 3,
      color: ["#e50914","#f84464","#7c3aed","#f5c518","#21c55d","#3b82f6"][Math.floor(Math.random()*6)],
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
        p.x += p.vx; p.y += p.vy; p.vy += 0.05; p.rotation += p.rotationSpeed;
        if (p.y < canvas.height + 20) anyAlive = true;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rotation * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.globalAlpha = Math.max(0, 1 - p.y / canvas.height);
        if (p.shape === "rect") { ctx.fillRect(-p.r, -p.r / 2, p.r * 2, p.r); }
        else { ctx.beginPath(); ctx.arc(0, 0, p.r, 0, Math.PI * 2); ctx.fill(); }
        ctx.restore();
      });
      if (anyAlive) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => { alive = false; cancelAnimationFrame(frame); };
  }, []);

  const methodLabels = { card: "Credit/Debit Card", upi: "UPI", netbanking: "Net Banking", wallet: "Wallet" };

  // Download ticket as PDF using html2canvas + jsPDF
  // We build a fully-inlined hidden clone so CSS classes / backdrop-filter don't break the render
  const handleDownloadPdf = async () => {
    if (downloading) return;
    setDownloading(true);
    const toastId = toast.loading("Generating your ticket PDF...");

    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import("html2canvas"),
        import("jspdf"),
      ]);

      // ── Build a fully-inlined ticket element ──────────────────────────────
      const wrap = document.createElement("div");
      wrap.style.cssText = `
        position: fixed; top: -9999px; left: -9999px; z-index: -1;
        width: 480px; font-family: 'DM Sans','Inter',sans-serif;
      `;

      const seatsHtml = seatsList.map(s => {
        const sn = typeof s === "object" ? (s.seat_number || s) : s;
        return `<span style="
          background:rgba(229,9,20,0.18);border:1px solid rgba(229,9,20,0.4);
          color:#f87171;border-radius:8px;padding:3px 10px;font-size:11px;
          font-weight:700;font-family:monospace;display:inline-block;margin:2px;
        ">${sn}</span>`;
      }).join("");

      const methodLabel = { card:"Credit/Debit Card", upi:"UPI", netbanking:"Net Banking", wallet:"Wallet" }[method] || method || "Card";

      wrap.innerHTML = `
        <div id="pdf-ticket" style="
          width:480px;
          background:linear-gradient(135deg,#1a1a2e 0%,#16213e 55%,#0f0f1a 100%);
          border:1.5px solid rgba(124,58,237,0.35);
          border-radius:18px;overflow:hidden;
          box-shadow:0 30px 80px rgba(0,0,0,0.8),0 0 0 1px rgba(124,58,237,0.12);
        ">
          <!-- TOP GRADIENT BAR -->
          <div style="height:4px;background:linear-gradient(90deg,#e50914,#f84464,#7c3aed,#f84464,#e50914);"></div>

          <!-- HEADER -->
          <div style="
            display:flex;align-items:center;justify-content:space-between;
            padding:14px 22px 12px;
            background:rgba(229,9,20,0.07);
            border-bottom:1px solid rgba(229,9,20,0.12);
          ">
            <div style="display:flex;align-items:center;gap:8px;">
              <div style="width:16px;height:16px;border-radius:50%;background:#e50914;display:flex;align-items:center;justify-content:center;">
                <div style="width:8px;height:8px;border-radius:50%;background:white;"></div>
              </div>
              <span style="font-family:'Bebas Neue',sans-serif;letter-spacing:0.2em;font-size:1.25rem;color:#e50914;font-weight:400;">CINEBOOK</span>
            </div>
            <div style="display:flex;align-items:center;gap:8px;">
              <span style="color:#444;font-size:9px;text-transform:uppercase;letter-spacing:0.2em;">E-Ticket</span>
              ${format ? `<span style="background:rgba(124,58,237,0.2);border:1px solid rgba(124,58,237,0.38);color:#c4b5fd;padding:2px 8px;border-radius:5px;font-size:9px;font-weight:700;">${format}</span>` : ""}
            </div>
          </div>

          <!-- MOVIE INFO -->
          <div style="padding:20px 22px 14px;display:flex;gap:16px;align-items:flex-start;">
            ${poster ? `<img src="https://image.tmdb.org/t/p/w154${poster}" crossorigin="anonymous" style="width:68px;height:100px;object-fit:cover;border-radius:10px;border:1px solid rgba(124,58,237,0.28);flex-shrink:0;" />` : `<div style="width:68px;height:100px;border-radius:10px;background:rgba(255,255,255,0.05);border:1px solid rgba(124,58,237,0.2);flex-shrink:0;"></div>`}
            <div style="flex:1;min-width:0;">
              <h2 style="font-size:18px;font-weight:800;color:#fff;margin:0 0 10px;line-height:1.3;">${movie || "—"}</h2>
              <div style="display:flex;flex-direction:column;gap:5px;">
                <div style="display:flex;align-items:center;gap:6px;font-size:12px;color:#b3b3b3;">
                  <span style="color:#e50914;">📍</span> ${theater || "—"}
                </div>
                <div style="display:flex;gap:16px;font-size:12px;color:#b3b3b3;">
                  <span><span style="color:#a78bfa;">📅</span> ${date || "—"}</span>
                  <span><span style="color:#facc15;">🕐</span> ${time || "—"}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- SEATS -->
          <div style="padding:0 22px 16px;">
            <p style="color:#555;font-size:9px;text-transform:uppercase;letter-spacing:0.2em;font-weight:600;margin-bottom:8px;">Seats (${seatsList.length})</p>
            <div style="display:flex;flex-wrap:wrap;gap:4px;">${seatsHtml}</div>
          </div>

          <!-- PERFORATION -->
          <div style="
            position:relative;margin:0 22px;
            border-top:2px dashed rgba(124,58,237,0.25);
            padding:0;
          ">
            <div style="position:absolute;left:-32px;top:-12px;width:22px;height:22px;background:#0a0a0a;border-radius:50%;border:1px solid rgba(124,58,237,0.15);"></div>
            <div style="position:absolute;right:-32px;top:-12px;width:22px;height:22px;background:#0a0a0a;border-radius:50%;border:1px solid rgba(124,58,237,0.15);"></div>
          </div>

          <!-- BOOKING REF + AMOUNTS -->
          <div style="padding:18px 22px 16px;">
            <div style="text-align:center;margin-bottom:16px;">
              <p style="color:#555;font-size:9px;text-transform:uppercase;letter-spacing:0.2em;font-weight:600;margin-bottom:4px;">Booking Reference</p>
              <p style="font-family:monospace;font-size:22px;font-weight:900;color:#fff;letter-spacing:0.12em;">${bookingRef || "—"}</p>
            </div>

            <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:16px;">
              <div style="background:rgba(229,9,20,0.08);border:1px solid rgba(229,9,20,0.2);border-radius:10px;padding:10px 14px;">
                <p style="color:#555;font-size:9px;text-transform:uppercase;letter-spacing:0.12em;margin-bottom:3px;">Total Paid</p>
                <p style="color:#f87171;font-weight:800;font-size:16px;font-family:monospace;">₹${total || "0"}</p>
              </div>
              <div style="background:rgba(124,58,237,0.08);border:1px solid rgba(124,58,237,0.2);border-radius:10px;padding:10px 14px;">
                <p style="color:#555;font-size:9px;text-transform:uppercase;letter-spacing:0.12em;margin-bottom:3px;">Payment Via</p>
                <p style="color:#c4b5fd;font-weight:600;font-size:13px;">${methodLabel}</p>
              </div>
            </div>

            <!-- BARCODE -->
            <div style="display:flex;justify-content:center;margin-bottom:6px;">
              <svg width="240" height="44" viewBox="0 0 240 44" xmlns="http://www.w3.org/2000/svg">
                ${Array.from({length:60},(_,i)=>`<rect x="${i*4}" y="0" width="${i%3===0?1:2}" height="44" fill="rgba(255,255,255,0.5)"/>`).join("")}
              </svg>
            </div>
            <p style="text-align:center;color:#444;font-family:monospace;font-size:9px;">${bookingRef || ""}</p>
          </div>

          <!-- FOOTER -->
          <div style="
            text-align:center;color:#333;font-size:9px;
            padding:10px 22px 14px;
            border-top:1px solid rgba(124,58,237,0.10);
          ">
            Present this ticket at the theater entrance · Valid only for the listed show
          </div>

          <!-- BOTTOM GRADIENT BAR -->
          <div style="height:3px;background:linear-gradient(90deg,#7c3aed,#f84464,#e50914);"></div>
        </div>
      `;

      document.body.appendChild(wrap);

      // Wait for poster image to load
      const img = wrap.querySelector("img");
      if (img) {
        await new Promise(resolve => {
          if (img.complete) { resolve(); return; }
          img.onload = resolve;
          img.onerror = resolve;
          setTimeout(resolve, 4000);
        });
      }

      await new Promise(r => requestAnimationFrame(r));
      await new Promise(r => setTimeout(r, 200));

      const ticketEl = wrap.querySelector("#pdf-ticket");
      const canvas = await html2canvas(ticketEl, {
        backgroundColor: null,
        scale: 3,
        useCORS: true,
        allowTaint: false,
        logging: false,
        imageTimeout: 8000,
        width: 480,
        height: ticketEl.offsetHeight,
      });

      document.body.removeChild(wrap);

      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

      const pageWidth  = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      // Dark background
      pdf.setFillColor(10, 10, 10);
      pdf.rect(0, 0, pageWidth, pageHeight, "F");

      // Subtle purple glow effect (rectangle)
      pdf.setFillColor(18, 14, 38);
      pdf.roundedRect(8, 10, pageWidth - 16, pageHeight - 20, 4, 4, "F");

      // Place the ticket image centered
      const imgWidth  = pageWidth - 30;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const xOff      = 15;
      const yOff      = Math.max(20, (pageHeight - imgHeight) / 2);

      pdf.addImage(imgData, "PNG", xOff, yOff, imgWidth, imgHeight);

      // Footer text
      pdf.setTextColor(60, 60, 60);
      pdf.setFontSize(7);
      pdf.text(
        "Present this e-ticket at the theater entrance  ·  CineBook — Your premium movie experience",
        pageWidth / 2,
        pageHeight - 6,
        { align: "center" }
      );

      pdf.save(`CineBook-${bookingRef || "Ticket"}.pdf`);
      toast.success("🎟️ Ticket downloaded!", { id: toastId });
    } catch (err) {
      console.error("PDF error:", err);
      toast.error("PDF failed: " + err.message, { id: toastId });
    } finally {
      setDownloading(false);
    }
  };


  const handleShare = async () => {
    const text = `🎬 Just booked ${movie} at ${theater} on ${date}!\nBooking Ref: ${bookingRef}\nPowered by CineBook 🍿`;
    if (navigator.share) {
      try { await navigator.share({ title: "CineBook E-Ticket", text }); }
      catch { /* cancelled */ }
    } else {
      navigator.clipboard.writeText(text);
      setSnackOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] relative overflow-hidden">
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-50 no-print" />

      {/* Background glow */}
      <div className="fixed inset-0 pointer-events-none no-print">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] rounded-full bg-green-500/4 blur-3xl" />
        <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] rounded-full bg-purple-600/4 blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-start min-h-screen px-4 py-12 pt-16">
        {/* Success header */}
        <div className="text-center mb-6 scale-in no-print">
          <div className="relative w-24 h-24 mx-auto mb-4">
            <div className="absolute inset-0 rounded-full bg-green-500/20 border-2 border-green-500/30 animate-ping" style={{ animationDuration: "2s" }} />
            <div className="absolute inset-0 rounded-full bg-green-500/10 border-2 border-green-500/50" />
            <CheckCircle size={40} className="absolute inset-0 m-auto text-green-400" />
          </div>
          <h1 className="text-4xl sm:text-5xl font-black text-white mb-2" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.05em" }}>
            BOOKING CONFIRMED!
          </h1>
          <p className="text-[#b3b3b3]">Payment successful. Your e-ticket is ready below!</p>
        </div>

        {/* Alert */}
        <div className="w-full max-w-md mb-5 no-print">
          <Alert
            severity="success"
            className="fade-up"
            style={{ animationDelay: "0.1s", background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.25)", color: "#86efac" }}
            sx={{ "& .MuiAlert-icon": { color: "#4ade80" } }}
          >
            Booking <strong>{bookingRef}</strong> confirmed. Enjoy the movie! 🍿
          </Alert>
        </div>

        {/* ===== E-TICKET (captured by html2canvas) ===== */}
        <div className="w-full max-w-md fade-up" style={{ animationDelay: "0.2s" }} ref={ticketRef}>
          <div className="ticket-card overflow-hidden">
            {/* Top accent bar */}
            <div style={{ height: 3, background: "linear-gradient(90deg,#e50914,#f84464,#7c3aed)" }} />

            {/* Header band */}
            <div className="flex items-center justify-between px-5 py-3" style={{ background: "rgba(229,9,20,0.07)", borderBottom: "1px solid rgba(229,9,20,0.1)" }}>
              <div className="flex items-center gap-2">
                <Film size={16} className="text-red-500" />
                <span style={{ fontFamily: "'Bebas Neue',sans-serif", letterSpacing: "0.18em", fontSize: "1.2rem", color: "#e50914" }}>
                  CINEBOOK
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[#555] text-[9px] uppercase tracking-[0.2em]">E-Ticket</span>
                {format && (
                  <Chip label={format} size="small" sx={{ height: 18, fontSize: "9px", fontWeight: 700, background: "rgba(124,58,237,0.2)", border: "1px solid rgba(124,58,237,0.35)", color: "#c4b5fd", "& .MuiChip-label": { px: "6px" } }} />
                )}
              </div>
            </div>

            {/* Movie info */}
            <div className="p-5 pb-0">
              <div className="flex items-start gap-4">
                {poster ? (
                  <img
                    src={`https://image.tmdb.org/t/p/w154${poster}`}
                    alt={movie}
                    crossOrigin="anonymous"
                    className="w-16 h-24 object-cover rounded-lg flex-none"
                    style={{ border: "1px solid rgba(124,58,237,0.25)" }}
                  />
                ) : (
                  <div className="w-16 h-24 rounded-lg flex items-center justify-center flex-none" style={{ background: "rgba(255,255,255,0.05)", border: "1px solid rgba(124,58,237,0.2)" }}>
                    <Film size={24} className="text-[#444]" />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h2 className="font-bold text-white text-lg leading-tight mb-2 line-clamp-2">{movie}</h2>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 text-[#b3b3b3] text-xs">
                      <MapPin size={11} className="text-red-500 flex-none" /> {theater}
                    </div>
                    <div className="flex items-center gap-4 text-[#b3b3b3] text-xs">
                      <span className="flex items-center gap-1.5"><Calendar size={11} className="text-purple-400" /> {date}</span>
                      <span className="flex items-center gap-1.5"><Clock size={11} className="text-yellow-500" /> {time}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Seats */}
            <div className="px-5 py-4">
              <p className="text-[#555] text-[9px] uppercase tracking-widest mb-2.5 font-semibold">Seats ({seatsList.length})</p>
              <div className="flex flex-wrap gap-1.5">
                {seatsList.map((seat, i) => {
                  const sn = typeof seat === "object" ? (seat.seat_number || seat) : seat;
                  return (
                    <span key={i} className="px-2.5 py-1 rounded-lg text-xs font-bold font-mono" style={{ background: "rgba(229,9,20,0.15)", border: "1px solid rgba(229,9,20,0.3)", color: "#f87171" }}>
                      {sn}
                    </span>
                  );
                })}
              </div>
            </div>

            {/* Perforation divider */}
            <div className="ticket-perforation border-t border-dashed border-[rgba(139,92,246,0.20)] mx-4" />

            {/* Booking ref section */}
            <div className="p-5 pt-4">
              <div className="text-center mb-4">
                <p className="text-[#555] text-xs uppercase tracking-widest mb-1.5 font-semibold">Booking Reference</p>
                <p className="font-mono text-2xl font-black text-white tracking-wider">{bookingRef}</p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                <div style={{ background: "rgba(229,9,20,0.06)", border: "1px solid rgba(229,9,20,0.15)", borderRadius: 10, padding: "10px 12px" }}>
                  <p className="text-[#555] text-[10px] mb-0.5 uppercase tracking-wider">Total Paid</p>
                  <p className="text-red-400 font-bold text-base">₹{total}</p>
                </div>
                <div style={{ background: "rgba(139,92,246,0.06)", border: "1px solid rgba(139,92,246,0.15)", borderRadius: 10, padding: "10px 12px" }}>
                  <p className="text-[#555] text-[10px] mb-0.5 uppercase tracking-wider">Payment</p>
                  <p className="text-white font-medium text-sm">{methodLabels[method] || method}</p>
                </div>
              </div>

              {/* Barcode */}
              <div className="flex justify-center mb-1">
                <svg width="220" height="40" viewBox="0 0 220 40">
                  {Array.from({ length: 55 }, (_, i) => (
                    <rect key={i} x={i * 4} y="0" width={i % 3 === 0 ? 1 : 2} height="40" fill="rgba(255,255,255,0.45)" />
                  ))}
                </svg>
              </div>
              <p className="text-center text-[#444] text-[9px] font-mono">{bookingRef}</p>
            </div>

            {/* Footer */}
            <div className="text-center text-[#333] text-[9px] py-3 px-5" style={{ borderTop: "1px solid rgba(139,92,246,0.10)" }}>
              Present this ticket at the theater entrance · Valid only for the listed show
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 mt-5 w-full max-w-md fade-up no-print" style={{ animationDelay: "0.4s" }}>
          <Tooltip title="Downloads a pixel-perfect PDF of your ticket" arrow>
            <button
              onClick={handleDownloadPdf}
              disabled={downloading}
              className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl border text-sm font-semibold transition-all disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ background: "rgba(124,58,237,0.1)", borderColor: "rgba(124,58,237,0.3)", color: "#c4b5fd" }}
            >
              <Download size={16} />
              {downloading ? "Generating..." : "Download PDF"}
            </button>
          </Tooltip>
          <Tooltip title="Share booking details" arrow>
            <button
              onClick={handleShare}
              className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl border text-sm font-medium transition-all hover:border-purple-500/30"
              style={{ background: "rgba(255,255,255,0.04)", borderColor: "rgba(139,92,246,0.18)", color: "#b3b3b3" }}
            >
              <Share2 size={16} />
            </button>
          </Tooltip>
        </div>

        {/* Nav links */}
        <div className="flex gap-3 mt-3 w-full max-w-md fade-up no-print" style={{ animationDelay: "0.5s" }}>
          <Link
            href="/bookings"
            className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-medium transition-all"
            style={{ background: "rgba(124,58,237,0.1)", border: "1px solid rgba(124,58,237,0.2)", color: "#a78bfa" }}
          >
            <Ticket size={16} /> My Bookings
          </Link>
          <Link href="/movies" className="flex-1 btn-red py-3 rounded-xl justify-center text-sm">
            Book More <ArrowRight size={16} />
          </Link>
        </div>
      </div>

      {/* Clipboard snackbar */}
      <Snackbar
        open={snackOpen}
        autoHideDuration={3000}
        onClose={() => setSnackOpen(false)}
        message="Booking details copied to clipboard!"
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      />
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-green-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#555]">Loading your ticket...</p>
        </div>
      </div>
    }>
      <PaymentSuccessPageInner />
    </Suspense>
  );
}
