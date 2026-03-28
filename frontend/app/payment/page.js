"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import { bookingsAPI } from "../lib/api";
import useAuthStore from "../hooks/useAuthStore";
import toast from "react-hot-toast";
import {
  CreditCard, Smartphone, Building2, Wallet,
  Lock, Shield, CheckCircle, ChevronRight, ArrowLeft,
  Check, Film, MapPin, Calendar, Clock, Tag, Info,
  Star, Zap, AlertCircle
} from "lucide-react";

// ========================
// BANK LIST
// ========================
const BANKS = [
  { id: "sbi",      name: "State Bank of India",  abbr: "SBI",   color: "#1a3c6e" },
  { id: "hdfc",     name: "HDFC Bank",             abbr: "HDFC",  color: "#004c8f" },
  { id: "icici",    name: "ICICI Bank",             abbr: "ICICI", color: "#B02A30" },
  { id: "axis",     name: "Axis Bank",              abbr: "AXIS",  color: "#97144D" },
  { id: "kotak",    name: "Kotak Bank",             abbr: "KMB",   color: "#EF4136" },
  { id: "pnb",      name: "Punjab National Bank",   abbr: "PNB",   color: "#004B87" },
  { id: "bob",      name: "Bank of Baroda",         abbr: "BOB",   color: "#F15A22" },
  { id: "canara",   name: "Canara Bank",            abbr: "CAN",   color: "#004C97" },
  { id: "yes",      name: "Yes Bank",               abbr: "YES",   color: "#6B2D8B" },
  { id: "idfc",     name: "IDFC First Bank",        abbr: "IDFC",  color: "#E31837" },
  { id: "indusind", name: "IndusInd Bank",          abbr: "IIB",   color: "#0057A8" },
  { id: "federal",  name: "Federal Bank",           abbr: "FED",   color: "#1E3A5F" },
];

// ========================
// WALLETS
// ========================
const WALLETS = [
  { id: "paytm",   name: "Paytm",       color: "#002970", balance: "₹1,245", icon: "P" },
  { id: "phonepe", name: "PhonePe",     color: "#5f259f", balance: "₹890",   icon: "₱" },
  { id: "gpay",    name: "Google Pay",  color: "#1a73e8", balance: "₹2,100", icon: "G" },
  { id: "amazon",  name: "Amazon Pay",  color: "#ff9900", balance: "₹456",   icon: "A" },
];

const DEMO_CARD = { number: "4111 1111 1111 1111", name: "DEMO USER", expiry: "12/28", cvv: "123" };

// ========================
// CARD FLIP COMPONENT
// ========================
function AnimatedCard({ number, name, expiry, cvv, focused }) {
  const isFlipped = focused === "cvv";
  const raw = number.replace(/\D/g, "");
  const displayNumber = raw.replace(/(.{4})/g, "$1 ").trim() || "•••• •••• •••• ••••";
  const padded = displayNumber.padEnd(19, "•").slice(0, 19);

  return (
    <div className="payment-card-container w-full max-w-xs mx-auto mb-6">
      <div className={`payment-card-inner ${isFlipped ? "flipped" : ""}`}>
        {/* Front */}
        <div className="payment-card-front">
          {/* Chip */}
          <div className="flex justify-between items-start mb-5">
            <div>
              <div className="w-10 h-7 rounded-sm bg-gradient-to-br from-yellow-400 to-yellow-600" />
            </div>
            <div className="flex items-center gap-1 opacity-70">
              <div className="w-7 h-7 rounded-full bg-red-500/70" />
              <div className="w-7 h-7 rounded-full bg-yellow-400/70 -ml-3" />
            </div>
          </div>
          <div className="font-mono text-white text-lg tracking-widest mb-5 text-shadow">
            {padded}
          </div>
          <div className="flex justify-between items-end">
            <div>
              <p className="text-[#8a8a9a] text-[9px] uppercase tracking-wider mb-0.5">Card Holder</p>
              <p className="text-white text-xs font-semibold uppercase tracking-wider line-clamp-1 max-w-[140px]">
                {name || "CARDHOLDER NAME"}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[#8a8a9a] text-[9px] uppercase tracking-wider mb-0.5">Expires</p>
              <p className="text-white text-xs font-semibold font-mono">{expiry || "MM/YY"}</p>
            </div>
          </div>
        </div>

        {/* Back */}
        <div className="payment-card-back">
          <div className="w-full h-10 bg-black/60 mb-5" style={{ marginLeft: "-24px", width: "calc(100% + 48px)" }} />
          <div className="bg-white/10 h-10 rounded flex items-center justify-end px-4 mb-4">
            <p className="text-[#8a8a9a] text-xs mr-3">CVV</p>
            <p className="font-mono text-white text-base tracking-widest">
              {cvv ? "•".repeat(cvv.length) : "•••"}
            </p>
          </div>
          <p className="text-[#555] text-[9px] text-center">
            This card is property of CineBook. Use is subject to agreement.
          </p>
        </div>
      </div>
    </div>
  );
}

// ========================
// OTP INPUT
// ========================
function OtpInput({ value, onChange }) {
  const refs = useRef([]);
  const digits = value.split("").concat(Array(6).fill("")).slice(0, 6);

  const handleChange = (i, v) => {
    const clean = v.replace(/\D/g, "").slice(-1);
    const arr = value.split("").concat(Array(6).fill("")).slice(0, 6);
    arr[i] = clean;
    onChange(arr.join(""));
    if (clean && i < 5) refs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i, e) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) refs.current[i - 1]?.focus();
  };

  return (
    <div className="flex gap-2 justify-center">
      {digits.map((d, i) => (
        <input
          key={i}
          ref={el => refs.current[i] = el}
          maxLength={1}
          value={d}
          onChange={e => handleChange(i, e.target.value)}
          onKeyDown={e => handleKeyDown(i, e)}
          className="w-11 h-13 bg-[#1a1a1a] border border-white/12 rounded-xl text-center text-white font-mono text-xl outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
          style={{ height: "52px" }}
        />
      ))}
    </div>
  );
}

// ========================
// UPI SECTION
// ========================
function UPISection({ onSuccess }) {
  const [upiId, setUpiId] = useState("");
  const [timer, setTimer] = useState(20);
  const [mode, setMode] = useState("qr");
  const [scanning, setScanning] = useState(false);
  const [upiVerified, setUpiVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const successFired = useRef(false);

  useEffect(() => {
    if (mode !== "qr") return;
    if (successFired.current) return;
    const interval = setInterval(() => {
      setTimer(t => {
        if (t <= 1) {
          clearInterval(interval);
          if (!successFired.current) {
            successFired.current = true;
            setScanning(true);
            setTimeout(() => onSuccess(), 2500);
          }
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [mode]); // eslint-disable-line react-hooks/exhaustive-deps

  const verifyUpi = async () => {
    if (!upiId.includes("@")) { toast.error("Enter a valid UPI ID (e.g. name@upi)"); return; }
    setVerifying(true);
    await new Promise(r => setTimeout(r, 1500));
    setVerifying(false);
    setUpiVerified(true);
    toast.success("UPI ID verified!");
  };

  return (
    <div className="space-y-4">
      {/* Tab switcher */}
      <div className="flex rounded-xl overflow-hidden border border-white/10">
        {[["qr", "📷 Scan QR"], ["id", "✏️ UPI ID"]].map(([m, label]) => (
          <button
            key={m}
            onClick={() => { setMode(m); successFired.current = false; }}
            className={`flex-1 py-2.5 text-sm font-medium transition-all ${
              mode === m ? "bg-purple-600 text-white" : "bg-[#1a1a1a] text-[#666] hover:text-white"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {mode === "qr" ? (
        <div className="text-center">
          <div className="relative inline-block mb-4">
            <div className={`w-52 h-52 mx-auto bg-white rounded-2xl p-3 qr-pulse ${scanning ? "opacity-60 scale-95" : ""} transition-all duration-500`}>
              <svg viewBox="0 0 100 100" className="w-full h-full">
                {/* QR corners */}
                <rect fill="#000" x="5" y="5" width="28" height="28" rx="3"/>
                <rect fill="#fff" x="10" y="10" width="18" height="18" rx="2"/>
                <rect fill="#000" x="13" y="13" width="12" height="12"/>
                <rect fill="#000" x="67" y="5" width="28" height="28" rx="3"/>
                <rect fill="#fff" x="72" y="10" width="18" height="18" rx="2"/>
                <rect fill="#000" x="75" y="13" width="12" height="12"/>
                <rect fill="#000" x="5" y="67" width="28" height="28" rx="3"/>
                <rect fill="#fff" x="10" y="72" width="18" height="18" rx="2"/>
                <rect fill="#000" x="13" y="75" width="12" height="12"/>
                {/* Data modules */}
                {[38,42,46,50,54,58,62].map(x =>
                  [38,42,46,50,54,58,62].map(y =>
                    ((x + y) % 8 < 5) ? <rect key={`${x}-${y}`} fill="#000" x={x} y={y} width="3" height="3"/> : null
                  )
                )}
                {/* UPI logo */}
                <rect fill="#5f259f" x="40" y="40" width="20" height="20" rx="3"/>
                <text x="50" y="53" textAnchor="middle" fill="white" fontSize="7" fontWeight="bold">UPI</text>
              </svg>
            </div>
            {scanning && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 rounded-full bg-green-500/20 border-2 border-green-500 flex items-center justify-center animate-pulse">
                  <Check size={28} className="text-green-400" />
                </div>
              </div>
            )}
          </div>
          <p className="text-[#b3b3b3] text-sm mb-1 font-medium">
            {scanning ? "✅ Payment detected!" : "Scan with any UPI app"}
          </p>
          {!scanning && (
            <div className="flex items-center justify-center gap-1.5 mb-3">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              <p className="text-xs text-[#555]">
                Auto-confirms in <span className="text-purple-400 font-mono font-bold text-sm">{timer}s</span>
              </p>
            </div>
          )}
          <div className="flex justify-center gap-2 mt-3 flex-wrap">
            {["PhonePe", "GPay", "Paytm", "BHIM", "Cred"].map(app => (
              <span key={app} className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/8 text-xs text-[#666]">{app}</span>
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="text-[#b3b3b3] text-sm mb-2 block font-medium">Enter UPI ID</label>
            <div className="flex gap-2">
              <input
                value={upiId}
                onChange={e => { setUpiId(e.target.value); setUpiVerified(false); }}
                placeholder="yourname@upi"
                className="flex-1 bg-[#1a1a1a] border border-white/12 rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all"
              />
              <button
                onClick={verifyUpi}
                disabled={verifying || upiVerified}
                className={`px-4 py-3 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                  upiVerified
                    ? "bg-green-500/20 border border-green-500/40 text-green-400"
                    : "bg-purple-600/20 border border-purple-500/40 text-purple-300 hover:bg-purple-600/30"
                }`}
              >
                {verifying ? "..." : upiVerified ? "✓ Verified" : "Verify"}
              </button>
            </div>
            <p className="text-[#444] text-xs mt-2">Examples: 9876543210@paytm, name@okaxis, user@ybl</p>
          </div>
          {upiVerified && (
            <div className="flex items-center gap-2 p-3 rounded-xl bg-green-500/10 border border-green-500/20">
              <CheckCircle size={16} className="text-green-400" />
              <span className="text-green-300 text-sm">UPI ID verified. Click Pay to proceed.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ========================
// PROCESSING OVERLAY
// ========================
function ProcessingOverlay({ steps, currentStep, amount }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.96)" }}>
      <div className="text-center max-w-sm px-6">
        {/* Animated rings */}
        <div className="relative w-28 h-28 mx-auto mb-8">
          <div className="absolute inset-0 rounded-full border-4 border-purple-500/15" />
          <div className="absolute inset-0 rounded-full border-4 border-transparent border-t-purple-500 spin" />
          <div className="absolute inset-2 rounded-full border-4 border-transparent border-t-red-500 spin" style={{ animationDuration: "1.5s", animationDirection: "reverse" }} />
          <div className="absolute inset-4 rounded-full border-4 border-transparent border-t-yellow-400 spin" style={{ animationDuration: "2s" }} />
          <div className="absolute inset-0 flex items-center justify-center">
            <Shield size={30} className="text-purple-400" />
          </div>
        </div>

        <p className="text-2xl font-bold text-white mb-2">{steps[currentStep]}</p>
        <p className="text-[#b3b3b3] text-sm mb-8">Please do not close this window</p>

        {/* Step indicators */}
        <div className="flex justify-center gap-6 mb-8">
          {steps.map((s, i) => (
            <div key={i} className="flex flex-col items-center gap-2">
              <div className={`w-9 h-9 rounded-full border-2 flex items-center justify-center transition-all duration-500 ${
                i < currentStep  ? "bg-green-500 border-green-500 scale-110" :
                i === currentStep ? "border-purple-500 bg-purple-500/20 scale-110" :
                "border-white/15 bg-white/5"
              }`}>
                {i < currentStep ? <Check size={16} className="text-white" /> :
                 i === currentStep ? <div className="w-2.5 h-2.5 rounded-full bg-purple-400 animate-pulse" /> :
                 <div className="w-2.5 h-2.5 rounded-full bg-white/20" />}
              </div>
              <span className={`text-[10px] font-medium ${i <= currentStep ? "text-[#b3b3b3]" : "text-[#333]"}`}>
                {["Verify", "Process", "Confirm"][i]}
              </span>
            </div>
          ))}
        </div>

        <div className="text-[#444] text-xs flex items-center justify-center gap-1.5">
          <Lock size={11} />
          Secured by <span className="text-purple-400 ml-1">256-bit SSL encryption</span>
        </div>
      </div>
    </div>
  );
}

// ========================
// MAIN PAYMENT PAGE
// ========================
export default function PaymentPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { token, isHydrated, init } = useAuthStore();

  // Parse booking data from URL
  const showtimeId = searchParams.get("showtimeId");
  const title      = searchParams.get("title");
  const theater    = searchParams.get("theater");
  const date       = searchParams.get("date");
  const time       = searchParams.get("time");
  const format     = searchParams.get("format");
  const poster     = searchParams.get("poster");
  const seats      = (() => { try { return JSON.parse(decodeURIComponent(searchParams.get("seats") || "[]")); } catch { return []; } })();
  const total      = parseFloat(searchParams.get("total") || "0");

  const [method, setMethod] = useState("card");
  const [card, setCard] = useState({ number: "", name: "", expiry: "", cvv: "" });
  const [focusedField, setFocusedField] = useState(null);
  const [selectedBank, setSelectedBank] = useState(null);
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [otp, setOtp] = useState("");
  const [showOtp, setShowOtp] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [processStep, setProcessStep] = useState(0);
  const [errors, setErrors] = useState({});

  const PROCESS_STEPS = ["Verifying payment details...", "Processing transaction...", "Confirming booking..."];

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    if (!isHydrated) return;
    if (!token) router.push("/login");
  }, [isHydrated, token, router]);

  const fillDemo = () => {
    setCard(DEMO_CARD);
    toast("Demo card details filled!", { icon: "🎯" });
  };

  const formatCardNumber = v => v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
  const formatExpiry = v => {
    const digits = v.replace(/\D/g, "").slice(0, 4);
    if (digits.length >= 3) return `${digits.slice(0, 2)}/${digits.slice(2)}`;
    return digits;
  };

  const validate = () => {
    const errs = {};
    if (method === "card") {
      const digits = card.number.replace(/\D/g, "");
      if (digits.length < 12) errs.number = "Enter a valid card number (min 12 digits)";
      if (!card.name.trim()) errs.name = "Cardholder name is required";
      if (card.expiry.length < 5) errs.expiry = "Enter card expiry (MM/YY)";
      if (card.cvv.length < 3) errs.cvv = "Enter 3 or 4 digit CVV";
    } else if (method === "netbanking") {
      if (!selectedBank) errs.bank = "Please select a bank";
      if (showOtp && otp.length < 6) errs.otp = "Enter the 6-digit OTP";
    } else if (method === "wallet") {
      if (!selectedWallet) errs.wallet = "Please select a wallet";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const processPayment = useCallback(async () => {
    setProcessing(true);
    setProcessStep(0);

    await new Promise(r => setTimeout(r, 1800));
    setProcessStep(1);

    await new Promise(r => setTimeout(r, 1800));
    setProcessStep(2);

    try {
      const { data } = await bookingsAPI.create({
        showtimeId: parseInt(showtimeId),
        seats: seats.map(s => ({
          id: s.id,
          seat_number: s.seat_number,
          seat_type: s.seat_type,
        })),
        totalAmount: total.toFixed(2),
        paymentMethod: method,
      });

      await new Promise(r => setTimeout(r, 1000));
      toast.success("🎬 Payment successful! Booking confirmed.");

      // Parse seats from the DB response
      let confirmedSeats = [];
      try {
        const parsed = typeof data.seats === "string" ? JSON.parse(data.seats) : data.seats;
        confirmedSeats = Array.isArray(parsed) ? parsed.map(s => s.seat_number || s) : [];
      } catch {
        confirmedSeats = seats.map(s => s.seat_number);
      }

      const params = new URLSearchParams({
        bookingRef: data.booking_ref || "",
        movie:   data.movie_title  || title   || "",
        theater: data.theater_name || theater || "",
        date:    data.show_date    || date    || "",
        time:   (data.show_time    || time    || "").slice(0, 5),
        seats:  encodeURIComponent(JSON.stringify(confirmedSeats)),
        total:  (data.total_amount || total).toString(),
        format:  data.format       || format  || "",
        poster:  data.poster_path  || poster  || "",
        method,
      });

      router.push(`/payment/success?${params.toString()}`);
    } catch (err) {
      setProcessing(false);
      const msg = err?.response?.data?.error || err?.message || "Payment failed. Please try again.";
      toast.error(msg);
    }
  }, [showtimeId, seats, total, method, title, theater, date, time, format, poster, router]); // eslint-disable-line

  const handlePay = () => {
    if (!validate()) {
      const firstErr = Object.values(errors)[0] || "Please fill all required fields";
      toast.error(firstErr);
      return;
    }
    processPayment();
  };

  const handleNetBankingContinue = () => {
    if (!validate()) return;
    setShowOtp(true);
  };

  const METHODS = [
    { id: "card",       label: "Card",        Icon: CreditCard, desc: "Credit / Debit"  },
    { id: "upi",        label: "UPI",          Icon: Smartphone, desc: "Instant pay"      },
    { id: "netbanking", label: "Net Banking",  Icon: Building2,  desc: "All banks"        },
    { id: "wallet",     label: "Wallet",       Icon: Wallet,     desc: "Paytm & more"     },
  ];

  const subtotal = total / 1.05;
  const convenience = total - subtotal;

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      {processing && (
        <ProcessingOverlay steps={PROCESS_STEPS} currentStep={processStep} amount={total} />
      )}
      <Navbar />

      <div className="pt-20 max-w-5xl mx-auto px-4 sm:px-6 py-8">
        {/* Header */}
        <button onClick={() => router.back()} className="flex items-center gap-2 text-[#555] hover:text-white mb-6 transition-colors text-sm group">
          <ArrowLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
          Back to Seats
        </button>

        {/* Step indicator */}
        <div className="flex items-center gap-2 mb-8">
          {[["1", "Select Seats"], ["2", "Payment"], ["3", "Confirmed"]].map(([num, label], i) => (
            <div key={num} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                i === 0 ? "bg-green-600 text-white" : i === 1 ? "bg-purple-600 text-white" : "bg-[#1a1a1a] text-[#444]"
              }`}>
                {i === 0 ? <Check size={14} /> : num}
              </div>
              <span className={`text-sm hidden sm:block ${i === 1 ? "text-white font-semibold" : i === 0 ? "text-green-400" : "text-[#444]"}`}>
                {label}
              </span>
              {i < 2 && <ChevronRight size={14} className="text-[#333]" />}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-purple-600/20 border border-purple-500/30 flex items-center justify-center">
            <Lock size={18} className="text-purple-400" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Secure Payment</h1>
            <p className="text-[#555] text-sm flex items-center gap-1.5">
              <Shield size={12} className="text-green-500" /> 256-bit SSL Encrypted
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* === LEFT: Payment Form === */}
          <div className="lg:col-span-2 space-y-4">
            {/* Method selector */}
            <div className="grid grid-cols-4 gap-2">
              {METHODS.map(({ id, label, Icon, desc }) => (
                <button
                  key={id}
                  onClick={() => { setMethod(id); setShowOtp(false); setErrors({}); }}
                  className={`flex flex-col items-center gap-1.5 py-4 px-2 rounded-xl border transition-all ${
                    method === id
                      ? "border-purple-500/60 bg-purple-500/10 text-white shadow-lg shadow-purple-500/10"
                      : "border-white/8 bg-[#111] text-[#666] hover:border-white/20 hover:text-[#b3b3b3]"
                  }`}
                >
                  <Icon size={22} />
                  <span className="text-xs font-semibold">{label}</span>
                  <span className="text-[9px] opacity-60 hidden sm:block">{desc}</span>
                </button>
              ))}
            </div>

            {/* === CARD === */}
            {method === "card" && (
              <div className="glass rounded-2xl p-6 glow-border fade-in">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-white flex items-center gap-2">
                    <CreditCard size={16} className="text-purple-400" /> Credit / Debit Card
                  </h3>
                  <button
                    onClick={fillDemo}
                    className="text-xs text-purple-400 border border-purple-500/30 px-3 py-1 rounded-lg hover:bg-purple-500/10 transition-all flex items-center gap-1"
                  >
                    <Zap size={11} /> Use Demo
                  </button>
                </div>

                <AnimatedCard
                  number={card.number}
                  name={card.name}
                  expiry={card.expiry}
                  cvv={card.cvv}
                  focused={focusedField}
                />

                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-[#b3b3b3] mb-1.5 block font-medium">Card Number</label>
                    <input
                      value={formatCardNumber(card.number)}
                      onChange={e => { setCard(c => ({ ...c, number: e.target.value })); setErrors(p => ({ ...p, number: undefined })); }}
                      onFocus={() => setFocusedField("number")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="1234 5678 9012 3456"
                      maxLength={19}
                      className={`w-full bg-[#1a1a1a] border rounded-xl px-4 py-3.5 text-white font-mono text-sm outline-none transition-all ${
                        errors.number ? "border-red-500" : "border-white/12 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                      }`}
                    />
                    {errors.number && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle size={11}/> {errors.number}</p>}
                  </div>

                  <div>
                    <label className="text-sm text-[#b3b3b3] mb-1.5 block font-medium">Cardholder Name</label>
                    <input
                      value={card.name}
                      onChange={e => { setCard(c => ({ ...c, name: e.target.value.toUpperCase() })); setErrors(p => ({ ...p, name: undefined })); }}
                      onFocus={() => setFocusedField("name")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="AS ON CARD"
                      className={`w-full bg-[#1a1a1a] border rounded-xl px-4 py-3.5 text-white uppercase tracking-wider text-sm outline-none transition-all ${
                        errors.name ? "border-red-500" : "border-white/12 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                      }`}
                    />
                    {errors.name && <p className="text-red-400 text-xs mt-1 flex items-center gap-1"><AlertCircle size={11}/> {errors.name}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm text-[#b3b3b3] mb-1.5 block font-medium">Expiry Date</label>
                      <input
                        value={formatExpiry(card.expiry)}
                        onChange={e => { setCard(c => ({ ...c, expiry: e.target.value })); setErrors(p => ({ ...p, expiry: undefined })); }}
                        onFocus={() => setFocusedField("expiry")}
                        onBlur={() => setFocusedField(null)}
                        placeholder="MM/YY"
                        maxLength={5}
                        className={`w-full bg-[#1a1a1a] border rounded-xl px-4 py-3.5 text-white font-mono text-sm outline-none transition-all ${
                          errors.expiry ? "border-red-500" : "border-white/12 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                        }`}
                      />
                      {errors.expiry && <p className="text-red-400 text-xs mt-1"><AlertCircle size={11} className="inline mr-0.5"/> {errors.expiry}</p>}
                    </div>
                    <div>
                      <label className="text-sm text-[#b3b3b3] mb-1.5 block font-medium">CVV</label>
                      <input
                        value={card.cvv}
                        onChange={e => { setCard(c => ({ ...c, cvv: e.target.value.replace(/\D/g, "").slice(0, 4) })); setErrors(p => ({ ...p, cvv: undefined })); }}
                        onFocus={() => setFocusedField("cvv")}
                        onBlur={() => setFocusedField(null)}
                        placeholder="•••"
                        type="password"
                        maxLength={4}
                        className={`w-full bg-[#1a1a1a] border rounded-xl px-4 py-3.5 text-white font-mono text-sm outline-none transition-all ${
                          errors.cvv ? "border-red-500" : "border-white/12 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20"
                        }`}
                      />
                      {errors.cvv && <p className="text-red-400 text-xs mt-1"><AlertCircle size={11} className="inline mr-0.5"/> {errors.cvv}</p>}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 p-3 rounded-xl bg-white/3 border border-white/5">
                    <Lock size={12} className="text-green-500 flex-none" />
                    <span className="text-[#555] text-xs">Your card details are encrypted and never stored on our servers</span>
                  </div>
                </div>
              </div>
            )}

            {/* === UPI === */}
            {method === "upi" && (
              <div className="glass rounded-2xl p-6 glow-border fade-in">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <Smartphone size={16} className="text-purple-400" /> Pay via UPI
                </h3>
                <UPISection onSuccess={processPayment} />
              </div>
            )}

            {/* === NET BANKING === */}
            {method === "netbanking" && (
              <div className="glass rounded-2xl p-6 glow-border fade-in">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <Building2 size={16} className="text-purple-400" />
                  {showOtp ? "Enter OTP" : "Select Your Bank"}
                </h3>

                {!showOtp ? (
                  <div>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {BANKS.map(bank => (
                        <button
                          key={bank.id}
                          onClick={() => { setSelectedBank(bank.id); setErrors({}); }}
                          className={`p-3 rounded-xl border text-center transition-all ${
                            selectedBank === bank.id
                              ? "border-purple-500/60 bg-purple-500/10 shadow-md shadow-purple-500/10"
                              : "border-white/8 bg-[#1a1a1a] hover:border-white/20"
                          }`}
                        >
                          <div
                            className="w-9 h-9 rounded-xl mx-auto mb-1.5 flex items-center justify-center text-white text-[10px] font-bold"
                            style={{ background: bank.color }}
                          >
                            {bank.abbr}
                          </div>
                          <p className="text-[#b3b3b3] text-[9px] line-clamp-1">{bank.name.split(" ")[0]}</p>
                        </button>
                      ))}
                    </div>
                    {errors.bank && (
                      <p className="text-red-400 text-xs mt-2 flex items-center gap-1"><AlertCircle size={11}/> {errors.bank}</p>
                    )}
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-white/5 border border-white/8">
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center text-white text-xs font-bold flex-none"
                        style={{ background: BANKS.find(b => b.id === selectedBank)?.color }}
                      >
                        {BANKS.find(b => b.id === selectedBank)?.abbr}
                      </div>
                      <div>
                        <p className="text-white text-sm font-semibold">{BANKS.find(b => b.id === selectedBank)?.name}</p>
                        <p className="text-[#555] text-xs">Net Banking</p>
                      </div>
                      <button onClick={() => setShowOtp(false)} className="ml-auto text-[#555] hover:text-white text-xs border border-white/8 px-2 py-1 rounded-lg transition-all">
                        Change
                      </button>
                    </div>

                    <div>
                      <label className="text-sm text-[#b3b3b3] mb-3 block font-medium">
                        Enter OTP sent to your registered mobile
                      </label>
                      <OtpInput value={otp} onChange={setOtp} />
                      {errors.otp && (
                        <p className="text-red-400 text-xs mt-2 text-center flex items-center justify-center gap-1">
                          <AlertCircle size={11}/> {errors.otp}
                        </p>
                      )}
                      <p className="text-center text-[#444] text-xs mt-3">
                        Demo OTP: <span className="text-purple-400 font-mono font-bold text-sm">123456</span>
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* === WALLET === */}
            {method === "wallet" && (
              <div className="glass rounded-2xl p-6 glow-border fade-in">
                <h3 className="font-semibold text-white mb-4 flex items-center gap-2">
                  <Wallet size={16} className="text-purple-400" /> Choose Wallet
                </h3>
                <div className="space-y-2">
                  {WALLETS.map(wallet => (
                    <button
                      key={wallet.id}
                      onClick={() => { setSelectedWallet(wallet.id); setErrors({}); }}
                      className={`w-full flex items-center gap-4 p-4 rounded-xl border transition-all ${
                        selectedWallet === wallet.id
                          ? "border-purple-500/60 bg-purple-500/10 shadow-md shadow-purple-500/10"
                          : "border-white/8 bg-[#1a1a1a] hover:border-white/20"
                      }`}
                    >
                      <div
                        className="w-11 h-11 rounded-xl flex items-center justify-center text-white font-bold text-lg flex-none"
                        style={{ background: wallet.color }}
                      >
                        {wallet.icon}
                      </div>
                      <div className="text-left flex-1">
                        <p className="text-white text-sm font-semibold">{wallet.name}</p>
                        <p className="text-[#555] text-xs mt-0.5">Balance: <span className="text-green-400 font-mono">{wallet.balance}</span></p>
                      </div>
                      <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all ${
                        selectedWallet === wallet.id ? "border-purple-500 bg-purple-500" : "border-white/20"
                      }`}>
                        {selectedWallet === wallet.id && <Check size={12} className="text-white" />}
                      </div>
                    </button>
                  ))}
                  {errors.wallet && (
                    <p className="text-red-400 text-xs flex items-center gap-1"><AlertCircle size={11}/> {errors.wallet}</p>
                  )}
                </div>
              </div>
            )}

            {/* Offers banner */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-green-500/5 border border-green-500/15 text-sm">
              <Tag size={15} className="text-green-500 flex-none" />
              <span className="text-green-300 font-medium">5% cashback on HDFC cards · No-cost EMI available</span>
            </div>
          </div>

          {/* === RIGHT: Order Summary === */}
          <div>
            <div className="glass rounded-2xl p-5 glow-border sticky top-24 space-y-4">
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Film size={16} className="text-red-500" /> Order Summary
              </h3>

              {/* Movie info */}
              {title && (
                <div className="flex items-start gap-3 p-3 rounded-xl bg-white/3 border border-white/5">
                  {poster ? (
                    <img
                      src={`https://image.tmdb.org/t/p/w92${poster}`}
                      alt={title}
                      className="w-10 h-14 object-cover rounded-lg flex-none border border-white/10"
                    />
                  ) : (
                    <div className="w-10 h-14 rounded-lg bg-white/5 flex items-center justify-center flex-none">
                      <Film size={16} className="text-[#444]" />
                    </div>
                  )}
                  <div className="min-w-0">
                    <p className="text-white text-sm font-bold line-clamp-2 leading-tight mb-1">{title}</p>
                    {format && <span className="badge badge-purple text-[9px]">{format}</span>}
                  </div>
                </div>
              )}

              <div className="space-y-2 text-sm">
                {[
                  [<MapPin size={11} className="text-red-500" />, "Theater", theater],
                  [<Calendar size={11} className="text-purple-400" />, "Date", date],
                  [<Clock size={11} className="text-yellow-400" />, "Time", time?.slice(0, 5)],
                ].map(([icon, label, val]) => val && (
                  <div key={label} className="flex justify-between items-start gap-2">
                    <span className="text-[#555] flex items-center gap-1 flex-none">{icon} {label}</span>
                    <span className="text-[#b3b3b3] text-right text-xs line-clamp-1">{val}</span>
                  </div>
                ))}
                <div className="flex justify-between items-start gap-2">
                  <span className="text-[#555] text-sm">Seats ({seats.length})</span>
                  <span className="text-[#b3b3b3] text-xs text-right font-mono">{seats.map(s => s.seat_number).join(", ")}</span>
                </div>
              </div>

              <div className="border-t border-white/8 pt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-[#666]">Subtotal</span>
                  <span className="text-white font-mono">₹{subtotal.toFixed(0)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#666]">Convenience Fee</span>
                  <span className="text-white font-mono">₹{convenience.toFixed(0)}</span>
                </div>
                <div className="flex justify-between font-bold text-base pt-1.5 border-t border-white/8">
                  <span className="text-white">Total</span>
                  <span className="text-purple-300 font-mono">₹{total.toFixed(0)}</span>
                </div>
              </div>

              {/* Pay button */}
              {method !== "upi" && (
                <button
                  onClick={method === "netbanking" && !showOtp ? handleNetBankingContinue : handlePay}
                  className="w-full btn-red py-4 justify-center font-bold text-base rounded-xl"
                >
                  {method === "netbanking" && !showOtp ? (
                    <><Building2 size={16} /> Continue to Bank</>
                  ) : (
                    <><Lock size={15} /> Pay ₹{total.toFixed(0)}</>
                  )}
                </button>
              )}

              {method === "upi" && (
                <div className="text-center">
                  <p className="text-xs text-[#555] mb-2">Payment will auto-confirm after scan</p>
                  <button onClick={processPayment} className="w-full btn-primary py-3.5 justify-center font-semibold text-sm rounded-xl">
                    <Zap size={14} /> Pay via UPI ID
                  </button>
                </div>
              )}

              <div className="flex items-center justify-center gap-2 text-[#333] text-xs">
                <Shield size={11} />
                <span>100% Secure · Powered by CineBook Pay</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
