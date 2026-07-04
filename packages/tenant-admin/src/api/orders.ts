import { apiClient } from '@sup/shared'
import type { PaginatedResponse, Order } from '@sup/shared'

export interface TenantOrderDetail extends Order {
  customerName: string
  paymentMethod: string
  paidAt: number
  completedAt: number
  remark: string
  cards: { cardNo: string; cardPassword: string }[]
}

export async function getTenantOrders(params: Record<string, any>): Promise<PaginatedResponse<Order>> {
  return apiClient.get('/tenant-admin/orders', { params }) as unknown as PaginatedResponse<Order>
}

export async function getTenantOrderDetail(id: number): Promise<TenantOrderDetail> {
  return apiClient.get(`/tenant-admin/orders/${id}`) as unknown as TenantOrderDetail
}
