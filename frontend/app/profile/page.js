"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import useAuthStore from "../hooks/useAuthStore";
import { User, Mail, Calendar, LogOut, Ticket, Film } from "lucide-react";
import { bookingsAPI } from "../lib/api";

export default function ProfilePage() {
  const { user, logout, init, isAuthenticated } = useAuthStore();
  const router = useRouter();
  const [stats, setStats] = useState({ total: 0, confirmed: 0, cancelled: 0, spent: 0 });

  useEffect(() => {
    init();
    if (!isAuthenticated()) { router.replace("/login"); return; }
    bookingsAPI.myBookings().then(({ data }) => {
      const confirmed = data.filter((b) => b.status === "confirmed");
      const cancelled = data.filter((b) => b.status === "cancelled");
      const spent = confirmed.reduce((s, b) => s + parseFloat(b.total_amount), 0);
      setStats({ total: data.length, confirmed: confirmed.length, cancelled: cancelled.length, spent });
    }).catch(() => {});
  }, []);

  const handleLogout = () => { logout(); router.push("/"); };

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="pt-24 max-w-2xl mx-auto px-4 sm:px-6 py-8">
        {/* Avatar */}
        <div className="flex items-center gap-5 mb-8">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-violet-600 to-purple-500 flex items-center justify-center text-3xl font-bold text-white shadow-xl shadow-violet-500/30">
            {user?.name?.[0]?.toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">{user?.name}</h1>
            <p className="text-slate-500">{user?.email}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Bookings", value: stats.total, icon: Ticket, color: "text-violet-400" },
            { label: "Confirmed", value: stats.confirmed, icon: Film, color: "text-green-400" },
            { label: "Cancelled", value: stats.cancelled, icon: Film, color: "text-red-400" },
            { label: "Total Spent", value: `₹${stats.spent.toFixed(0)}`, icon: Film, color: "text-orange-400" },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="glass rounded-xl p-4 glow-border text-center">
              <Icon size={20} className={`${color} mx-auto mb-2`} />
              <p className="text-xl font-bold text-white">{value}</p>
              <p className="text-xs text-slate-500">{label}</p>
            </div>
          ))}
        </div>

        {/* Account info */}
        <div className="glass rounded-2xl p-6 glow-border mb-4">
          <h2 className="font-semibold text-white mb-4">Account Details</h2>
          {[
            { icon: User, label: "Full Name", value: user?.name },
            { icon: Mail, label: "Email", value: user?.email },
            { icon: Calendar, label: "Member Since", value: user?.created_at ? new Date(user.created_at).toLocaleDateString("en-IN", { month: "long", year: "numeric" }) : "-" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="flex items-center gap-4 py-3 border-b border-violet-500/10 last:border-0">
              <Icon size={16} className="text-slate-500" />
              <div>
                <p className="text-xs text-slate-500">{label}</p>
                <p className="text-sm text-slate-200">{value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-3">
          <button onClick={() => router.push("/bookings")} className="flex-1 glass py-3 rounded-xl text-slate-300 hover:text-white transition-colors flex items-center justify-center gap-2">
            <Ticket size={16} /> My Bookings
          </button>
          <button onClick={handleLogout} className="flex-1 py-3 rounded-xl text-red-400 hover:text-red-300 border border-red-500/20 hover:border-red-400/40 transition-all flex items-center justify-center gap-2">
            <LogOut size={16} /> Logout
          </button>
        </div>
      </div>
      <Footer />
    </div>
  );
}
