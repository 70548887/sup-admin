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
    component: () => import('../layouts/SupplierLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/dashboard',
      },
      {
        path: 'dashboard',
        name: 'Dashboard',
        component: () => import('../views/Dashboard/Dashboard.vue'),
        meta: { title: '仪表板' },
      },
      {
        path: 'account',
        name: 'Account',
        component: () => import('../views/Account/Account.vue'),
        meta: { title: '账户信息' },
      },
      {
        path: 'settlement',
        name: 'Settlement',
        component: () => import('../views/Settlement/Settlement.vue'),
        meta: { title: '结算管理' },
      },
      {
        path: 'notification',
        name: 'Notification',
        component: () => import('../views/Notification/Notification.vue'),
        meta: { title: '通知设置' },
      },
      {
        path: 'goods',
        name: 'GoodsList',
        component: () => import('../views/Goods/List.vue'),
        meta: { title: '商品管理' },
      },
      {
        path: 'goods/create',
        name: 'GoodsCreate',
        component: () => import('../views/Goods/GoodsEdit.vue'),
        meta: { title: '新建商品' },
      },
      {
        path: 'goods/edit/:id',
        name: 'GoodsEdit',
        component: () => import('../views/Goods/GoodsEdit.vue'),
        meta: { title: '编辑商品' },
      },
      {
        path: 'goods/:id/price',
        name: 'GoodsEditPrice',
        component: () => import('../views/Goods/EditPrice.vue'),
        meta: { title: '编辑价格' },
      },
      {
        path: 'goods/:id',
        name: 'GoodsDetail',
        component: () => import('../views/Goods/GoodsDetail.vue'),
        meta: { title: '商品详情' },
      },
      {
        path: 'orders',
        name: 'OrderList',
        component: () => import('../views/Orders/List.vue'),
        meta: { title: '订单管理' },
      },
      {
        path: 'orders/:orderSn',
        name: 'OrderDetail',
        component: () => import('../views/Orders/Detail.vue'),
        meta: { title: '订单详情' },
      },
      {
        path: 'orders/:orderSn/handle',
        name: 'OrderStatusHandle',
        component: () => import('../views/Orders/StatusHandle.vue'),
        meta: { title: '订单处理' },
      },
      {
        path: 'orders/:orderSn/schedule',
        name: 'OrderSchedule',
        component: () => import('../views/Orders/OrderSchedule.vue'),
        meta: { title: '订单进度' },
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
