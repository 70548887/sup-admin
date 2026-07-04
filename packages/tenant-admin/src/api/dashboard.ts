import { apiClient } from '@sup/shared'

export interface TenantDashboard {
  totalOrders: number
  todayOrders: number
  totalRevenue: number
  todayRevenue: number
  totalGoods: number
  activeGoods: number
  recentOrders: { id: number; orderSn: string; amount: number; status: number; createdAt: number }[]
}

export async function getTenantDashboard(): Promise<TenantDashboard> {
  return apiClient.get('/tenant-admin/dashboard') as unknown as TenantDashboard
}
