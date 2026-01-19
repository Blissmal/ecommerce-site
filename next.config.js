/** @type {import('next').NextConfig} */
const nextConfig = {
    images: {
    domains: ['images.unsplash.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**', // This allows all paths from Cloudinary
      },
    ],
  },
};

module.exports = nextConfig;
