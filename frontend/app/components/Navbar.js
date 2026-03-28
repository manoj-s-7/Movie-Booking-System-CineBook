"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { Search, Menu, X, Film, User, LogOut, Ticket, ChevronDown, Bell } from "lucide-react";
import useAuthStore from "../hooks/useAuthStore";
import toast from "react-hot-toast";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { user, logout, init, isAuthenticated } = useAuthStore();
  const searchRef = useRef(null);
  const userMenuRef = useRef(null);

  useEffect(() => {
    init();
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/movies?search=${encodeURIComponent(searchQuery)}`);
      setSearchOpen(false);
      setSearchQuery("");
    }
  };

  const handleLogout = () => {
    logout();
    toast.success("Signed out successfully");
    router.push("/");
    setUserMenuOpen(false);
  };

  const navLinks = [
    ["Home", "/"],
    ["Movies", "/movies"],
    ["Now Playing", "/movies?filter=now_playing"],
    ["Coming Soon", "/movies?filter=upcoming"],
  ];

  const navBg = scrolled
    ? "bg-black/95 backdrop-blur-xl shadow-2xl shadow-black/50"
    : "bg-gradient-to-b from-black/80 via-black/30 to-transparent";

  return (
    <nav className={`fixed top-0 w-full z-50 transition-all duration-300 ${navBg}`}>
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1.5 flex-none group">
            <Film size={22} className="text-red-600 group-hover:scale-110 transition-transform" />
            <span
              style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.18em", fontSize: "1.5rem" }}
              className="text-white"
            >
              CINEBOOK
            </span>
          </Link>

          {/* Desktop Nav links */}
          <div className="hidden lg:flex items-center gap-1 ml-10">
            {navLinks.map(([label, href]) => (
              <Link
                key={label}
                href={href}
                className={`px-3 py-1.5 text-sm font-medium rounded transition-colors ${
                  pathname === href
                    ? "text-white bg-white/10"
                    : "text-[#b3b3b3] hover:text-white hover:bg-white/5"
                }`}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Right */}
          <div className="flex items-center gap-1 ml-auto">
            {/* Search */}
            <div className="relative flex items-center">
              {searchOpen ? (
                <form onSubmit={handleSearch} className="flex items-center">
                  <div className="flex items-center bg-black/90 border border-white/20 rounded overflow-hidden">
                    <Search size={15} className="ml-3 text-[#b3b3b3] flex-none" />
                    <input
                      ref={searchRef}
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Movies, genres..."
                      className="bg-transparent px-3 py-2 text-sm text-white placeholder-[#555] outline-none w-52"
                      onBlur={() => { if (!searchQuery) setSearchOpen(false); }}
                    />
                    {searchQuery && (
                      <button type="button" onClick={() => setSearchQuery("")} className="mr-2 text-[#555] hover:text-white">
                        <X size={13} />
                      </button>
                    )}
                  </div>
                </form>
              ) : (
                <button
                  onClick={() => setSearchOpen(true)}
                  className="w-9 h-9 flex items-center justify-center text-[#b3b3b3] hover:text-white transition-colors rounded hover:bg-white/5"
                >
                  <Search size={18} />
                </button>
              )}
            </div>

            {isAuthenticated() ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 py-1 px-2 rounded-lg hover:bg-white/8 transition-colors"
                >
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-sm font-bold text-white shadow-lg shadow-red-900/30">
                    {user?.name?.[0]?.toUpperCase()}
                  </div>
                  <ChevronDown
                    size={13}
                    className={`text-[#b3b3b3] transition-transform hidden sm:block ${userMenuOpen ? "rotate-180" : ""}`}
                  />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-60 bg-[#141414] border border-white/10 rounded-xl overflow-hidden shadow-2xl shadow-black/80 fade-up">
                    <div className="px-4 py-3.5 border-b border-white/8 bg-gradient-to-r from-red-950/30 to-transparent">
                      <p className="text-sm font-semibold text-white">{user?.name}</p>
                      <p className="text-xs text-[#666] truncate mt-0.5">{user?.email}</p>
                    </div>
                    {[
                      ["/profile", User, "My Account"],
                      ["/bookings", Ticket, "My Bookings"],
                    ].map(([href, Icon, label]) => (
                      <Link
                        key={href}
                        href={href}
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-3 px-4 py-3 text-sm text-[#b3b3b3] hover:text-white hover:bg-white/5 transition-colors"
                      >
                        <Icon size={15} />
                        {label}
                      </Link>
                    ))}
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/8 border-t border-white/8 transition-colors"
                    >
                      <LogOut size={15} /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link href="/login" className="text-sm text-[#b3b3b3] hover:text-white px-3 py-1.5 transition-colors rounded hover:bg-white/5">
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="btn-red text-sm py-1.5 px-4 rounded"
                  style={{ padding: "0.5rem 1rem", fontSize: "0.85rem" }}
                >
                  Join Free
                </Link>
              </div>
            )}

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="lg:hidden w-9 h-9 flex items-center justify-center text-white ml-1"
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="lg:hidden bg-black/95 rounded-xl mb-3 p-4 border border-white/8 fade-up backdrop-blur-xl">
            {navLinks.map(([label, href]) => (
              <Link
                key={label}
                href={href}
                onClick={() => setMenuOpen(false)}
                className={`block py-3 text-sm border-b border-white/5 last:border-0 transition-colors ${
                  pathname === href ? "text-white font-semibold" : "text-[#b3b3b3] hover:text-white"
                }`}
              >
                {label}
              </Link>
            ))}
            {!isAuthenticated() && (
              <div className="flex gap-2 mt-3 pt-3 border-t border-white/8">
                <Link href="/login" className="flex-1 text-center py-2 text-sm text-[#b3b3b3] border border-white/15 rounded-lg">Sign In</Link>
                <Link href="/register" className="flex-1 text-center py-2 text-sm text-white bg-red-600 rounded-lg font-semibold">Join Free</Link>
              </div>
            )}
          </div>
        )}
      </div>
    </nav>
  );
}
