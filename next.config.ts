import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@prisma/client"],
  allowedDevOrigins: ["192.168.15.6"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.public.blob.vercel-storage.com",
      },
    ],
  },
};

// PWA só ativa em produção para não interferir no dev
const withPWA =
  process.env.NODE_ENV === "production"
    ? // eslint-disable-next-line @typescript-eslint/no-require-imports
      require("next-pwa")({
        dest: "public",
        register: true,
        skipWaiting: true,
        disable: false,
      })
    : (config: NextConfig) => config;

export default withPWA(nextConfig);
