import { apiClient } from '@sup/shared'
import type { DashboardStats } from '@sup/shared'

export async function getDashboardStats(): Promise<DashboardStats> {
  return apiClient.get('/admin/analytics/dashboard') as unknown as DashboardStats
}

export interface TrendData {
  date: string
  revenue: number
  orderCount: number
}

export interface HotGoodsItem {
  goodsId: number
  goodsName: string
  salesCount: number
  revenue: number
}

export interface OrderStatsData {
  date: string
  total: number
  completed: number
  cancelled: number
  pending: number
}

export interface CustomerStatsData {
  date: string
  newCustomers: number
  activeCustomers: number
  totalCustomers: number
}

export async function getRevenueTrend(params: { startDate: string; endDate: string }): Promise<TrendData[]> {
  return apiClient.get('/admin/analytics/trend', { params }) as unknown as TrendData[]
}

export async function getHotGoods(params?: { limit?: number }): Promise<HotGoodsItem[]> {
  return apiClient.get('/admin/analytics/hot-goods', { params }) as unknown as HotGoodsItem[]
}

export async function getOrderStats(params: { startDate: string; endDate: string }): Promise<OrderStatsData[]> {
  return apiClient.get('/admin/analytics/order-stats', { params }) as unknown as OrderStatsData[]
}

export async function getCustomerStats(params: { startDate: string; endDate: string }): Promise<CustomerStatsData[]> {
  return apiClient.get('/admin/analytics/customer-stats', { params }) as unknown as CustomerStatsData[]
}
