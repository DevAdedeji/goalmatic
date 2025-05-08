const routes = [
  // ... your existing routes ...
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue') // or your 404 page component
  }
] 