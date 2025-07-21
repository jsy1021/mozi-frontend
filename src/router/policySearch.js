export default [
  {
    path: '/policySearch/PolicySearchPage',
    name: 'policySearchPage',
    component: () => import('../pages/policySearch/PolicySearchPage.vue'),
    meta: { isHeader: true, isFooter: true },
  },
];
