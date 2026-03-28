import "./globals.css";
import { Toaster } from "react-hot-toast";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "CineBook — Book Movie Tickets",
  description: "The ultimate cinema booking experience. Netflix-inspired design.",
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
        {children}
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#1a1a1a",
              color: "#fff",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "10px",
              fontSize: "14px",
              fontFamily: "'DM Sans', sans-serif",
              padding: "12px 16px",
            },
            success: { iconTheme: { primary: "#21c55d", secondary: "#0a0a0a" } },
            error: { iconTheme: { primary: "#e50914", secondary: "#0a0a0a" } },
          }}
        />
      </body>
    </html>
  );
}
