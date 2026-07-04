import { apiClient } from '@sup/shared'
import type { PaginatedResponse } from '@sup/shared'

export interface Recharge {
  id: number
  tenantId: number
  userId: number
  username: string
  amount: string
  paymentMethod: string
  proof: string
  status: number
  createdAt: number
  updatedAt: number
}

export const RECHARGE_STATUS: Record<number, string> = {
  0: '待审核',
  1: '已通过',
  2: '已拒绝',
}

export async function getRechargeList(params: Record<string, any>): Promise<PaginatedResponse<Recharge>> {
  return apiClient.get('/admin/recharges', { params }) as unknown as PaginatedResponse<Recharge>
}

export async function approveRecharge(id: number): Promise<void> {
  return apiClient.post(`/admin/recharges/${id}/approve`) as unknown as Promise<void>
}

export async function rejectRecharge(id: number, reason: string): Promise<void> {
  return apiClient.post(`/admin/recharges/${id}/reject`, { reason }) as unknown as Promise<void>
}
