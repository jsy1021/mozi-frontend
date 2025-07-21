export default [
  {
    path: '/auth/LoginPage',
    name: 'loginPage',
    component: () => import('../pages/auth/LoginPage.vue'),
    meta: { isHeader: false, isFooter: false },
  },
];
