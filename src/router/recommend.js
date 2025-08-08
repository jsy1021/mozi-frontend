export default [
  {
    path: '/recommend',
    name: 'recommendPage',
    component: () => import('../pages/recommend/RecommendPage.vue'),
    meta: { isHeader: true, isFooter: true, requiresAuth: true },
  },
];
