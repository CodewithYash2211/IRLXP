import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // Allow importing SVG as React components if needed later
  // Enable strict mode for better React hygiene
  reactStrictMode: true,
  images: {
    // Add Supabase storage domain when used
    remotePatterns: [],
  },
  // Ensure we can import from lib/ without issues
  experimental: {
    // typedRoutes is useful but requires all routes to be typed — skip for now
  },
}

export default nextConfig
