import "./globals.css";
import { Toaster } from "react-hot-toast";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "CineBook — Book Movie Tickets",
  description: "The ultimate cinema booking experience. Netflix-inspired design.",
  keywords: "movie tickets, book cinema, CineBook, now playing, upcoming movies",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.className}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800&display=swap" rel="stylesheet" />
      </head>
      <body style={{ background: "#0a0a0a", fontFamily: "'DM Sans', sans-serif" }}>
        <div className="page-transition-wrapper">
          {children}
        </div>
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: "#1a1a1a",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "12px",
              fontSize: "14px",
              fontFamily: "'DM Sans', sans-serif",
              padding: "14px 18px",
              boxShadow: "0 8px 32px rgba(0,0,0,0.5)",
            },
            success: {
              iconTheme: { primary: "#21c55d", secondary: "#0a0a0a" },
              style: { borderColor: "rgba(33,197,93,0.2)" },
            },
            error: {
              iconTheme: { primary: "#e50914", secondary: "#0a0a0a" },
              style: { borderColor: "rgba(229,9,20,0.2)" },
            },
          }}
        />
      </body>
    </html>
  );
}
