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
        redirect: '/goods',
      },
      {
        path: 'goods',
        name: 'GoodsList',
        component: () => import('../views/Goods/List.vue'),
        meta: { title: '商品管理' },
      },
      {
        path: 'goods/:id',
        name: 'GoodsDetail',
        component: () => import('../views/Goods/Detail.vue'),
        meta: { title: '商品详情' },
      },
      {
        path: 'goods/:id/edit',
        name: 'GoodsEdit',
        component: () => import('../views/Goods/Edit.vue'),
        meta: { title: '编辑商品' },
      },
      {
        path: 'goods/:id/price',
        name: 'GoodsEditPrice',
        component: () => import('../views/Goods/EditPrice.vue'),
        meta: { title: '编辑价格' },
      },
      {
        path: 'orders',
        name: 'OrderList',
        component: () => import('../views/Orders/List.vue'),
        meta: { title: '订单管理' },
      },
      {
        path: 'orders/:id',
        name: 'OrderDetail',
        component: () => import('../views/Orders/Detail.vue'),
        meta: { title: '订单详情' },
      },
      {
        path: 'orders/:id/handle',
        name: 'OrderStatusHandle',
        component: () => import('../views/Orders/StatusHandle.vue'),
        meta: { title: '订单处理' },
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
