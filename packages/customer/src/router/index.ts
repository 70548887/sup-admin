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
    path: '/register',
    name: 'Register',
    component: () => import('../views/Register.vue'),
    meta: { requiresAuth: false, title: '注册' },
  },
  {
    path: '/',
    component: () => import('../layouts/CustomerLayout.vue'),
    meta: { requiresAuth: true },
    children: [
      {
        path: '',
        redirect: '/goods',
      },
      {
        path: 'goods',
        name: 'GoodsList',
        component: () => import('../views/Goods/List.vue'),
        meta: { title: '商品列表' },
      },
      {
        path: 'goods/:id',
        name: 'GoodsDetail',
        component: () => import('../views/Goods/GoodsDetail.vue'),
        meta: { title: '商品详情' },
      },
      {
        path: 'categories',
        name: 'Categories',
        component: () => import('../views/Goods/Categories.vue'),
        meta: { title: '商品分类' },
      },
      {
        path: 'orders',
        name: 'OrderList',
        component: () => import('../views/Orders/OrderList.vue'),
        meta: { title: '我的订单' },
      },
      {
        path: 'orders/:id',
        name: 'OrderDetail',
        component: () => import('../views/Orders/OrderDetail.vue'),
        meta: { title: '订单详情' },
      },
      {
        path: 'order/create',
        name: 'OrderCreate',
        component: () => import('../views/Orders/OrderCreate.vue'),
        meta: { title: '确认下单' },
      },
      {
        path: 'order/pay/:orderSn',
        name: 'OrderPay',
        component: () => import('../views/Orders/OrderPay.vue'),
        meta: { title: '订单支付' },
      },
      {
        path: 'account',
        name: 'Account',
        component: () => import('../views/Account/Account.vue'),
        meta: { title: '我的账户' },
      },
      {
        path: 'account/recharge',
        name: 'Recharge',
        component: () => import('../views/Account/Recharge.vue'),
        meta: { title: '账户充值' },
      },
      {
        path: 'account/api-keys',
        name: 'ApiKeys',
        component: () => import('../views/Account/ApiKeys.vue'),
        meta: { title: 'API 密钥' },
      },
      {
        path: 'orders/refund',
        name: 'OrderRefund',
        component: () => import('../views/Orders/Refund.vue'),
        meta: { title: '退款申请' },
      },
      {
        path: 'goods/search',
        name: 'GoodsSearch',
        component: () => import('../views/Goods/Search.vue'),
        meta: { title: '商品搜索' },
      },
      {
        path: 'orders/:orderSn/track',
        name: 'OrderTrack',
        component: () => import('../views/Orders/Track.vue'),
        meta: { title: '订单追踪' },
      },
      // --- Developer ---
      {
        path: 'developer',
        name: 'DeveloperCenter',
        component: () => import('../views/Developer/AppList.vue'),
        meta: { title: '开发者中心' },
      },
      {
        path: 'developer/create',
        name: 'AppCreate',
        component: () => import('../views/Developer/AppCreate.vue'),
        meta: { title: '新建应用' },
      },
      {
        path: 'developer/detail',
        name: 'AppDetail',
        component: () => import('../views/Developer/AppDetail.vue'),
        meta: { title: '应用详情' },
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
