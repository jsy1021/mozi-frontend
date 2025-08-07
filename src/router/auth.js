export default [
  {
    path: '/auth/LoginPage',
    name: 'loginPage',
    component: () => import('../pages/auth/LoginPage.vue'),
    meta: { isHeader: false, isFooter: false },
  },
  {
    path: '/find-id',
    name: 'findID',
    component: () => import('../pages/auth/FindIDPage.vue'),
    meta: { isHeader: false, isFooter: false },
  },
  {
    path: '/find-passwd',
    name: 'findPasswd',
    component: () => import('../pages/auth/FindPasswdPage.vue'),
    meta: { isHeader: false, isFooter: false },
  },
  {
    path: '/reset-passwd',
    name: 'ResetPasswdPage',
    component: () => import('../pages/auth/ResetPasswdPage.vue'),
    props: true,
    meta: { isHeader: false, isFooter: false },
  },
  {
    path: '/join',
    name: 'join',
    component: () => import('../pages/auth/JoinPage.vue'),
    meta: { isHeader: false, isFooter: false },
  },
];
