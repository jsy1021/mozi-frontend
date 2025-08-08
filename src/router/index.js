import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

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

const routes = [
  //인증 필요 라우트 - 로그인 사용자만 접근 가능
  {
    path: '/',
    name: 'mainPage',
    component: MainPage,
    meta: { isHeader: true, isFooter: true, requiresAuth: true },
  },
  {
    path: '/HamburgerMenu',
    name: 'hamburgerMenu',
    component: HamburgerMenu,
    meta: { isHeader: false, isFooter: false, requiresAuth: true },
  },
  {
    path: '/oauth/kakao/callback',
    name: 'kakaoCallback',
    component: () => import('../pages/auth/OAuthCallbackPage.vue'),
    meta: { isHeader: false, isFooter: false },
  },
  {
    path: '/oauth/naver/callback',
    name: 'naverCallback',
    component: () => import('../pages/auth/OAuthCallbackPage.vue'),
    meta: { isHeader: false, isFooter: false },
  },
  {
    path: '/oauth/google/callback',
    name: 'googleCallback',
    component: () => import('../pages/auth/OAuthCallbackPage.vue'),
    meta: { isHeader: false, isFooter: false },
  },

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
  console.log('🔥 라우터 가드 실행:', {
    경로: to.path,
    이름: to.name,
    requiresAuth: to.matched.some((record) => record.meta?.requiresAuth),
  });

  const authStore = useAuthStore();

  // 1. 로그인 성공 후 redirect 처리
  if (
    to.name === 'loginPage' &&
    authStore.isAuthenticated &&
    to.query.redirect
  ) {
    return { path: to.query.redirect };
  }
  console.log('🔥 라우터 가드 - authStore 상태:', {
    'authStore.isAuthenticated': authStore.isAuthenticated,
    'authStore.user': authStore.user,
    'authStore.token': authStore.token ? '있음' : '없음',
  });

  // 2. 이미 로그인한 사용자가 공개 페이지 접근 시 메인으로 이동
  if (authStore.isAuthenticated && authStore.isPublicRoute(to.name)) {
    return { name: 'mainPage' };
  }

  // 3. 인증이 필요한 페이지 접근 체크
  if (!authStore.canAccess(to)) {
    return {
      name: 'loginPage',
      query: { redirect: to.fullPath },
    };
  }
  return true;
});

export default router;
