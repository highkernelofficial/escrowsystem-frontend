import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Deployment-ready config */
  output: "standalone",
  async rewrites() {
    return [
      {
        source: "/api/backend/:path*",
        destination: "https://lianoid-jung-nonappendicular.ngrok-free.dev/:path*",
      },
    ];
  },
};

export default nextConfig;
