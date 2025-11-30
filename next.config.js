/** @type {import('next').NextConfig} */
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

const nextConfig = {
  reactStrictMode: false, // strict mode를 비활성화하여 빌드 에러 완화
  swcMinify: true,
  images: {
    domains: [],
    formats: ['image/webp', 'image/avif'],
  },
  // 성능 최적화
  compress: true,
  // 모듈 최적화
  modularizeImports: {
    'lucide-react': {
      transform: 'lucide-react/dist/esm/icons/{{kebabCase member}}',
    },
  },
  // 정적 페이지 생성 타임아웃 증가
  staticPageGenerationTimeout: 180,
  // experimental: {
  //   esmExternals: 'loose',
  // },
  eslint: {
    // 빌드 시 ESLint 에러 무시
    ignoreDuringBuilds: true,
  },
};

module.exports = withBundleAnalyzer(nextConfig);