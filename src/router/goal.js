export default [
  {
    path: '/goal/GoalPage',
    name: 'goalPage',
    component: () => import('../pages/goal/GoalPage.vue'),
    meta: { isHeader: true, isFooter: true },
  },
];
