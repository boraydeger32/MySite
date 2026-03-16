const nextConfig = {
  basePath: process.env.GITHUB_ACTIONS ? '/MySite' : '',
  images: { unoptimized: true },
};

export default nextConfig;
