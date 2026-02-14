/** @type {import('next').NextConfig} */
const nextConfig = {
  // Externalize pdf-parse so Webpack doesn't break it
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push("pdf-parse");
    }
    return config;
  },
};

module.exports = nextConfig;
