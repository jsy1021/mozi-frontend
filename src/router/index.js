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

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
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
    ...searchRoutes,
    ...recommendRoutes
    
  ],
});

export default router;
