export default [
  {
    path: '/user/MyPage',
    name: 'myPage',
    component: () => import('../pages/user/MyPage.vue'),
    meta: { isHeader: true, isFooter: true },
  },
];
