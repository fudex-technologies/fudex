import type { NextConfig } from "next";
import withPWA from "@ducanh2912/next-pwa";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {},
};

export default withPWA({
  dest: "public",
  register: true,
  reloadOnOnline: true, // ensures new versions activate quickly
  disable: process.env.NODE_ENV === "development", // disable SW in dev
})(nextConfig);