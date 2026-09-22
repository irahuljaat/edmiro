/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  experimental: {
    serverActions: {
      bodySizeLimit: '20mb',
    },
  },

  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/**' },
      { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
      { protocol: 'https', hostname: 'encrypted-tbn0.gstatic.com', pathname: '/**' },
      { protocol: 'https', hostname: 'via.placeholder.com', pathname: '/**' },
      { protocol: 'https', hostname: 'placehold.co', pathname: '/**' },
    ],
  },

  // Proxies /admin and /portal to your other two apps
  async rewrites() {
    return [
      {
        source: '/admin',
        destination: process.env.ADMIN_URL
          ? `${process.env.ADMIN_URL}/admin`
          : 'http://localhost:3001/admin',
      },
      {
        source: '/admin/:path*',
        destination: process.env.ADMIN_URL
          ? `${process.env.ADMIN_URL}/admin/:path*`
          : 'http://localhost:3001/admin/:path*',
      },
      {
        source: '/portal',
        destination: process.env.PORTAL_URL
          ? `${process.env.PORTAL_URL}/portal`
          : 'http://localhost:3002/portal',
      },
      {
        source: '/portal/:path*',
        destination: process.env.PORTAL_URL
          ? `${process.env.PORTAL_URL}/portal/:path*`
          : 'http://localhost:3002/portal/:path*',
      },
    ];
  },

  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    return config;
  },
};

module.exports = nextConfig;