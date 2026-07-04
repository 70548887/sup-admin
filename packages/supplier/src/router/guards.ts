import type { Router } from 'vue-router'
import { hasCredentials } from '@/api/legacyAuth'

export function setupGuards(router: Router) {
  router.beforeEach((to, _from, next) => {
    // 如果目标路由不需要认证，直接放行
    if (to.meta.requiresAuth === false) {
      next()
      return
    }

    // 需要认证但未登录，跳转登录页
    if (!hasCredentials()) {
      next({ name: 'Login', query: { redirect: to.fullPath } })
      return
    }

    next()
  })
}
