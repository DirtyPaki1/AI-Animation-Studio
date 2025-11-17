/** @type {import('next').NextConfig} */
const nextConfig = {
    experimental: {
      appDir: true,
    },
    images: {
      domains: ['localhost'],
    },
    // Enable SWC minification for better performance
    swcMinify: true,
    // Compiler options
    compiler: {
      // Remove console logs in production
      removeConsole: process.env.NODE_ENV === 'production',
    },
  }
  
  module.exports = nextConfig