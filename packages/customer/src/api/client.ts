import axios from 'axios'

export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

const customerClient = axios.create({
  baseURL: '',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
})

// 请求拦截器：自动添加 JWT Bearer token
customerClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('customer_token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => Promise.reject(error)
)

// 响应拦截器：统一处理
customerClient.interceptors.response.use(
  (response) => {
    const res = response.data as ApiResponse
    if (res.code === 0) return res.data
    if (res.code === 100) {
      localStorage.removeItem('customer_token')
      window.location.href = '/login'
      return Promise.reject(new Error('认证失败，请重新登录'))
    }
    return Promise.reject(new Error(res.message || '请求失败'))
  },
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('customer_token')
      window.location.href = '/login'
    }
    return Promise.reject(new Error(error.response?.data?.message || error.message || '网络错误'))
  }
)

export { customerClient }
