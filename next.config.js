/** @type {import('next').NextConfig} */
// const nextConfig = {
//     reactStrictMode: false,
// };
//
// export default nextConfig;


// next.config.js
module.exports = {
  reactStrictMode: false,
  webpack: (config, options) => {
    config.module.rules.push({
      test: /\.(mp3|wav|m4a)$/,
      use: {
        loader: "file-loader",
        options: {
          publicPath: "/_next/static/",
          outputPath: "static/",
          name: "[name].[ext]",
        },
      },
    });
    return config;
  },
};