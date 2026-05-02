/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org",
        pathname: "/t/p/**",
      },
    ],
    // Fallback for older Next versions
    domains: ["image.tmdb.org"],
  },
  // Suppress hydration warnings from browser extensions
  reactStrictMode: false,
};

module.exports = nextConfig;
