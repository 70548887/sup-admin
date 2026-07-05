import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

export const useAuthStore = defineStore('auth', () => {
  const token = ref(localStorage.getItem('token') || '')
  const userInfo = ref<any>(null)

  // 认证状态：优先检查localStorage token（兼容API方式），Cookie由浏览器自动管理
  const isAuthenticated = computed(() => !!token.value)

  function setToken(newToken: string) {
    token.value = newToken
    localStorage.setItem('token', newToken)
  }

  function setUserInfo(info: any) {
    userInfo.value = info
  }

  function logout() {
    token.value = ''
    userInfo.value = null
    localStorage.removeItem('token')
    // Cookie由后端通过Set-Cookie清除，或前端可主动过期
    document.cookie = 'auth_token=; path=/; max-age=0'
  }

  return { token, userInfo, isAuthenticated, setToken, setUserInfo, logout }
})
