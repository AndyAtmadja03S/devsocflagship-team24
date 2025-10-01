/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation. This is especially useful
 * for Docker builds.
 */
import "./src/env.js";
import webpack from "webpack";

/** @type {import("next").NextConfig} */
const config = {
  webpack: (nextConfig, { isServer }) => {
    // Ignore optional Node-only modules used by discord.js
    nextConfig.plugins.push(
      new webpack.IgnorePlugin({ resourceRegExp: /^zlib-sync$/ }),
      new webpack.IgnorePlugin({ resourceRegExp: /^bufferutil$/ })
    );

    return nextConfig;
  },
};

export default config;
