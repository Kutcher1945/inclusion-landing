import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Docker (same shape as opeka_next): `node server.js` from .next/standalone.
  // Skipped on Vercel, whose build adapter packages the app itself.
  output: process.env.VERCEL ? undefined : "standalone",
};

export default nextConfig;
