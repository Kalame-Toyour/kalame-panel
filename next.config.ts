import withBundleAnalyzer from '@next/bundle-analyzer';
import { withSentryConfig } from '@sentry/nextjs';
import createNextIntlPlugin from 'next-intl/plugin';
import './src/libs/Env';

const withNextIntl = createNextIntlPlugin('./src/libs/i18n.ts');

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  poweredByHeader: false,
  reactStrictMode: true,
  serverExternalPackages: ['@electric-sql/pglite'],
  images: {
    domains: ['cdn.coingraam.com'],
    formats: ['image/webp', 'image/avif'],
  },
  compress: true,
  generateEtags: true,
  trailingSlash: false,
  
  webpack: (config, { isServer }) => {
    // Exclude mobile app files from server build
    if (isServer) {
      config.externals = config.externals || [];
      config.externals.push({
        '@capacitor/cli': 'commonjs @capacitor/cli',
        '@capacitor/core': 'commonjs @capacitor/core',
        '@capacitor/android': 'commonjs @capacitor/android',
        '@capacitor/ios': 'commonjs @capacitor/ios',
      });
    }
    
    return config;
  },

  async rewrites() {
    return {
      beforeFiles: [
        {
          source: '/api/auth/:path*',
          destination: '/api/auth/:path*',
        },
      ],
      afterFiles: [],
      fallback: [],
    };
  },
};

// Need to use export default for TypeScript
export default withSentryConfig(
  bundleAnalyzer(
    withNextIntl(nextConfig),
  ),
  {
    org: 'nextjs-boilerplate-org',
    project: 'nextjs-boilerplate',
    silent: !process.env.CI,
    widenClientFileUpload: true,
    reactComponentAnnotation: {
      enabled: true,
    },
    tunnelRoute: '/monitoring',
    hideSourceMaps: true,
    disableLogger: true,
    automaticVercelMonitors: true,
    telemetry: false,
  },
);
