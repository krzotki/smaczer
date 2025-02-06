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
      {
        hostname: "*.googleusercontent.com",
      },
      {
        hostname: "kr-smaczer-images.s3.eu-north-1.amazonaws.com"
      }
    ],
  },
};

module.exports = nextConfig;
