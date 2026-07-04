import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { setupGuards } from './guards'

const routes: RouteRecordRaw[] = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/Login.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/',
    component: () => import('../layouts/AdminLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/dashboard',
      },
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../views/Dashboard.vue'),
        meta: { title: '仪表板', icon: 'DataAnalysis' },
      },
      {
        path: 'users',
        name: 'UserList',
        component: () => import('../views/Users/List.vue'),
        meta: { title: '用户管理', icon: 'User' },
      },
      {
        path: 'users/create',
        name: 'UserCreate',
        component: () => import('../views/Users/Create.vue'),
        meta: { title: '新建用户', hidden: true },
      },
      {
        path: 'goods',
        name: 'GoodsList',
        component: () => import('../views/Goods/List.vue'),
        meta: { title: '商品管理', icon: 'Goods' },
      },
      {
        path: 'goods/pending',
        name: 'GoodsPending',
        component: () => import('../views/Goods/Pending.vue'),
        meta: { title: '商品审批', icon: 'DocumentChecked' },
      },
      {
        path: 'orders',
        name: 'OrderList',
        component: () => import('../views/Orders/List.vue'),
        meta: { title: '订单管理', icon: 'List' },
      },
      {
        path: 'orders/:id',
        name: 'OrderDetail',
        component: () => import('../views/Orders/Detail.vue'),
        meta: { title: '订单详情', hidden: true },
      },
      {
        path: 'refunds',
        name: 'RefundList',
        component: () => import('../views/Refunds/List.vue'),
        meta: { title: '退款审核', icon: 'RefreshLeft' },
      },
      {
        path: 'recharges',
        name: 'RechargeList',
        component: () => import('../views/Recharges/List.vue'),
        meta: { title: '充值审核', icon: 'Wallet' },
      },
      {
        path: 'audit',
        name: 'AuditList',
        component: () => import('../views/Audit/List.vue'),
        meta: { title: '审计日志', icon: 'Document' },
      },
      // --- Analytics ---
      {
        path: 'analytics/revenue',
        name: 'AnalyticsRevenue',
        component: () => import('../views/Analytics/Revenue.vue'),
        meta: { title: '收入趋势', icon: 'TrendCharts' },
      },
      {
        path: 'analytics/hot-goods',
        name: 'AnalyticsHotGoods',
        component: () => import('../views/Analytics/HotGoods.vue'),
        meta: { title: '热卖排行', hidden: true },
      },
      {
        path: 'analytics/order-stats',
        name: 'AnalyticsOrderStats',
        component: () => import('../views/Analytics/OrderStats.vue'),
        meta: { title: '订单统计', hidden: true },
      },
      {
        path: 'analytics/customer-stats',
        name: 'AnalyticsCustomerStats',
        component: () => import('../views/Analytics/CustomerStats.vue'),
        meta: { title: '客户统计', hidden: true },
      },
      // --- Pricing ---
      {
        path: 'pricing',
        name: 'PricingList',
        component: () => import('../views/Pricing/List.vue'),
        meta: { title: '定价规则', icon: 'PriceTag' },
      },
      {
        path: 'pricing/create',
        name: 'PricingCreate',
        component: () => import('../views/Pricing/Create.vue'),
        meta: { title: '新建定价规则', hidden: true },
      },
      {
        path: 'pricing/edit/:id',
        name: 'PricingEdit',
        component: () => import('../views/Pricing/Create.vue'),
        meta: { title: '编辑定价规则', hidden: true },
      },
      {
        path: 'pricing/preview',
        name: 'PricingPreview',
        component: () => import('../views/Pricing/Preview.vue'),
        meta: { title: '价格预览', hidden: true },
      },
      // --- Customer Groups ---
      {
        path: 'customer-groups',
        name: 'CustomerGroupList',
        component: () => import('../views/CustomerGroups/List.vue'),
        meta: { title: '客户分组', icon: 'UserFilled' },
      },
      {
        path: 'customer-groups/:id/members',
        name: 'CustomerGroupMembers',
        component: () => import('../views/CustomerGroups/Members.vue'),
        meta: { title: '分组成员', hidden: true },
      },
      // --- API Config ---
      {
        path: 'api-config',
        name: 'ApiConfigList',
        component: () => import('../views/ApiConfig/List.vue'),
        meta: { title: 'API限流', icon: 'Connection' },
      },
      // --- Reconciliation ---
      {
        path: 'reconciliation',
        name: 'ReconciliationList',
        component: () => import('../views/Reconciliation/List.vue'),
        meta: { title: '对账管理', icon: 'Checked' },
      },
      {
        path: 'reconciliation/:id',
        name: 'ReconciliationDetail',
        component: () => import('../views/Reconciliation/Detail.vue'),
        meta: { title: '对账详情', hidden: true },
      },
      // --- Docking Tasks ---
      {
        path: 'docking-tasks',
        name: 'DockingTaskList',
        component: () => import('../views/DockingTasks/List.vue'),
        meta: { title: '对接任务', icon: 'Link' },
      },
      // --- Billing ---
      {
        path: 'billing/plans',
        name: 'BillingPlans',
        component: () => import('../views/Billing/Plans.vue'),
        meta: { title: '套餐管理', icon: 'Medal' },
      },
      {
        path: 'billing/subscriptions',
        name: 'BillingSubscriptions',
        component: () => import('../views/Billing/Subscriptions.vue'),
        meta: { title: '订阅管理', hidden: true },
      },
      {
        path: 'billing/invoices',
        name: 'BillingInvoices',
        component: () => import('../views/Billing/Invoices.vue'),
        meta: { title: '账单管理', hidden: true },
      },
    ],
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

setupGuards(router)

export default router
