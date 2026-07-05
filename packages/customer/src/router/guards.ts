import type { Router } from 'vue-router'

export function setupGuards(router: Router) {
  router.beforeEach((to, _from, next) => {
    // 如果目标路由不需要认证，直接放行
    if (to.meta.requiresAuth === false) {
      next()
      return
    }

    // 需要认证但未登录，跳转登录页
    const token = localStorage.getItem('customer_token')
    if (!token) {
      next({ name: 'Login', query: { redirect: to.fullPath } })
      return
    }

    next()
  })
}
