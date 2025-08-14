export default [
  {
    path: '/user/mypage',
    name: 'myPage',
    component: () => import('../pages/user/MyPage.vue'),
    meta: { isHeader: true, isFooter: true, requiresAuth: true },
  },
  {
    path: '/user/personal',
    name: 'personal',
    component: () => import('../pages/user/PersonalInfo.vue'),
    meta: { isHeader: true, isFooter: true, requiresAuth: true },
  },
  {
    path: '/user/edit-info',
    name: 'EditInfo',
    component: () => import('../pages/user/EditInfo.vue'),
    meta: { isHeader: true, isFooter: true, requiresAuth: true },
  },
  {
    path: '/user/delete-info',
    name: 'DeleteInfo',
    component: () => import('../pages/user/DeleteInfo.vue'),
    meta: { isHeader: true, isFooter: true, requiresAuth: true },
  },
];
