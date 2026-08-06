const isGithubPages = process.env.GITHUB_PAGES === "true";
// Project-page deploys (gulheda.github.io/ofg) are served from a subpath.
const basePath = isGithubPages ? "/ofg" : "";

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
  output: "export",
  basePath,
  assetPrefix: basePath ? `${basePath}/` : undefined,
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
