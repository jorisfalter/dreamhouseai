/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    dangerouslyAllowSVG: true,
    domains: [
      "oaidalleapiprodscus.blob.core.windows.net",
      "replicate.delivery",
      "localhost",
    ],
    formats: ["image/avif", "image/webp"],
    contentDispositionType: "attachment",
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  experimental: {
    serverActions: {
      enabled: true,
    },
  },
  output: "standalone",
};

module.exports = nextConfig;
