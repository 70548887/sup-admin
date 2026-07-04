import { apiClient } from '@sup/shared'
import type { PaginatedResponse } from '@sup/shared'

export interface Refund {
  id: number
  tenantId: number
  orderId: number
  orderSn: string
  customerId: number
  customerName: string
  amount: string
  reason: string
  status: number
  createdAt: number
  updatedAt: number
}

export const REFUND_STATUS: Record<number, string> = {
  0: '待审核',
  1: '已通过',
  2: '已拒绝',
}

export async function getRefundList(params: Record<string, any>): Promise<PaginatedResponse<Refund>> {
  return apiClient.get('/admin/refunds', { params }) as unknown as PaginatedResponse<Refund>
}

export async function approveRefund(id: number): Promise<void> {
  return apiClient.post(`/admin/refunds/${id}/approve`) as unknown as Promise<void>
}

export async function rejectRefund(id: number, reason: string): Promise<void> {
  return apiClient.post(`/admin/refunds/${id}/reject`, { reason }) as unknown as Promise<void>
}
