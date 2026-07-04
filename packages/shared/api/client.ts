import axios from 'axios'
import type { ApiResponse } from './types'

export const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器：自动添加Authorization Bearer token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
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
