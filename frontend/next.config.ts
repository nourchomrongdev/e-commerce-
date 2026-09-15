import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    root: __dirname,
  },
  allowedDevOrigins: [
    "172.26.80.1",
    "briery-helene-naissant.ngrok-free.dev",
    "marketplacebynourchomrong.test",
    "10.205.246.241"
  ],
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;