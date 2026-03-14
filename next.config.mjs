/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  transpilePackages: ['three'],
  webpack: (config) => {
    config.module.rules.push({
      test: /\.mdx?$/,
      use: [],
    });
    return config;
  },
};

export default nextConfig;
