import axios from 'axios'
import { createLegacyHeaders, hasCredentials } from './legacyAuth'

export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

const supplierClient = axios.create({
  baseURL: '',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// 请求拦截器：自动添加 Legacy 签名头
supplierClient.interceptors.request.use(
  (config) => {
    const url = config.url || ''
    const headers = createLegacyHeaders(url)
    Object.entries(headers).forEach(([key, value]) => {
      config.headers[key] = value
    })
    return config
  },
  (error) => Promise.reject(error)
)

// 响应拦截器：统一处理 {code, message, data} 格式
supplierClient.interceptors.response.use(
  (response) => {
    const res = response.data as ApiResponse

    // code=0 表示成功
    if (res.code === 0) {
      return res.data
    }

    // code=100 表示认证失败
    if (res.code === 100) {
      if (hasCredentials()) {
        window.location.href = '/login'
      }
      return Promise.reject(new Error(res.message || '认证失败，请重新登录'))
    }

    return Promise.reject(new Error(res.message || '请求失败'))
  },
  (error) => {
    const message = error.response?.data?.message || error.message || '网络错误'
    return Promise.reject(new Error(message))
  }
)

export { supplierClient }
