/** @type {import('next').NextConfig} */

const nextConfig = {
  reactStrictMode: true,

  images: {
    domains: ['cryptosea-nft-marketplace.infura-ipfs.io', 'infura-ipfs.io'],
  },
};

const webpack = require('webpack');

module.exports = {
  webpack: (config) => {
    config.plugins.push(new webpack.EnvironmentPlugin(process.env));
    return config;
  },
};

module.exports = nextConfig;
