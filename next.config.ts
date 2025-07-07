import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ['hobbi-dev.s3.ap-northeast-2.amazonaws.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'hobbi-dev.s3.ap-northeast-2.amazonaws.com',
        port: '',
        pathname: '/hobbi-dev/**',
      },
    ],
  },
};

export default nextConfig;
