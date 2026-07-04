// 统一响应
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

// 分页
export interface PaginatedResponse<T> {
  list: T[]
  total: number
  page: number
  size: number
}

// 订单
export interface Order {
  id: number
  tenantId: number
  orderSn: string
  customerId: number
  supplierId: number
  goodsId: number
  goodsName: string
  status: number
  amount: string
  buyNumber: number
  unitPrice: string
  createdAt: number
  updatedAt: number
}

// 商品
export interface Goods {
  id: number
  tenantId: number
  serialNumber: string
  categoryId: number
  supplierId: number
  name: string
  price: string
  costPrice: string
  stock: number
  status: number
  createdAt: number
}

// 用户
export interface User {
  id: number
  tenantId: number
  username: string
  nickname: string
  email: string
  phone: string
  role: string
  status: number
  createdAt: number
}

// 统计
export interface DashboardStats {
  today: PeriodStats
  yesterday: PeriodStats
  week: PeriodStats
  month: PeriodStats
}

export interface PeriodStats {
  totalOrders: number
  totalAmount: string
  totalRefunds: number
  refundAmount: string
}
