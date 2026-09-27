/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  async redirects() {
    return [
      // Root gets its own rule: on Cloudflare (OpenNext) an empty `:path*` isn't
      // substituted, so "/" would redirect to the literal ".../:path*".
      {
        source: "/",
        has: [{ type: "host", value: "^easyframe\\.app$" }],
        destination: "https://www.easyframe.app/",
        permanent: true
      },
      {
        source: "/:path*",
        has: [
          {
            type: "host",
            // `has.value` is a regex: anchor it, or it also matches inside
            // "www.easyframe.app" and redirects www to itself forever.
            value: "^easyframe\\.app$"
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
