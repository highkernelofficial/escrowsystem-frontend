import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* Deployment-ready config */
  output: "standalone",
  // algosdk v3 is ESM-only — must be transpiled by Next.js webpack
  transpilePackages: ["algosdk"],
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
