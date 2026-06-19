import withPWAInit from 'next-pwa';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const withPWA = withPWAInit({
  dest: path.join(__dirname, 'public'),  // ✅ absolute path
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    {
      urlPattern: /^\/api\/.*/i,
      handler: 'NetworkOnly',
      options: {
        cacheName: 'api-data'
      }
    }
  ]
});

const API = (process.env.API_BASE_URL && process.env.API_BASE_URL.trim() !== '') 
  ? process.env.API_BASE_URL 
  : 'http://localhost:4000';

const nextConfig = {
  transpilePackages: [
    '@ui5/webcomponents-react',
    '@ui5/webcomponents',
    '@ui5/webcomponents-fiori',
    '@ui5/webcomponents-icons'
  ],
  turbopack: {},
  async rewrites() {
    return [
      {
        source: '/b1s/v1/orders',
        destination: `${API}/api/orders`
      },
      {
        source: '/b1s/v1/trucks',
        destination: `${API}/api/trucks`
      },
      {
        source: '/b1s/v1/warehouses',
        destination: `${API}/api/warehouses`
      },
      {
        source: '/b1s/v1/:path*',
        destination: `${API}/api/:path*`
      },
      {
        source: '/api/app/:path*',
        destination: `${API}/api/app/:path*`
      },
      {
        source: '/b1s/v1/expenses/:path*',
        destination: `${API}/api/expenses/:path*`
      },
      {
        source: '/b1s/v1/expenses',
        destination: `${API}/api/expenses`
      }
    ];
  }
};

export default withPWA(nextConfig);