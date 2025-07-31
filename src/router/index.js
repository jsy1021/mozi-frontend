import { createRouter, createWebHistory } from 'vue-router';

import HomePage from '../pages/HomePage.vue';
import HamburgerMenu from '../pages/HamburgerMenu.vue';
import authRoutes from './auth';
import userRoutes from './user';
import financialSearchRoutes from './financialSearch';
import policySearchRoutes from './policySearch';
import goalRoutes from './goal';
import scrapRoutes from './scrap';
import accountRoutes from './account';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'homePage',
      component: HomePage,
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
    ...accountRoutes,
  ],
});

export default router;
