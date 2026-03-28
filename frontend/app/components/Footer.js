"use client";
import Link from "next/link";
import { Film, Twitter, Instagram, Youtube, Facebook } from "lucide-react";

export default function Footer() {
  const links = {
    Company: ["About Us", "Careers", "Press", "Blog"],
    Help: ["FAQ", "Contact Us", "Terms of Use", "Privacy Policy"],
    Explore: ["Movies", "Now Playing", "Coming Soon", "Top Rated"],
    Languages: ["English", "Hindi", "Tamil", "Telugu"],
  };

  return (
    <footer className="bg-[#0d0d0d] border-t border-white/5 mt-16">
      <div className="max-w-screen-xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <Film size={20} className="text-red-600" />
              <span
                style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.15em", fontSize: "1.3rem" }}
                className="text-white"
              >
                CINEBOOK
              </span>
            </Link>
            <p className="text-[#555] text-xs leading-relaxed mb-4">
              Your ultimate destination for movie tickets. Book anytime, anywhere.
            </p>
            <div className="flex gap-3">
              {[Twitter, Instagram, Youtube, Facebook].map((Icon, i) => (
                <button
                  key={i}
                  className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-[#666] hover:text-white hover:border-white/25 transition-all"
                >
                  <Icon size={14} />
                </button>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(links).map(([section, items]) => (
            <div key={section}>
              <h4 className="text-xs font-semibold text-white mb-3 uppercase tracking-wider">{section}</h4>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item}>
                    <a href="#" className="text-xs text-[#555] hover:text-[#b3b3b3] transition-colors">
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-[#444] text-xs">© 2025 CineBook. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <a href="#" className="text-[#444] text-xs hover:text-[#666] transition-colors">Terms</a>
            <a href="#" className="text-[#444] text-xs hover:text-[#666] transition-colors">Privacy</a>
            <a href="#" className="text-[#444] text-xs hover:text-[#666] transition-colors">Cookies</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
