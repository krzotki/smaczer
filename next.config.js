/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    serverActions: {
      allowedOrigins: [
        '192.168.1.11:3000'
      ]
    }
  },
  images: {
    remotePatterns: [
      {
        hostname: "staticsmaker.iplsc.com",
      },
    ],
  },
};

module.exports = nextConfig;
