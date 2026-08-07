/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  compiler: {
    removeConsole: process.env.NODE_ENV === "production",
  },

  // Prevent Next.js from bundling these Node.js-only packages.
  // They must run in the Node.js runtime, not the Edge runtime or browser.
  serverExternalPackages: [
    "mongoose",
    "bcryptjs",
    "jsonwebtoken",
    "sanitize-html",
  ],

  async redirects() {
    return [
      {
        source: "/dashboard/default",
        destination: "/dashboard",
        permanent: false,
      },
    ];
  },

  // Security headers for enhanced application security.
  // Applied to every response from the Next.js server.
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          {
            key: "X-Frame-Options",
            value: "DENY",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
          {
            key: "X-DNS-Prefetch-Control",
            value: "on",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
