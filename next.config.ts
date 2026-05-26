import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  compress: true,

  // ─── Image Optimization (LCP / CLS) ───
  images: {
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 80, 96, 120, 240],
    minimumCacheTTL: 60 * 60 * 24 * 365,
  },

  serverExternalPackages: ['leaflet'],

  // ─── Tree-shaking heavy packages (reduces JS bundle → better FCP / TTI) ───
  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      'react-leaflet',
      '@radix-ui/react-dialog',
      '@radix-ui/react-toast',
      '@radix-ui/react-tooltip',
      '@radix-ui/react-separator',
      '@radix-ui/react-label',
      '@radix-ui/react-toggle',
      '@radix-ui/react-slot',
      'class-variance-authority',
    ],
  },

  // ─── Remove console.log in production (reduces bundle) ───
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production'
      ? { exclude: ['error', 'warn'] }
      : false,
  },

  typescript: {
    ignoreBuildErrors: true,
  },

  // ─── Cache headers moved to vercel.json ───
  // Vercel warns when custom Cache-Control headers are set via
  // next.config.ts headers() because they can conflict with the
  // platform's built-in edge caching. Use vercel.json instead,
  // or let Vercel handle it automatically.
  // - /_next/static/  → Vercel sets immutable cache automatically
  // - /public/* files  → Vercel CDN handles via content hash
  // - API routes       → no-cache by default
};

export default nextConfig;
