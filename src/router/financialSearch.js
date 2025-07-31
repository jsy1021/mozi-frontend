export default [
  {
    path: '/financialSearch/FinancialSearchPage',
    name: 'financialSearchPage',
    component: () => import('../pages/financialSearch/FinancialSearchPage.vue'),
    meta: { isHeader: true, isFooter: true },
  },
  {
    path: '/financialSearch/deposit/:id', // 예금 상세 페이지용 경로
    name: 'depositDetail',
    component: () => import('../pages/financialSearch/DepositDetailPage.vue'),
    meta: { isHeader: true, isFooter: true },
  },
  {
    path: '/financialSearch/saving/:id', // 적금 상세 페이지용 경로
    name: 'savingDetail',
    component: () => import('../pages/financialSearch/SavingDetailPage.vue'),
    meta: { isHeader: true, isFooter: true },
  },
  {
    path: '/financialSearch/:id', // 이전 경로 지원 (예금으로 리다이렉트)
    name: 'legacyFinancialDetail',
    redirect: to => ({ path: `/financialSearch/deposit/${to.params.id}` }),
  },
];
