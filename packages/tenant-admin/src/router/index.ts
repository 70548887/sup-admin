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
    component: () => import('../layouts/TenantLayout.vue'),
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
        meta: { title: '仪表板', icon: 'DataAnalysis', roles: ['boss', 'finance', 'ops', 'support'] },
      },
      {
        path: 'orders',
        name: 'OrderList',
        component: () => import('../views/Orders/List.vue'),
        meta: { title: '订单管理', icon: 'List', roles: ['boss', 'finance', 'ops', 'support'] },
      },
      {
        path: 'orders/:id',
        name: 'OrderDetail',
        component: () => import('../views/Orders/Detail.vue'),
        meta: { title: '订单详情', hidden: true, roles: ['boss', 'finance', 'ops', 'support'] },
      },
      {
        path: 'goods',
        name: 'GoodsList',
        component: () => import('../views/Goods/List.vue'),
        meta: { title: '商品管理', icon: 'Goods', roles: ['boss', 'ops'] },
      },
      {
        path: 'admins',
        name: 'AdminList',
        component: () => import('../views/Admins/List.vue'),
        meta: { title: '管理员', icon: 'User', roles: ['boss'] },
      },
      {
        path: 'subscription',
        name: 'Subscription',
        component: () => import('../views/Subscription/Index.vue'),
        meta: { title: '订阅管理', icon: 'Medal', roles: ['boss', 'finance'] },
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
