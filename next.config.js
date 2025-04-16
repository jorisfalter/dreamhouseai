/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: [
      "oaidalleapiprodscus.blob.core.windows.net",
      "replicate.delivery",
    ],
  },
  experimental: {
    serverActions: {
      enabled: true,
    },
  },
  output: "standalone",
};

module.exports = nextConfig;
