export default [
  {
    path: '/scrap/ScrapPage',
    name: 'scrapPage',
    component: () => import('../pages/scrap/ScrapPage.vue'),
    meta: { isHeader: true, isFooter: true, requiresAuth: true },
  },
];
