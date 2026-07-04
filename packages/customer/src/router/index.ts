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
        component: () => import('../views/Goods/Detail.vue'),
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
        component: () => import('../views/Orders/List.vue'),
        meta: { title: '我的订单' },
      },
      {
        path: 'orders/:id',
        name: 'OrderDetail',
        component: () => import('../views/Orders/Detail.vue'),
        meta: { title: '订单详情' },
      },
      {
        path: 'account',
        name: 'Account',
        component: () => import('../views/Account.vue'),
        meta: { title: '我的账户' },
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
