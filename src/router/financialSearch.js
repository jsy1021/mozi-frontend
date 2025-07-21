export default [
  {
    path: '/financialSearch/FinancialSearchPage',
    name: 'financialSearchPage',
    component: () => import('../pages/financialSearch/FinancialSearchPage.vue'),
    meta: { isHeader: true, isFooter: true },
  },
];
