export default [
  {
    path: '/financialSearch/FinancialSearchPage',
    name: 'financialSearchPage',
    component: () =>
      import('../pages/search/financialSearch/FinancialSearchPage.vue'),
    meta: { tab: 'search', isHeader: true, isFooter: true, requiresAuth: true },
  },
  {
    path: '/financialSearch/deposit/:id',
    name: 'depositDetail',
    component: () =>
      import('../pages/search/financialSearch/DepositDetailPage.vue'),
    meta: { tab: 'search', isHeader: true, isFooter: true, requiresAuth: true },
  },
  {
    path: '/financialSearch/saving/:id',
    name: 'savingDetail',
    component: () =>
      import('../pages/search/financialSearch/SavingDetailPage.vue'),
    meta: { tab: 'search', isHeader: true, isFooter: true, requiresAuth: true },
  },
  {
    path: '/financialSearch/:id',
    name: 'legacyFinancialDetail',
    redirect: (to) => ({ path: `/financialSearch/deposit/${to.params.id}` }),
    meta: { tab: 'search' }, // 선택이지만 넣어두면 깔끔
  },
]
