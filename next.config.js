/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      // API routes - map dynamic routes to query parameter routes
      {
        source: '/api/comments/:id',
        destination: '/api/comments?id=:id',
      },
      {
        source: '/api/recipes/:id/comments',
        destination: '/api/recipes/comments?recipeId=:id',
      },
      {
        source: '/api/recipes/:id/like',
        destination: '/api/recipes/like?recipeId=:id',
      },
      // Page routes
      {
        source: '/user/:username',
        destination: '/user/profile?username=:username',
      },
    ];
  },
};

module.exports = nextConfig; 