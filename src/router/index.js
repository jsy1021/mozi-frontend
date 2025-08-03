import { createRouter, createWebHistory } from 'vue-router';

import MainPage from '../pages/MainPage.vue';
import HamburgerMenu from '../pages/HamburgerMenu.vue';
import authRoutes from './auth';
import userRoutes from './user';
import financialSearchRoutes from './financialSearch';
import policySearchRoutes from './policySearch';
import goalRoutes from './goal';
import scrapRoutes from './scrap';
import searchRoutes from './search';
import recommendRoutes from './recommend';
import accountRoutes from './account';

// 인증 가드 추가
const requiresAuth = (to, from, next) => {
  const token = localStorage.getItem('accessToken');
  if (!token) {
    next('/auth/LoginPage');
  } else {
    next();
  }
};

const routes = [
  //인증 필요 라우트 - 로그인 사용자만 접근 가능
  {
    path: '/',
    name: 'mainPage',
    component: MainPage,
    meta: { isHeader: true, isFooter: true },
  },
  {
    path: '/HamburgerMenu',
    name: 'hamburgerMenu',
    component: HamburgerMenu,
    meta: { isHeader: false, isFooter: false },
  },
  {
    path: '/user/mypage',
    name: 'MyPage',
    component: () => import('@/pages/user/MyPage.vue'),
    beforeEnter: requiresAuth,
  },
  // {
  //   path: '/user/personal',
  //   name: 'PersonalStep',
  //   component: () => import('@/pages/user/PersonalStepPage.vue'),
  //   beforeEnter: requiresAuth,
  // },
  ...authRoutes,
  ...userRoutes,
  ...financialSearchRoutes,
  ...policySearchRoutes,
  ...goalRoutes,
  ...scrapRoutes,
  ...searchRoutes,
  ...recommendRoutes,
  ...accountRoutes,

  //정의되지 않은 경로는 메인 페이지로 redirect
  { path: '/:pathMatch(.*)*', redirect: { name: 'mainPage' } },
];

//라우터 인스턴스 생성
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

//전역 네비게이션 가드 설정
router.beforeEach((to) => {
  const token = localStorage.getItem('accessToken');
  const isAuthenticated = !!token;

  const requiresAuth = to.matched.some((r) => r.meta?.requiresAuth);

  // 인증 필요한 페이지인데 로그인 안되어 있음
  if (requiresAuth && !isAuthenticated) {
    return {
      name: 'loginPage',
      query: { redirect: to.fullPath },
    };
  }

  // ✅ 로그인한 사용자는 아래 페이지들 접근 막기
  const unauthOnlyPages = [
    'loginPage',
    'join',
    'findPasswd',
    'ResetPasswdPage',
  ];
  if (isAuthenticated && unauthOnlyPages.includes(to.name)) {
    return { name: 'MyPage' };
  }

  return true;
});

export default router;
