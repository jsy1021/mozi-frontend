// PolicySearch.js
export default [
  {
    path: '/policySearch/PolicySearchPage',
    name: 'policySearchPage',
    component: () => import('../pages/search/policySearch/PolicySearchPage.vue'),
    meta: { isHeader: true, isFooter: true },
  },
  {
    path: '/policySearch/detail/:id',
    name: 'policyDetail',
    component: () => import('../pages/search/policySearch/policyDetailPage.vue'),
    meta: { isHeader: true, isFooter: true },
  },
];
