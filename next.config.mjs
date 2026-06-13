/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            value: "easyframe.app"
          }
        ],
        destination: "https://www.easyframe.app/:path*",
        permanent: true
      },
      {
        source: "/terms",
        destination: "/Terms",
        permanent: true
      },
      {
        source: "/privacy",
        destination: "/Privacy",
        permanent: true
      }
    ];
  }
};

export default nextConfig;
