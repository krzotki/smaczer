/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "staticsmaker.iplsc.com",
      },
    ],
  },
};

module.exports = nextConfig;
