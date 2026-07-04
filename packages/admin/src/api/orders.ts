import { apiClient } from '@sup/shared'
import type { Order, PaginatedResponse } from '@sup/shared'

export interface OrderDetail extends Order {
  customerName: string
  supplierName: string
  paymentMethod: string
  paidAt: number
  completedAt: number
  remark: string
}

export async function getOrderList(params: Record<string, any>): Promise<PaginatedResponse<Order>> {
  return apiClient.get('/admin/orders', { params }) as unknown as PaginatedResponse<Order>
}

export async function getOrderDetail(id: number): Promise<OrderDetail> {
  return apiClient.get(`/admin/orders/${id}`) as unknown as OrderDetail
}

export async function updateOrderStatus(id: number, status: number): Promise<void> {
  return apiClient.post(`/admin/orders/${id}/status`, { status }) as unknown as Promise<void>
}
