/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    serverComponentsExternalPackages: ["@napi-rs/canvas"],
  },
  webpack: (config) => {
    config.experiments = {
      ...config.experiments,
      topLevelAwait: true,
    };
    config.module.rules.push({
      test: /\.node$/,
      use: ["node-loader"],
    });

    // config.externals.push({
    //   sharp: "commonjs sharp",
    //   canvas: "commonjs canvas",
    // });

    return config;
  },
};

module.exports = nextConfig;
