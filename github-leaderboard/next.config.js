/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";
import webpack from "webpack";

/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Ensure externals is always an array
      if (!Array.isArray(config.externals)) {
        config.externals = [config.externals].filter(Boolean);
      }

      // Push our rule to skip bundling zlib-sync
      config.externals.push({
        "zlib-sync": "commonjs zlib-sync",
      });
    } else {
      // On the client, completely disable it
      config.resolve.fallback = {
        ...config.resolve.fallback,
        "zlib-sync": false,
      };
    }

    return config;
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;


