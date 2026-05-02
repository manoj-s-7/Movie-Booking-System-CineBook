"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, Film, ArrowRight, AlertCircle } from "lucide-react";
import useAuthStore from "../hooks/useAuthStore";
import toast from "react-hot-toast";

// Static movie posters for backdrop mosaic (hard-coded TMDB IDs)
const BACKDROP_POSTERS = [
  "/1E5baAaEse26fej7uHcjOgEE2t2.jpg",
  "/rktDFPbfHfUbArZ6OOOKsXcv0Bm.jpg",
  "/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg",
  "/kDp1vUBnMpe8ak4rjgl3cLELqjU.jpg",
  "/fiVW06jE7z9YnO4trhaMEdclSiC.jpg",
  "/sv1xJUazXeYqALzczSZ3O6nkH75.jpg",
  "/9Gtg2DzBhmYamXBS1hKAhiwbBKS.jpg",
  "/ngl2FKBlU4fhbdsrtdom9LVLBXw.jpg",
  "/dqK9Hag1054tghRQSqLSfrkvMZA.jpg",
  "/vZloFAK7NmvMGKE7VkF5UHaz0I.jpg",
  "/w3LxiVYdWWRvEVdn5RYq6jIqkb1.jpg",
  "/6KErczPBROKMWj5INUnpm7ewFFU.jpg",
  "/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg",
  "/kDp1vUBnMpe8ak4rjgl3cLELqjU.jpg",
  "/fiVW06jE7z9YnO4trhaMEdclSiC.jpg",
  "/sv1xJUazXeYqALzczSZ3O6nkH75.jpg",
  "/9Gtg2DzBhmYamXBS1hKAhiwbBKS.jpg",
  "/ngl2FKBlU4fhbdsrtdom9LVLBXw.jpg",
  "/dqK9Hag1054tghRQSqLSfrkvMZA.jpg",
  "/vZloFAK7NmvMGKE7VkF5UHaz0I.jpg",
  "/w3LxiVYdWWRvEVdn5RYq6jIqkb1.jpg",
];

const TMDB_IMG_BASE = "https://image.tmdb.org/t/p/w342";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const { login, isLoading, init, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    init();
    if (isAuthenticated()) router.replace("/movies");
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!email.trim()) { setError("Please enter your email"); return; }
    if (!password) { setError("Please enter your password"); return; }

    const result = await login(email.trim(), password);
    if (result.success) {
      toast.success("Welcome back! 🎬");
      setTimeout(() => router.push("/movies"), 600);
    } else {
      setError(result.error || "Login failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col">
      {/* === Netflix-style Mosaic Backdrop === */}
      <div className="netflix-backdrop">
        <div className="netflix-backdrop-grid">
          {[...Array(3)].map((_, colSet) =>
            BACKDROP_POSTERS.map((poster, i) => (
              <div
                key={`${colSet}-${i}`}
                className="relative overflow-hidden rounded-sm"
                style={{ height: "180px" }}
              >
                <img
                  src={`${TMDB_IMG_BASE}${poster}`}
                  alt=""
                  className="w-full h-full object-cover"
                  style={{ filter: "brightness(0.85)" }}
                />
              </div>
            ))
          )}
        </div>
      </div>

      {/* Top bar */}
      <div className="relative z-10 px-8 py-5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Film size={24} className="text-red-600" />
          <span
            style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.18em", fontSize: "1.6rem" }}
            className="text-white"
          >
            CINEBOOK
          </span>
        </Link>
        <Link
          href="/register"
          className="text-sm text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded transition-colors border border-[rgba(139,92,246,0.22)]"
        >
          Sign Up
        </Link>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-1 items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm">
          {/* Card */}
          <div
            className="rounded-2xl p-8 shadow-2xl"
            style={{
              background: "rgba(0,0,0,0.82)",
              border: "1px solid rgba(255,255,255,0.08)",
              backdropFilter: "blur(20px)",
            }}
          >
            <h1 className="text-3xl font-bold text-white mb-1">Sign In</h1>
            <p className="text-[#b3b3b3] text-sm mb-6">Sign in to your CineBook account</p>

            {/* Error */}
            {error && (
              <div className="flex items-start gap-2.5 bg-red-950/60 border border-red-500/30 rounded-lg p-3 mb-5">
                <AlertCircle size={15} className="text-red-400 flex-none mt-0.5" />
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Email */}
              <div>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#555]" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => { setEmail(e.target.value); setError(""); }}
                    placeholder="Email or mobile number"
                    autoComplete="email"
                    className="input"
                    style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#555]" />
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(""); }}
                    placeholder="Password"
                    autoComplete="current-password"
                    className="input pr-11"
                    style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#666] hover:text-[#b3b3b3]"
                  >
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full btn-red py-3.5 justify-center text-base rounded mt-2 disabled:opacity-50"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-[rgba(255,255,255,0.30)] border-t-white rounded-full spin" />
                ) : (
                  <><span>Sign In</span><ArrowRight size={17} /></>
                )}
              </button>
            </form>

            {/* Divider */}
            <div className="flex items-center gap-3 my-5">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-[#555] text-xs">OR</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            {/* Use sign-in code (decorative) */}
            <button className="w-full py-3 rounded border border-[rgba(139,92,246,0.22)] text-[#b3b3b3] hover:border-[rgba(255,255,255,0.30)] hover:text-white text-sm transition-colors">
              Use a sign‑in code
            </button>

            <div className="mt-4 flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-3.5 h-3.5 accent-red-600" />
                <span className="text-[#b3b3b3] text-xs">Remember me</span>
              </label>
              <a href="#" className="text-[#b3b3b3] text-xs hover:underline">Forgot Password?</a>
            </div>

            <div className="mt-6 text-center">
              <p className="text-[#737373] text-sm">
                New to CineBook?{" "}
                <Link href="/register" className="text-white hover:underline font-semibold">
                  Sign up now
                </Link>
              </p>
            </div>

            <p className="text-[#444] text-[10px] text-center mt-4 leading-relaxed">
              This page is protected by Google reCAPTCHA to ensure you're not a bot.{" "}
              <a href="#" className="text-blue-500 hover:underline">Learn more</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
