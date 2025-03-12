/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["oaidalleapiprodscus.blob.core.windows.net"],
  },
  experimental: {
    serverActions: {
      allowedOrigins: ["localhost:3000", "dreamhouse-ai.fly.dev"],
    },
  },
  webpack: (config) => {
    config.experiments = { ...config.experiments, topLevelAwait: true };
    return config;
  },
  output: "standalone",
};

module.exports = nextConfig;
