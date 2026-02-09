import type { NextConfig } from "next";
import withPWA from "@ducanh2912/next-pwa";
import { withSentryConfig } from "@sentry/nextjs";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  turbopack: {
    rules: {
      '*.svg': {
        loaders: ['@svgr/webpack'],
        as: '*.js',
      },
    },
  },
  images: {
    domains: [
      "res.cloudinary.com",
      "6mq1ghe0xghnbs82.public.blob.vercel-storage.com",
      "37xm7aeuit1qp3lm.public.blob.vercel-storage.com",
    ],
  },
};

const sentryConfig = withSentryConfig(nextConfig, {
  org: "fudex-technologies",
  project: "javascript-nextjs",
  silent: !process.env.CI,
  widenClientFileUpload: true,
  tunnelRoute: "/monitoring",
  webpack: {
    automaticVercelMonitors: true,
    treeshake: {
      removeDebugLogging: true,
    },
  },
});

export default withPWA({
  dest: "public",
  register: true,
  reloadOnOnline: true,
  disable: process.env.NODE_ENV === "development",
  workboxOptions: {
    disableDevLogs: true,
    importScripts: ['/sw-custom.js'],  // ← Change from '/sw-push.js' to '/sw-custom.js'
  },
})(sentryConfig);