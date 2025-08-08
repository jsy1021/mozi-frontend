export default [
  {
    path: '/search',
    name: 'searchPage',
    component: () => import('../pages/search/SearchGuidePage.vue'),
    meta: { isHeader: true, isFooter: true, requiresAuth: true },
  },
];
