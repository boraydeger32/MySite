const isGitHubPages = !!process.env.GITHUB_ACTIONS;

const nextConfig = {
  basePath: isGitHubPages ? '/MySite' : '',
  output: isGitHubPages ? 'export' : undefined,
  images: { unoptimized: true },
};

export default nextConfig;
