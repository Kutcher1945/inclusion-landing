import type { NextConfig } from "next";

const BACKEND = "https://green-admin.smartalmaty.kz";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/inclusion-api/:path*",
        destination: `${BACKEND}/inclusion-api/:path*`,
      },
    ];
  },
};

export default nextConfig;
