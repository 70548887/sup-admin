import axios from 'axios'
import type { ApiResponse } from './types'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
  withCredentials: true, // 启用Cookie跨域携带
  headers: {
    'Content-Type': 'application/json',
  },
})

// 从document.cookie中读取指定cookie值
function getCookie(name: string): string | undefined {
  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'))
  return match ? decodeURIComponent(match[2]) : undefined
}

// 请求拦截器：自动添加Authorization Bearer token + CSRF token
apiClient.interceptors.request.use(
  (config) => {
    // 保留localStorage token作为备用（兼容API调用方式）
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }

    // CSRF token：对写操作自动添加X-CSRF-Token header
    const method = config.method?.toLowerCase() || ''
    if (['post', 'put', 'delete', 'patch'].includes(method)) {
      const csrfToken = getCookie('csrf_token')
      if (csrfToken) {
        config.headers['X-CSRF-Token'] = csrfToken
      }
    }

    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// 响应拦截器：统一处理 {code, message, data} 格式
apiClient.interceptors.response.use(
  (response) => {
    const res = response.data as ApiResponse

    // code=0 表示成功
    if (res.code === 0) {
      return res.data
    }

    // code=100 表示token过期/未认证，自动清除token跳转登录
    if (res.code === 100) {
      localStorage.removeItem('token')
      window.location.href = '/login'
      return Promise.reject(new Error(res.message || '登录已过期，请重新登录'))
    }

    // 其他业务错误
    return Promise.reject(new Error(res.message || '请求失败'))
  },
  (error) => {
    // 网络错误或HTTP错误
    const message = error.response?.data?.message || error.message || '网络错误'
    return Promise.reject(new Error(message))
  }
)
