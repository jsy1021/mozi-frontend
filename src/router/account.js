export default [
  {
    path: "/account/AccountAgreementPage",
    name: "AccountAgreementPage",
    component: () => import("@/pages/account/AccountAgreementPage.vue"),
    meta: { isHeader: false, isFooter: false, requiresAuth: true },
  },
  {
    path: "/account/BankConnectPage",
    name: "BankConnectPage",
    component: () => import("@/pages/account/BankConnectPage.vue"),
    meta: { isHeader: true, isFooter: true, requiresAuth: true },
  },
  {
    path: "/account/BankSummaryPage",
    name: "BankSummaryPage",
    component: () => import("@/pages/account/BankSummaryPage.vue"),
    meta: { isHeader: true, isFooter: true, requiresAuth: true },
  },
  {
    path: "/account/BankAccountListPage/:bankCode",
    name: "BankAccountListPage",
    component: () => import("@/pages/account/BankAccountListPage.vue"),
    meta: { isHeader: true, isFooter: true, requiresAuth: true },
  },
  {
    path: "/account/BankMainSettingPage",
    name: "BankMainSettingPage",
    component: () => import("@/pages/account/BankMainSettingPage.vue"),
    meta: { isHeader: true, isFooter: true, requiresAuth: true },
  },
  {
    path: "/account/BankUnlinkPage",
    name: "BankUnlinkPage",
    component: () => import("@/pages/account/BankUnlinkPage.vue"),
    meta: { isHeader: true, isFooter: true, requiresAuth: true },
  },
];
