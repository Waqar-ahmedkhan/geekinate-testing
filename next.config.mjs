const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: '(?<stagingHost>.*[.]vercel[.]app)' }],
        headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }],
      },
    ];
  },
};

export default nextConfig;
