"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, User, Film, ArrowRight, AlertCircle, CheckCircle } from "lucide-react";
import useAuthStore from "../hooks/useAuthStore";
import toast from "react-hot-toast";

const BACKDROP_POSTERS = [
  "/1E5baAaEse26fej7uHcjOgEE2t2.jpg","/rktDFPbfHfUbArZ6OOOKsXcv0Bm.jpg","/8cdWjvZQUExUUTzyp4t6EDMubfO.jpg",
  "/kDp1vUBnMpe8ak4rjgl3cLELqjU.jpg","/fiVW06jE7z9YnO4trhaMEdclSiC.jpg","/sv1xJUazXeYqALzczSZ3O6nkH75.jpg",
  "/9Gtg2DzBhmYamXBS1hKAhiwbBKS.jpg","/ngl2FKBlU4fhbdsrtdom9LVLBXw.jpg","/dqK9Hag1054tghRQSqLSfrkvMZA.jpg",
  "/vZloFAK7NmvMGKE7VkF5UHaz0I.jpg","/w3LxiVYdWWRvEVdn5RYq6jIqkb1.jpg","/6KErczPBROKMWj5INUnpm7ewFFU.jpg",
  "/1pdfLvkbY9ohJlCjQH2CZjjYVvJ.jpg","/kDp1vUBnMpe8ak4rjgl3cLELqjU.jpg","/fiVW06jE7z9YnO4trhaMEdclSiC.jpg",
  "/sv1xJUazXeYqALzczSZ3O6nkH75.jpg","/9Gtg2DzBhmYamXBS1hKAhiwbBKS.jpg","/ngl2FKBlU4fhbdsrtdom9LVLBXw.jpg",
];
const TMDB_IMG_BASE = "https://image.tmdb.org/t/p/w342";

export default function RegisterPage() {
  const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const { register, isLoading, init, isAuthenticated } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    init();
    if (isAuthenticated()) router.replace("/movies");
  }, []);

  const set = (k, v) => { setForm(f => ({ ...f, [k]: v })); setError(""); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    if (!form.name.trim()) { setError("Please enter your name"); return; }
    if (!form.email.trim()) { setError("Please enter your email"); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters"); return; }
    if (form.password !== form.confirm) { setError("Passwords don't match"); return; }
    const result = await register(form.name.trim(), form.email.trim(), form.password);
    if (result.success) {
      toast.success("Account created! Welcome 🎬");
      router.push("/movies");
    } else {
      setError(result.error || "Registration failed");
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col">
      <div className="netflix-backdrop">
        <div className="netflix-backdrop-grid">
          {[...Array(3)].map((_, s) =>
            BACKDROP_POSTERS.map((p, i) => (
              <div key={`${s}-${i}`} className="relative overflow-hidden rounded-sm" style={{ height: "180px" }}>
                <img src={`${TMDB_IMG_BASE}${p}`} alt="" className="w-full h-full object-cover" style={{ filter: "brightness(0.85)" }} />
              </div>
            ))
          )}
        </div>
      </div>

      <div className="relative z-10 px-8 py-5 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Film size={24} className="text-red-600" />
          <span style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.18em", fontSize: "1.6rem" }} className="text-white">CINEBOOK</span>
        </Link>
        <Link href="/login" className="text-sm text-white bg-white/10 hover:bg-white/20 px-4 py-2 rounded transition-colors border border-white/15">
          Sign In
        </Link>
      </div>

      <div className="relative z-10 flex flex-1 items-center justify-center px-4 py-8">
        <div className="w-full max-w-sm">
          <div className="rounded-2xl p-8 shadow-2xl" style={{ background: "rgba(0,0,0,0.82)", border: "1px solid rgba(255,255,255,0.08)", backdropFilter: "blur(20px)" }}>
            <h1 className="text-3xl font-bold text-white mb-1">Create Account</h1>
            <p className="text-[#b3b3b3] text-sm mb-6">Join millions booking their favourite movies</p>

            {error && (
              <div className="flex items-start gap-2.5 bg-red-950/60 border border-red-500/30 rounded-lg p-3 mb-5">
                <AlertCircle size={15} className="text-red-400 flex-none mt-0.5" />
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div className="relative">
                <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#555]" />
                <input type="text" value={form.name} onChange={e => set("name", e.target.value)}
                  placeholder="Full name" autoComplete="name" className="input"
                  style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }} />
              </div>

              {/* Email */}
              <div className="relative">
                <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#555]" />
                <input type="email" value={form.email} onChange={e => set("email", e.target.value)}
                  placeholder="Email address" autoComplete="email" className="input"
                  style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }} />
              </div>

              {/* Password */}
              <div>
                <div className="relative">
                  <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#555]" />
                  <input type={showPass ? "text" : "password"} value={form.password}
                    onChange={e => set("password", e.target.value)} placeholder="Password (min 6 chars)"
                    autoComplete="new-password" className="input pr-11"
                    style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }} />
                  <button type="button" onClick={() => setShowPass(!showPass)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#666] hover:text-[#b3b3b3]">
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                {form.password.length > 0 && (
                  <div className="flex gap-1 mt-1.5">
                    {[1,2,3,4].map(n => (
                      <div key={n} className={`h-1 flex-1 rounded-full transition-colors ${form.password.length >= n * 3 ? n <= 2 ? "bg-red-500" : n === 3 ? "bg-yellow-500" : "bg-green-500" : "bg-white/10"}`} />
                    ))}
                  </div>
                )}
              </div>

              {/* Confirm Password */}
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#555]" />
                <input type="password" value={form.confirm} onChange={e => set("confirm", e.target.value)}
                  placeholder="Confirm password" autoComplete="new-password" className="input"
                  style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }} />
                {form.confirm && (
                  <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
                    {form.confirm === form.password ? <CheckCircle size={15} className="text-green-500" /> : <AlertCircle size={15} className="text-red-500" />}
                  </div>
                )}
              </div>

              <button type="submit" disabled={isLoading}
                className="w-full btn-red py-3.5 justify-center text-base rounded mt-1 disabled:opacity-50">
                {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full spin" />
                  : <><span>Create Account</span><ArrowRight size={17} /></>}
              </button>
            </form>

            <div className="mt-6 text-center">
              <p className="text-[#737373] text-sm">
                Already have an account?{" "}
                <Link href="/login" className="text-white hover:underline font-semibold">Sign in</Link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
