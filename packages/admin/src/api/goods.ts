import { apiClient } from '@sup/shared'
import type { Goods, PaginatedResponse } from '@sup/shared'

export async function getGoodsList(params: Record<string, any>): Promise<PaginatedResponse<Goods>> {
  return apiClient.get('/admin/goods', { params }) as unknown as PaginatedResponse<Goods>
}

export async function updateGoodsStatus(id: number, status: number): Promise<void> {
  return apiClient.patch(`/admin/goods/${id}/status`, { status }) as unknown as Promise<void>
}

export async function getPendingGoods(params: Record<string, any>): Promise<PaginatedResponse<Goods>> {
  return apiClient.get('/admin/goods/pending', { params }) as unknown as PaginatedResponse<Goods>
}

export async function approveGoods(id: number): Promise<void> {
  return apiClient.post(`/admin/goods/${id}/approve`) as unknown as Promise<void>
}

export async function rejectGoods(id: number, reason: string): Promise<void> {
  return apiClient.post(`/admin/goods/${id}/reject`, { reason }) as unknown as Promise<void>
}
