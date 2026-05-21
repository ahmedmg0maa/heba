/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  compress: true,
  reactStrictMode: true,
  async redirects() {
    return [
      {
        source: "/articles/:path*",
        destination: "/blog/:path*",
        permanent: true,
      },
      {
        source: "/articles",
        destination: "/blog",
        permanent: true,
      },
    ]
  },
  images: {
    formats: ["image/avif", "image/webp"],
    minimumCacheTTL: 60 * 60 * 24 * 30,
  },
}

export default nextConfig
