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
      }
      // NOTE: Do NOT add case-only redirects like /terms -> /Terms here.
      // Next.js redirect `source` matching is case-INSENSITIVE, so such a rule
      // also matches its own destination and creates an infinite 308 loop.
      // Legacy capitalized /Terms and /Privacy are handled in middleware.ts
      // with an exact-string match (loop-safe).
    ];
  }
};

export default nextConfig;
