/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Handle undici module for client-side
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        undici: false,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        url: false,
        zlib: false,
        http: false,
        https: false,
        assert: false,
        os: false,
        path: false,
      };
    }
    
    // Handle all undici files, including nested ones in Firebase
    config.module.rules.push({
      test: /node_modules.*undici.*\.js$/,
      use: 'null-loader',
    });
    
    return config;
  },
  
  // Force Next.js to use SWC instead of Babel
  swcMinify: true,
  
  // Ensure modern JavaScript features are supported
  experimental: {
    esmExternals: true,
  },
}

module.exports = nextConfig