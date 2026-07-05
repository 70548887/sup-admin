export interface DashboardStats {
  todayOrders: number
  todayRevenue: string
  todayNewUsers: number
  totalOrders: number
  totalRevenue: string
  totalUsers: number
}

export interface TrendPoint {
  date: string
  revenue: string
  orders: number
}

export interface HotGoodsItem {
  goodsId: number
  goodsName: string
  salesCount: number
  revenue: string
}
