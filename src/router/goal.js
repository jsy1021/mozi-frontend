export default [
  {
    path: '/goal',
    name: 'goalMain',
    component: () => import('../pages/goal/GoalMainView.vue'),
    meta: { isHeader: true, isFooter: true },
  },
  {
    path: '/goal/create',
    name: 'goalCreate',
    component: () => import('../pages/goal/GoalCreateView.vue'),
    meta: { isHeader: true, isFooter: false },
  },
  {
    path: '/goal/:goalId/edit',
    name: 'goalEdit',
    component: () => import('../pages/goal/GoalEditView.vue'),
    meta: { isHeader: true, isFooter: false },
    props: true, // URL 파라미터를 props로 전달
  },
  {
    path: '/goal/:goalId',
    name: 'goalDetail',
    component: () => import('../pages/goal/GoalDetailView.vue'),
    meta: { isHeader: true, isFooter: true },
    props: true, // URL 파라미터를 props로 전달
  },
  {
    path: '/goal/:goalId/recommendations',
    name: 'goalRecommendations',
    component: () => import('../pages/goal/RecommendationMainView.vue'),
    meta: { isHeader: true, isFooter: true },
    props: true, // URL 파라미터를 props로 전달
  },
];
