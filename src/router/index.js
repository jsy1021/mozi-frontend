import { createRouter, createWebHistory } from 'vue-router';

import MainPage from '../pages/MainPage.vue';
import HamburgerMenu from '../pages/HamburgerMenu.vue';
import authRoutes from './auth';
import userRoutes from './user';
import financialSearchRoutes from './financialSearch';
import policySearchRoutes from './policySearch';
import goalRoutes from './goal';
import scrapRoutes from './scrap';

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
  ...authRoutes,
  ...userRoutes,
  ...financialSearchRoutes,
  ...policySearchRoutes,
  ...goalRoutes,
  ...scrapRoutes,

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
  //to 경로 중 하나라도 requiresAuth가 true라면 인증 필요
  const requiresAuth = to.matched.some((r) => r.meta?.requiresAuth);
  const token = localStorage.getItem('accessToken');

  if (requiresAuth && !token && to.name !== 'loginPage') {
    //인증 필요 경로& 토큰이 없을 경우 -> 로그인 페이지로 redirection
    return {
      name: 'loginPage',
      query: { redirect: to.fullPath },
    };
  }
});

export default router;
