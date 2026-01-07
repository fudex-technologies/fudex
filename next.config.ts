import type { NextConfig } from "next";
import withPWA from "@ducanh2912/next-pwa";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {},
  images: {
    domains: [
      "res.cloudinary.com",
      "6mq1ghe0xghnbs82.public.blob.vercel-storage.com",
    ],
  },
};

export default withPWA({
  dest: "public",
  register: true,
  reloadOnOnline: true, // ensures new versions activate quickly
  disable: process.env.NODE_ENV === "development", // disable SW in dev
})(nextConfig);